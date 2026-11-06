package expo.modules.kakaomap

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.RectF
import android.graphics.Typeface
import android.view.MotionEvent
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.KakaoMapSdk
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import com.kakao.vectormap.camera.CameraUpdateFactory
import com.kakao.vectormap.label.CompetitionType
import com.kakao.vectormap.label.Label
import com.kakao.vectormap.label.LabelLayer
import com.kakao.vectormap.label.LabelLayerOptions
import com.kakao.vectormap.label.LabelOptions
import com.kakao.vectormap.label.LabelStyle
import com.kakao.vectormap.label.LabelStyles
import com.kakao.vectormap.route.RouteLine
import com.kakao.vectormap.route.RouteLineLayer
import com.kakao.vectormap.route.RouteLineOptions
import com.kakao.vectormap.route.RouteLineSegment
import com.kakao.vectormap.route.RouteLineStyle
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import expo.modules.kotlin.viewevent.EventDispatcher
import kotlin.math.ceil

class KakaoMapView(context: Context, appContext: AppContext) :
    ExpoView(context, appContext) {
    override val shouldUseAndroidLayout = true
    val onMapReady by EventDispatcher<Unit>()
    val onMapError by EventDispatcher<Map<String, String>>()
    var appKey = ""
    var active = true
    var routeCoordinates: List<Map<String, Double>> = emptyList()
        set(value) {
            if (field != value) {
                field = value
                routeDirty = true
            }
        }
    private var foreground = true
    private var mapView: MapView? = null
    private var kakaoMap: KakaoMap? = null
    private var endpointLayer: LabelLayer? = null
    private var startStyles: LabelStyles? = null
    private var endStyles: LabelStyles? = null
    private var sharedStyles: LabelStyles? = null
    private var startLabel: Label? = null
    private var endLabel: Label? = null
    private var sharedLabel: Label? = null
    private var routeLayer: RouteLineLayer? = null
    private var routeLine: RouteLine? = null
    private var routeStyle: RouteLineStyle? = null
    private var routeDirty = true
    private var centeredOnRoute = false
    private var disposed = false

    override fun dispatchTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> parent?.requestDisallowInterceptTouchEvent(true)
        }
        val handled = super.dispatchTouchEvent(event)
        when (event.actionMasked) {
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL ->
                parent?.requestDisallowInterceptTouchEvent(false)
        }
        return handled
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        updateState()
    }

    override fun onDetachedFromWindow() {
        parent?.requestDisallowInterceptTouchEvent(false)
        mapView?.pause()
        super.onDetachedFromWindow()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        updateState()
    }

    fun updateState() {
        if (disposed) return
        val visible = active && foreground && isAttachedToWindow
        if (mapView == null && visible && width > 0 && height > 0 && appKey.isNotBlank()) {
            try {
                KakaoMapSdk.init(context.applicationContext, appKey)
                val nativeMap = MapView(context)
                mapView = nativeMap
                addView(nativeMap, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
                nativeMap.start(object : MapLifeCycleCallback() {
                    override fun onMapDestroy() {}
                    override fun onMapError(error: Exception) {
                        if (!disposed) this@KakaoMapView.onMapError(mapOf("message" to (error.message ?: "Kakao Map error")))
                    }
                }, object : KakaoMapReadyCallback() {
                    override fun getPosition(): LatLng = LatLng.from(37.5665, 126.9780)
                    override fun getZoomLevel(): Int = 16
                    override fun onMapReady(kakaoMap: KakaoMap) {
                        if (!disposed) {
                            this@KakaoMapView.kakaoMap = kakaoMap
                            prepareOverlays(kakaoMap)
                            updateState()
                            this@KakaoMapView.onMapReady(Unit)
                        }
                    }
                })
            } catch (error: Exception) {
                onMapError(mapOf("message" to (error.message ?: "Unable to start Kakao Map")))
            }
        }
        if (visible) mapView?.resume() else mapView?.pause()
        renderRoute()
    }

    private fun prepareOverlays(map: KakaoMap) {
        routeLayer = map.routeLineManager?.addLayer("walk-route", 0)
        // Figma's 15px route uses the same 1/6 scale as the 168px-wide badge.
        routeStyle = RouteLineStyle.from(2.5f * resources.displayMetrics.density,
            Color.parseColor("#688F6E"))
        val manager = map.labelManager ?: return
        endpointLayer = manager.addLayer(LabelLayerOptions.from("walk-endpoints")
            .setCompetitionType(CompetitionType.None).setZOrder(10000))
        fun styles(id: String, title: String, color: String): LabelStyles? = manager.addLabelStyles(
            LabelStyles.from(id, LabelStyle.from(endpointImage(title, Color.parseColor(color)))
                .setApplyDpScale(false).setAnchorPoint(0.5f, 1f))
        )
        startStyles = styles("walk-start", "출발", "#688F6E")
        endStyles = styles("walk-end", "도착", "#E36163")
        sharedStyles = styles("walk-shared", "", "#688F6E")
        if (endpointLayer == null || startStyles == null || endStyles == null || sharedStyles == null || routeLayer == null) {
            onMapError(mapOf("message" to "지도 경로와 뱃지를 불러오지 못했습니다."))
        }
        routeDirty = true
    }

    private fun renderRoute() {
        val map = kakaoMap ?: return
        val layer = endpointLayer ?: return
        val startStyle = startStyles ?: return
        val endStyle = endStyles ?: return
        val sharedStyle = sharedStyles ?: return
        val lines = routeLayer ?: return
        val lineStyle = routeStyle ?: return
        if (!routeDirty) return
        routeDirty = false
        val points = mutableListOf<LatLng>()
        for (coordinate in routeCoordinates) {
            val lat = coordinate["latitude"]
            val lon = coordinate["longitude"]
            if (lat == null || lon == null || !lat.isFinite() || !lon.isFinite() ||
                lat !in -90.0..90.0 || lon !in -180.0..180.0) {
                startLabel?.hide()
                endLabel?.hide()
                sharedLabel?.hide()
                routeLine?.hide()
                onMapError(mapOf("message" to "경로에 유효하지 않은 좌표가 있습니다."))
                return
            }
            val point = LatLng.from(lat, lon)
            if (points.lastOrNull() != point) points.add(point)
        }
        val first = points.firstOrNull()
        if (first == null) {
            startLabel?.hide()
            endLabel?.hide()
            sharedLabel?.hide()
            routeLine?.hide()
            return
        }
        if (points.size > 1) {
            val segment = RouteLineSegment.from(points, lineStyle)
            if (routeLine == null) {
                routeLine = lines.addRouteLine(RouteLineOptions.from("walk-route", segment))
            } else {
                routeLine?.changeSegments(segment)
            }
            routeLine?.show()
        } else {
            routeLine?.hide()
        }
        if (first == points.last()) {
            startLabel?.hide()
            endLabel?.hide()
            if (sharedLabel == null) {
                sharedLabel = layer.addLabel(LabelOptions.from("walk-shared", first).setStyles(sharedStyle))
            } else {
                sharedLabel?.moveTo(first)
            }
            sharedLabel?.show()
        } else {
            sharedLabel?.hide()
            if (startLabel == null) {
                startLabel = layer.addLabel(LabelOptions.from("walk-start", first).setStyles(startStyle))
            } else {
                startLabel?.moveTo(first)
            }
            startLabel?.show()
            if (points.size > 1) {
                if (endLabel == null) {
                    endLabel = layer.addLabel(LabelOptions.from("walk-end", points.last()).setStyles(endStyle))
                } else {
                    endLabel?.moveTo(points.last())
                }
                endLabel?.show()
            } else {
                endLabel?.hide()
            }
        }
        if (!centeredOnRoute) {
            map.moveCamera(CameraUpdateFactory.newCenterPosition(first, 16))
            centeredOnRoute = true
        }
    }

    private fun endpointImage(title: String, color: Int): Bitmap {
        val density = resources.displayMetrics.density * 0.5f
        if (title.isEmpty()) {
            val bitmap = Bitmap.createBitmap(ceil(36.9997f * density).toInt(), ceil(51.8417f * density).toInt(),
                Bitmap.Config.ARGB_8888)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
                isFilterBitmap = true
            }
            val pin = BitmapFactory.decodeResource(resources, R.drawable.walk_pin)
            Canvas(bitmap).drawBitmap(pin, null, RectF(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat()), paint)
            return bitmap
        }
        val bitmap = Bitmap.createBitmap(ceil(56 * density).toInt(), ceil(84.675f * density).toInt(),
            Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.scale(density, density)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            style = Paint.Style.FILL_AND_STROKE
            strokeWidth = 1f
        }
        canvas.drawRoundRect(RectF(0.5f, 0.5f, 55.5f, 27.833f), 16.667f, 16.667f, paint)
        paint.apply {
            style = Paint.Style.FILL
            this.color = Color.WHITE
            textSize = 53f / 3
            textAlign = Paint.Align.CENTER
            typeface = Typeface.createFromAsset(context.assets, "fonts/ownglyph_pdh.ttf")
        }
        val metrics = paint.fontMetrics
        canvas.drawText(title, 28f, (85f / 3 - metrics.ascent - metrics.descent) / 2, paint)
        val pin = BitmapFactory.decodeResource(resources, R.drawable.walk_pin)
        paint.apply {
            colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
            isFilterBitmap = true
        }
        canvas.drawBitmap(pin, null, RectF(9.5f, 32.833f, 46.4997f, 84.6747f), paint)
        return bitmap
    }

    fun setForeground(value: Boolean) {
        foreground = value
        updateState()
    }

    fun destroy() {
        if (disposed) return
        disposed = true
        mapView?.pause()
        mapView?.finish()
        removeAllViews()
        mapView = null
        kakaoMap = null
        endpointLayer = null
        startLabel = null
        endLabel = null
        sharedLabel = null
        startStyles = null
        endStyles = null
        sharedStyles = null
        routeLayer = null
        routeLine = null
        routeStyle = null
    }
}
