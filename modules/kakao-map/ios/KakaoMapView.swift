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
    private var lockedScrollViews: [(UIScrollView, Bool)] = []

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        clipsToBounds = true
        let touchObserver = MapTouchObserver(target: nil, action: nil)
        touchObserver.cancelsTouchesInView = false
        touchObserver.onTouchChange = { [weak self] touching in
            self?.setParentScrollingLocked(touching)
        }
        addGestureRecognizer(touchObserver)
        NotificationCenter.default.addObserver(self, selector: #selector(background),
            name: UIApplication.willResignActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(foreground),
            name: UIApplication.didBecomeActiveNotification, object: nil)
    }

    deinit {
        setParentScrollingLocked(false)
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
        if !visible { setParentScrollingLocked(false) }
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
            competitionType: .none, competitionUnit: .poi, orderType: .rank, zOrder: 10000))
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

    private func setParentScrollingLocked(_ locked: Bool) {
        if locked {
            guard lockedScrollViews.isEmpty else { return }
            var ancestor = superview
            while let view = ancestor {
                if let scrollView = view as? UIScrollView {
                    lockedScrollViews.append((scrollView, scrollView.isScrollEnabled))
                    scrollView.isScrollEnabled = false
                }
                ancestor = view.superview
            }
        } else {
            for (scrollView, wasEnabled) in lockedScrollViews {
                scrollView.isScrollEnabled = wasEnabled
            }
            lockedScrollViews.removeAll()
        }
    }

    private func endpointImage(title: String, color: UIColor) -> UIImage {
        let moduleBundle = Bundle(for: KakaoMapView.self)
        let resourceBundle = moduleBundle.url(forResource: "PawStepKakaoMap", withExtension: "bundle")
            .flatMap { Bundle(url: $0) } ?? moduleBundle
        let pin = UIImage(named: "location", in: resourceBundle, compatibleWith: nil)?
            .withTintColor(color, renderingMode: .alwaysOriginal)
        return UIGraphicsImageRenderer(size: CGSize(width: 48, height: 73)).image { _ in
            // Keep the text above the original location.svg silhouette.
            UIColor.white.setFill()
            UIBezierPath(roundedRect: CGRect(x: 2, y: 0, width: 44, height: 24), cornerRadius: 12).fill()
            let paragraph = NSMutableParagraphStyle()
            paragraph.alignment = .center
            (title as NSString).draw(in: CGRect(x: 2, y: 3, width: 44, height: 20), withAttributes: [
                .font: UIFont.boldSystemFont(ofSize: 14), .foregroundColor: color,
                .paragraphStyle: paragraph
            ])
            pin?.draw(in: CGRect(x: 8, y: 28, width: 32, height: 44.8))
        }
    }
}

/// Observes map touches without consuming the SDK's pan, pinch or tap gestures.
private final class MapTouchObserver: UIGestureRecognizer, UIGestureRecognizerDelegate {
    var onTouchChange: ((Bool) -> Void)?
    private var activeTouches = Set<UITouch>()

    override init(target: Any?, action: Selector?) {
        super.init(target: target, action: action)
        delegate = self
        delaysTouchesBegan = false
        delaysTouchesEnded = false
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        activeTouches.formUnion(touches)
        onTouchChange?(true)
        state = state == .possible ? .began : .changed
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        state = .changed
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
        activeTouches.subtract(touches)
        if activeTouches.isEmpty {
            onTouchChange?(false)
            state = .ended
        }
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent) {
        activeTouches.removeAll()
        onTouchChange?(false)
        state = .cancelled
    }

    override func reset() {
        activeTouches.removeAll()
        onTouchChange?(false)
        super.reset()
    }

    override func canBePrevented(by preventingGestureRecognizer: UIGestureRecognizer) -> Bool { false }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer,
        shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool { true }
}
