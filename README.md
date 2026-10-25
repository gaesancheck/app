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

## 소셜 OAuth 로그인

로그인 화면은 네이버와 카카오의 네이티브 SDK를 사용합니다. `.env.local`에 아래 값을 설정한 뒤
네이티브 앱을 다시 빌드합니다. 카카오 로그인은 기존 카카오맵과 같은 네이티브 앱 키를 사용합니다.

```dotenv
NATIVE_APP_KEY=카카오_네이티브_앱_키
NAVER_CID=네이버_클라이언트_ID
NAVER_CLIENT_SECRET=네이버_클라이언트_시크릿
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

카카오 Developers에는 Android 패키지와 iOS 번들 ID를 등록하고 카카오 로그인을 활성화합니다.
네이버 Developers에는 같은 Android 패키지와 iOS 번들 ID, 앱 URL scheme
`kr.pro203s.pawstep.naver`를 등록합니다. 네이버 SDK용 클라이언트 시크릿은 네이티브 앱에 포함됩니다.

임시 OAuth 서버는 `server/dev-oauth-server.mjs`입니다. 환경 파일을 준비합니다.

```sh
test -f .env.local || cp .env.example .env.local
```

`.env.local`에 실제 카카오·네이버 키와 Google OAuth 웹 클라이언트 ID/시크릿을 채웁니다.
Google Cloud에서 OAuth 클라이언트를 **Web application**으로 만들고, 아래 주소를 승인된 리디렉션 URI로 등록합니다.

```text
${PUBLIC_BASE_URL}/v1/auth/oauth/google/callback
```

폰 테스트에는 Cloudflare Quick Tunnel과 OAuth 서버를 함께 여는 스크립트를 사용할 수 있습니다.
`cloudflared`가 없다면 `brew install cloudflared`로 설치한 뒤 실행합니다.

```sh
npm run dev:auth:tunnel
```

스크립트는 새 HTTPS 터널을 만들고 주소를 `.env.local`의 `PUBLIC_BASE_URL`과
`EXPO_PUBLIC_API_BASE_URL`에 기록한 뒤 OAuth 서버를 시작합니다. Google Cloud의 승인된 리디렉션 URI에는
터미널에 표시된 Google 콜백 주소를 등록하세요. Quick Tunnel 주소는
실행할 때마다 달라질 수 있으므로 주소가 바뀌면 Google Cloud에도 새 URI를 등록해야 합니다.
Expo 개발 서버가 이미 실행 중이라면 새 API 주소를 읽도록 재시작하세요. `Ctrl+C`를 누르면 터널과 OAuth 서버가 함께 종료됩니다.
Google OAuth 동의 화면이 테스트 상태라면 테스트할 Google 계정을 테스트 사용자에 추가합니다.

서버 실행:

```sh
bun run dev:auth
```

서버는 Google 인가·콜백·PKCE 코드 교환과 네이버·카카오 토큰 검증 API를 제공합니다.
공급자 액세스 토큰은 네이버 `/v1/nid/me`, 카카오 `/v2/user/me`로 확인한 뒤 임시 JWT 앱 세션을 발급합니다.
사용자와 OAuth 코드는 메모리에만 저장되므로 서버를 재시작하면 초기화됩니다. 이 서버는 로컬 개발 전용이며,
프로덕션 배포나 실제 계정 저장에 사용하지 마세요. `/health`에서 서버 상태와 Google 키 설정 여부를 확인할 수 있습니다.

Google 로그인은 브라우저 기반이라 서버 설정 후 바로 확인할 수 있습니다. 네이버·카카오 로그인은 네이티브 SDK를 포함한
개발 앱이 필요하며, 키나 네이티브 모듈을 바꾼 뒤에는 앱을 다시 빌드해 설치해야 합니다.

앱은 공급자 액세스 토큰을 `POST /v1/auth/oauth/naver/exchange` 또는
`POST /v1/auth/oauth/kakao/exchange`에 `{ access_token, keep_me_logged_in }` 형태로 보내고,
서버가 반환하는 `{ access_token, expires_in }` 앱 세션을 저장합니다. Google은 서버의 OAuth 코드 교환을 거친 뒤
같은 세션 형식으로 로그인합니다. 공급자 토큰을 앱 세션으로 직접 저장하지 않습니다.

- [Google OAuth 웹 서버 흐름](https://developers.google.com/identity/protocols/oauth2/web-server)
