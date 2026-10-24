import ExpoModulesCore

public class KakaoMapModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PawStepKakaoMap")
    View(KakaoMapView.self) {
      Events("onMapReady", "onMapError")
      Prop("appKey") { (view: KakaoMapView, value: String) in view.appKey = value }
      Prop("active") { (view: KakaoMapView, value: Bool) in view.active = value }
      OnViewDidUpdateProps { (view: KakaoMapView) in view.updateState() }
    }
  }
}
