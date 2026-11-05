Pod::Spec.new do |s|
  s.name = 'PawStepKakaoMap'
  s.version = '1.0.0'
  s.summary = 'PawStep native Kakao Maps view'
  s.description = s.summary
  s.license = 'MIT'
  s.author = 'PawStep'
  s.homepage = 'https://apis.map.kakao.com/'
  s.source = { :git => 'https://github.com/kakao-mapsSDK/KakaoMapsSDK-SPM.git' }
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'KakaoMapsSDK', '2.12.19'
  s.source_files = '**/*.swift'
  s.resource_bundles = { 'PawStepKakaoMap' => ['Resources/*.png'] }
end
