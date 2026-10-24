package expo.modules.kakaomap

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class KakaoMapModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PawStepKakaoMap")
    View(KakaoMapView::class) {
      Events("onMapReady", "onMapError")
      Prop("appKey") { view: KakaoMapView, value: String -> view.appKey = value }
      Prop("active") { view: KakaoMapView, value: Boolean -> view.active = value }
      OnViewDidUpdateProps { view: KakaoMapView -> view.updateState() }
      OnViewDestroys { view: KakaoMapView -> view.destroy() }
    }
  }
}
