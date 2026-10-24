import ExpoModulesCore
import KakaoMapsSDK

final class KakaoMapView: ExpoView, MapControllerDelegate {
  let onMapReady = EventDispatcher()
  let onMapError = EventDispatcher()
  var appKey = ""
  var active = true
  var routeCoordinates: [[String: Double]] = [] {
    didSet { if oldValue != routeCoordinates { routeDirty = true } }
  }
  private var routeDirty = true
  private var overlaysReady = false
  private var overlayRevision = 0
  private var routeID: String?
  private var markerIDs: [String] = []
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
    renderRoute()
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
    prepareOverlays()
    renderRoute()
    onMapReady([:])
  }

  func addViewFailed(_ viewName: String, viewInfoName: String) {
    onMapError(["message": "Unable to create Kakao Map view"])
  }

  func containerDidResized(_ size: CGSize) {
    (controller?.getView("walk") as? KakaoMap)?.viewRect = CGRect(origin: .zero, size: size)
  }

  private func prepareOverlays() {
    guard !overlaysReady, let map = controller?.getView("walk") as? KakaoMap else { return }
    let routes = map.getRouteManager()
    _ = routes.addRouteLayer(layerID: "walk-route", zOrder: 0)
    let style = RouteStyle(styles: [PerLevelRouteStyle(width: 12, color: .systemGreen,
      strokeWidth: 2, strokeColor: .white, level: 0)])
    let styles = RouteStyleSet(styleID: "walk-route-style")
    styles.addStyle(style)
    routes.addRouteStyleSet(styles)

    let labels = map.getLabelManager()
    _ = labels.addLabelLayer(option: LabelLayerOptions(layerID: "walk-endpoints",
      competitionType: .none, competitionUnit: .poi, orderType: .rank, zOrder: 100))
    for (id, title, color) in [("start", "출발", UIColor.systemGreen), ("end", "도착", UIColor.systemRed)] {
      let icon = PoiIconStyle(symbol: endpointImage(title: title, color: color),
        anchorPoint: CGPoint(x: 0.5, y: 1))
      labels.addPoiStyle(PoiStyle(styleID: "walk-\(id)",
        styles: [PerLevelPoiStyle(iconStyle: icon, level: 0)]))
    }
    overlaysReady = true
  }

  private func renderRoute() {
    guard overlaysReady, routeDirty,
      let map = controller?.getView("walk") as? KakaoMap else { return }
    routeDirty = false
    let layer = map.getRouteManager().getRouteLayer(layerID: "walk-route")
    let labels = map.getLabelManager().getLabelLayer(layerID: "walk-endpoints")
    if let routeID { layer?.removeRoute(routeID: routeID) }
    labels?.removePois(poiIDs: markerIDs)
    routeID = nil
    markerIDs = []

    var points: [MapPoint] = []
    var previous: (Double, Double)?
    for coordinate in routeCoordinates {
      guard let lat = coordinate["latitude"], let lon = coordinate["longitude"],
        lat.isFinite, lon.isFinite, (-90...90).contains(lat), (-180...180).contains(lon) else {
        onMapError(["message": "경로에 유효하지 않은 좌표가 있습니다."])
        return
      }
      if let previous, previous.0 == lat && previous.1 == lon { continue }
      points.append(MapPoint(longitude: lon, latitude: lat))
      previous = (lat, lon)
    }
    guard let first = points.first else { return }
    overlayRevision += 1
    if points.count > 1 {
      let id = "route-\(overlayRevision)"
      let option = RouteOptions(routeID: id, styleID: "walk-route-style", zOrder: 0)
      option.segments = [RouteSegment(points: points, styleIndex: 0)]
      layer?.addRoute(option: option)?.show()
      routeID = id
    }
    let endpoints = points.count > 1 ? [("start", first), ("end", points.last!)] : [("start", first)]
    for (kind, point) in endpoints {
      let id = "\(kind)-\(overlayRevision)"
      let option = PoiOptions(styleID: "walk-\(kind)", poiID: id)
      labels?.addPoi(option: option, at: point)?.show()
      markerIDs.append(id)
    }
    if overlayRevision == 1 {
      map.moveCamera(CameraUpdate.make(target: first, zoomLevel: 16, mapView: map))
    }
  }

  private func endpointImage(title: String, color: UIColor) -> UIImage {
    UIGraphicsImageRenderer(size: CGSize(width: 56, height: 42)).image { _ in
      color.setFill()
      UIBezierPath(roundedRect: CGRect(x: 0, y: 0, width: 56, height: 34), cornerRadius: 12).fill()
      let tip = UIBezierPath()
      tip.move(to: CGPoint(x: 22, y: 32))
      tip.addLine(to: CGPoint(x: 28, y: 42))
      tip.addLine(to: CGPoint(x: 34, y: 32))
      tip.close()
      tip.fill()
      let paragraph = NSMutableParagraphStyle()
      paragraph.alignment = .center
      (title as NSString).draw(in: CGRect(x: 0, y: 7, width: 56, height: 24), withAttributes: [
        .font: UIFont.boldSystemFont(ofSize: 15), .foregroundColor: UIColor.white,
        .paragraphStyle: paragraph
      ])
    }
  }
}
