Pod::Spec.new do |s|
    s.name = 'PawStepSocialLogin'
    s.version = '1.0.0'
    s.summary = 'PawStep Naver and Kakao native login'
    s.description = s.summary
    s.license = 'MIT'
    s.author = 'PawStep'
    s.homepage = 'https://github.com/gaesancheck/app'
    s.source = { :git => 'https://github.com/gaesancheck/app.git' }
    s.platforms = { :ios => '16.4' }
    s.swift_version = '5.9'
    s.static_framework = true
    s.source_files = '**/*.swift'
    s.dependency 'ExpoModulesCore'
    s.dependency 'NidThirdPartyLogin', '5.2.1'

    # Kakao SDK 2.23+ is distributed through Swift Package Manager.
    spm_dependency(s,
        url: 'https://github.com/kakao/kakao-ios-sdk.git',
        requirement: { :kind => 'exactVersion', :version => '2.29.0' },
        products: ['KakaoSDKCommon', 'KakaoSDKAuth', 'KakaoSDKUser'])
end
