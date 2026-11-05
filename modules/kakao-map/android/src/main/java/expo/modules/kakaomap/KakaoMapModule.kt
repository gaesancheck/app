package expo.modules.kakaomap

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Collections
import java.util.WeakHashMap

class KakaoMapModule : Module() {
    private val views = Collections.newSetFromMap(WeakHashMap<KakaoMapView, Boolean>())
    private var foreground = true

    override fun definition() = ModuleDefinition {
        Name("PawStepKakaoMap")
        OnActivityEntersForeground {
            foreground = true
            views.toList().forEach { it.setForeground(true) }
        }
        OnActivityEntersBackground {
            foreground = false
            views.toList().forEach { it.setForeground(false) }
        }
        OnActivityDestroys {
            foreground = false
            views.toList().forEach { it.destroy() }
            views.clear()
        }
        View(KakaoMapView::class) {
            Events("onMapReady", "onMapError")
            Prop("appKey") { view: KakaoMapView, value: String -> view.appKey = value }
            Prop("active") { view: KakaoMapView, value: Boolean -> view.active = value }
            OnViewDidUpdateProps { view: KakaoMapView ->
                views.add(view)
                view.setForeground(foreground)
            }
            OnViewDestroys { view: KakaoMapView ->
                views.remove(view)
                view.destroy()
            }
        }
    }
}
