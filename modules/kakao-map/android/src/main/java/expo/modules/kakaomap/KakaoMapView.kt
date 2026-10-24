package expo.modules.kakaomap

import android.content.Context
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.KakaoMapSdk
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import expo.modules.kotlin.viewevent.EventDispatcher

class KakaoMapView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true
  val onMapReady by EventDispatcher<Unit>()
  val onMapError by EventDispatcher<Map<String, String>>()
  var appKey = ""
  var active = true
  private var foreground = true
  private var mapView: MapView? = null
  private var disposed = false

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    updateState()
  }

  override fun onDetachedFromWindow() {
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
  }
}
