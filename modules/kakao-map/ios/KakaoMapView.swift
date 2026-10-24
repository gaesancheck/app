import ExpoModulesCore
import KakaoMapsSDK

final class KakaoMapView: ExpoView, MapControllerDelegate {
  let onMapReady = EventDispatcher()
  let onMapError = EventDispatcher()
  var appKey = ""
  var active = true
  private var controller: KMController?
  private var container: KMViewContainer?
  private var authenticated = false
  private var isForeground = UIApplication.shared.applicationState == .active

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    NotificationCenter.default.addObserver(self, selector: #selector(background),
      name: UIApplication.willResignActiveNotification, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(foreground),
      name: UIApplication.didBecomeActiveNotification, object: nil)
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    controller?.pauseEngine()
    controller?.resetEngine()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    container?.frame = bounds
    updateState()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateState()
  }

  func updateState() {
    let visible = active && isForeground && window != nil
    if controller == nil && visible && !appKey.isEmpty && bounds.width > 0 && bounds.height > 0 {
      SDKInitializer.InitSDK(appKey: appKey)
      let mapContainer = KMViewContainer(frame: bounds)
      container = mapContainer
      addSubview(mapContainer)
      controller = KMController(viewContainer: mapContainer)
      controller?.delegate = self
      controller?.prepareEngine()
    }
    if visible && authenticated {
      if controller?.isEngineActive == false { controller?.activateEngine() }
    } else {
      controller?.pauseEngine()
    }
  }

  @objc private func background() {
    isForeground = false
    updateState()
  }
  @objc private func foreground() {
    isForeground = true
    updateState()
  }

  func authenticationSucceeded() {
    authenticated = true
    updateState()
  }

  func authenticationFailed(_ errorCode: Int, desc: String) {
    authenticated = false
    onMapError(["message": "\(errorCode): \(desc)"])
  }

  func addViews() {
    controller?.addView(MapviewInfo(viewName: "walk", viewInfoName: "map",
      defaultPosition: MapPoint(longitude: 126.9780, latitude: 37.5665), defaultLevel: 16))
  }

  func addViewSucceeded(_ viewName: String, viewInfoName: String) {
    containerDidResized(bounds.size)
    onMapReady([:])
  }

  func addViewFailed(_ viewName: String, viewInfoName: String) {
    onMapError(["message": "Unable to create Kakao Map view"])
  }

  func containerDidResized(_ size: CGSize) {
    (controller?.getView("walk") as? KakaoMap)?.viewRect = CGRect(origin: .zero, size: size)
  }
}
