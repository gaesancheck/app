# gaesancheck

개산책

## 카카오맵 네이티브 SDK

산책 탭은 `modules/kakao-map`의 로컬 Expo 모듈로 Android/iOS 카카오맵을 표시합니다.
초기 위치는 서울시청이며, 현재 위치 권한이나 산책 기록 기능은 포함하지 않습니다.

1. `.env.local`의 `NATIVE_APP_KEY`에 카카오 **네이티브 앱 키**를 입력합니다. 파일이 없다면 `.env.example`을 복사합니다.
2. Kakao Developers에서 카카오맵 사용을 활성화하고 플랫폼을 등록합니다.
   - Android 패키지: `kr.pro203s.pawstep` — 개발/배포 서명 키 해시를 각각 등록합니다.
   - iOS 번들 ID: `kr.pro203s.pawstep`
3. `bunx expo prebuild`로 네이티브 설정과 모듈을 반영합니다.
4. `bun run ios` 또는 `bun run android`로 개발 빌드를 다시 만듭니다. Expo Go에서는 실행할 수 없습니다.

키는 Expo config의 `extra.kakaoNativeAppKey`를 통해 SDK에 전달됩니다.
키 변경 후에는 Metro를 재시작하고 앱을 다시 로드합니다. 네이티브 앱 키는 앱에 포함되므로
REST API 키나 Admin 키를 넣지 마세요. `.env.local`은 Git에서 제외됩니다.
키가 없으면 안내 화면을 표시하며, 인증 오류는 개발 콘솔에 출력됩니다.

SDK 버전: Android `2.15.2`, iOS `2.12.19`. Android Maven 저장소는
`plugins/with-kakao-map.js`로 추가하고 iOS 의존성은 모듈 podspec에서 관리합니다.

- [Android SDK 공식 문서](https://apis.map.kakao.com/android_v2/docs/getting-started/quickstart/)
- [iOS SDK 공식 문서](https://apis.map.kakao.com/ios_v2/docs/getting-started/)
