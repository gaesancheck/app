# Apple OAuth 백엔드 연동 명세

이 문서는 개산책 프런트엔드가 호출하는 계약이다. 이 작업에서는 백엔드 라우트를 구현하지 않는다. 기존 `server/dev-oauth-server.mjs`의 Google·네이버·카카오 처리는 변경하지 않는다.

## 현재 등록 상태

- Apple Developer 팀: `joo hyeonmeoung` / `6N4XWB3QSL`.
- 기존 App ID `kr.pro203s.pawstep`에 Sign in with Apple을 활성화하고 Primary App ID로 설정했다. Bundle ID는 유지했다.
- Services ID `kr.pro203s.pawstep.signin`을 생성하고 해당 Primary App ID에 연결했다.
- 등록 도메인: `impacts-python-pharmaceuticals-controller.trycloudflare.com`.
- 등록 Return URL: `https://impacts-python-pharmaceuticals-controller.trycloudflare.com/v1/auth/oauth/apple/callback`.
- 전용 Sign in with Apple Key ID: `24PCU96B5F`. 다른 앱의 키는 변경하지 않았다.
- `.env.local`에 `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`을 저장했다. 클라이언트 시크릿은 ES256 서명을 검증했으며 **2027-05-04 04:18:59 KST**에 만료된다. 만료 전에 재발급해 환경변수를 교체해야 한다.
- 원본 서명 키는 저장소 밖 `~/.config/gaesancheck/apple/AuthKey_24PCU96B5F.p8`에 보관한다. 개인키와 `.env.local` 파일 권한은 `600`, 키 디렉터리는 `700`이다. 개인키를 별도의 안전한 위치에 백업해야 한다.
- 앱의 iOS 서명 팀도 `6N4XWB3QSL`로 지정했다. Capability 변경으로 향후 서명 빌드 시 프로비저닝 프로파일 재생성이 필요하다.
- Apple 포털 설정과 프런트엔드 연동은 준비됐다. **백엔드 authorize/callback/exchange 라우트는 별도로 구현해야 하므로 아직 전체 로그인 완료를 검증한 상태는 아니다.**

## 인증 방식과 설정

iOS·Android 모두 시스템 인증 브라우저를 사용한다. iOS 네이티브 `AppleAuthentication.signInAsync` 방식이 아니므로 OAuth `client_id`는 Bundle ID가 아니라 **Services ID**다.

| 항목 | 값 |
| --- | --- |
| Primary App ID | `kr.pro203s.pawstep` |
| Services ID / `APPLE_CLIENT_ID` | `kr.pro203s.pawstep.signin` |
| 앱 복귀 URI | `pawstep://login` |
| Apple Return URL | `${PUBLIC_BASE_URL}/v1/auth/oauth/apple/callback` |
| Apple authorize endpoint | `https://appleid.apple.com/auth/authorize` |
| Apple token endpoint | `https://appleid.apple.com/auth/token` |
| Apple JWKS | `https://appleid.apple.com/auth/keys` |

추가하는 백엔드 비밀 환경변수는 다음 두 항목뿐이다. 실제 값은 Git에서 제외된 `.env.local`에 보관하고, 프런트엔드 번들·`EXPO_PUBLIC_*`·Expo `extra`로 전달하지 않는다.

```dotenv
APPLE_CLIENT_ID=kr.pro203s.pawstep.signin
APPLE_CLIENT_SECRET=<Apple 서명 키로 생성한 ES256 JWT>
```

기존 `PUBLIC_BASE_URL`, `EXPO_PUBLIC_API_BASE_URL`, 앱 JWT 서명 설정은 그대로 사용한다. 현재 개발 환경은 Cloudflare 임시 터널이므로 주소가 바뀌면 Apple Developer의 Domains와 Return URLs도 함께 변경해야 한다. `pawstep://login`은 앱 복귀 주소이며 Apple Return URL로 등록하지 않는다.

`APPLE_CLIENT_SECRET`은 Apple에서 발급하는 고정 문자열이 아니다. 서명 시 `alg=ES256`, `kid=Key ID`, `iss=Team ID`, `sub=Services ID`, `aud=https://appleid.apple.com`, `iat=현재 UTC 초`, `exp=만료 UTC 초`를 사용한다. Apple의 최대 유효기간은 15,777,000초이며 만료 전에 새 JWT로 교체해야 한다. `.p8` 원본과 시크릿을 명세나 소스에 넣지 않는다.

## 1. 인증 시작

`GET /v1/auth/oauth/apple/authorize`

| 쿼리 | 타입 | 의미 |
| --- | --- | --- |
| `redirect_uri` | string | 반드시 `pawstep://login` |
| `state` | string | 앱이 생성한 32바이트 난수의 64자리 hex |
| `code_challenge` | string | 앱 verifier의 SHA-256, base64url 인코딩, 패딩 없음 |
| `code_challenge_method` | string | 반드시 `S256` |
| `keep_me_logged_in` | `true` 또는 `false` | 로그인 유지 선택 |

백엔드는 요청을 검증한 뒤 앱 `state`, 앱 복귀 URI, PKCE challenge, 로그인 유지 여부를 서버 트랜잭션에 저장한다. 그다음 **별도의 Apple state와 nonce**를 암호학적 난수로 생성하고, 서버 트랜잭션에 연결한 뒤 Apple로 302 리다이렉트한다.

Apple 요청은 `client_id=APPLE_CLIENT_ID`, 등록된 HTTPS `redirect_uri`, `response_type=code id_token`, `response_mode=form_post`, `scope=name email`, 서버 Apple state와 nonce를 포함한다. 앱 state와 Apple state를 혼용하지 않는다. 이 명세의 PKCE는 **앱↔백엔드의 앱 코드 교환**에 적용되며, Apple 서버가 앱 verifier를 검증한다고 가정하지 않는다.

서버 트랜잭션 TTL은 10분으로 하고, state·nonce·코드·토큰은 로그에 기록하지 않는다. 잘못된 요청은 400, 자격증명 미설정은 503 JSON 응답을 반환한다. 인증 시작 URL은 앱이 외부 브라우저로 열기 때문에 앱 JWT 인증을 요구하지 않는다.

## 2. Apple 콜백

`POST /v1/auth/oauth/apple/callback`

Content-Type: `application/x-www-form-urlencoded`

Apple의 `state`, `code`, `id_token`, 선택적인 `user`, 또는 `error`를 처리한다. 교차 사이트 POST이므로 일반 로그인 세션 쿠키가 전송된다고 가정하지 말고, 일회용 Apple state로 서버 트랜잭션을 찾아 검증한다. 요청 본문 크기를 제한하고 중복 파라미터를 거부한다.

1. state의 일치·TTL·미사용 여부를 원자적으로 확인한다. 모르는 state에 포함된 URI로는 리다이렉트하지 않는다.
2. Apple code를 서버에서 한 번만 사용해 Apple token endpoint로 교환한다. 폼 필드는 `client_id`, `client_secret`, `code`, `grant_type=authorization_code`, 등록된 `redirect_uri`다.
3. Apple 공개 키로 ID token 서명을 검증한다. 허용한 서명 알고리즘·`kid`, `iss=https://appleid.apple.com`, `aud=APPLE_CLIENT_ID`, 만료, nonce, `sub`를 검증한다. 콜백 ID token과 token endpoint의 ID token을 함께 사용하는 경우 둘 모두 검증하고 같은 사용자·트랜잭션인지 확인한다. JWT payload를 decode만 한 결과로 로그인시키지 않는다.
4. 검증된 `(provider=apple, sub)`를 계정 키로 사용한다. 이메일이 같다는 이유만으로 기존 계정을 자동 병합하지 않는다. 비공개 릴레이 이메일을 허용하고 이메일 검증 claim을 확인한다.
5. 이름 등 `user` 프로필은 최초 동의 때만 전달될 수 있다. 검증된 인증 트랜잭션에 한해 제한된 표시 정보로 저장하고, 후속 로그인에서 값이 없다고 기존 프로필을 지우지 않는다. `user` 자체는 서명되지 않으므로 인증 근거로 사용하지 않는다.
6. Apple code·token 대신 **백엔드가 생성한 별도 일회용 앱 코드**를 만든다. 검증된 사용자, 앱 state, PKCE challenge, 로그인 유지 여부와 연결하고 5분 TTL로 저장한다.
7. `302 Location: pawstep://login?code=<APP_CODE>&state=<APP_STATE>`로 앱에 복귀한다. 토큰을 URL에 넣지 않는다.

사용자가 취소하면 유효한 트랜잭션에 대해서만 `pawstep://login?error=access_denied&state=<APP_STATE>`로 복귀한다. 그 외 실패는 `error=authentication_failed`로 복귀한다. 상세 공급자 오류·비밀 값은 URL에 넣지 않는다. 응답에는 `Cache-Control: no-store`를 적용한다.

## 3. 앱 코드 교환

`POST /v1/auth/oauth/apple/exchange`

Content-Type: `application/json`

```json
{
  "code": "백엔드에서 발급한 일회용 APP_CODE",
  "state": "앱에서 생성한 원래 state",
  "code_verifier": "앱에서 생성하고 외부 브라우저에 공개하지 않은 verifier",
  "redirect_uri": "pawstep://login"
}
```

앱 코드의 Apple provider 구분·TTL·앱 state·복귀 URI·PKCE S256 challenge를 검증한다. provider가 다른 로그인 코드, 만료 코드, 재사용 코드는 거부한다. 코드 소비는 원자적으로 처리해 동시 요청에서도 세션을 한 번만 발급한다. `keep_me_logged_in`은 클라이언트의 교환 요청이 아니라 인증 시작 시 저장한 값에서 가져온다.

성공: HTTP 200, `Cache-Control: no-store`.

```json
{
  "access_token": "개산책 백엔드에서 발급한 JWT",
  "expires_in": 604800
}
```

`expires_in`은 양의 정수 초다. 기존 앱 계약상 로그인 유지를 위해 무기한 세션을 지원한다면 `-1`을 반환할 수 있다. Apple token은 앱 세션 JWT가 아니므로 대신 반환하지 않는다. 프런트엔드는 이 응답을 SecureStore에 저장하고 홈으로 이동한다.

| 상태 | 상황 |
| --- | --- |
| 400 | 잘못된 요청 형식·복귀 URI |
| 401 | 만료·재사용 코드, state/PKCE/provider 불일치 |
| 429 | 인증·교환 요청 제한 |
| 500 / 502 | 서버·Apple 통신 또는 검증 처리 실패 |
| 503 | Apple 클라이언트 설정 미완료 |

실패 JSON은 기존 APIError 계약인 `{ "status": 401, "message": "다시 로그인해주세요." }` 형식을 사용한다.

## 후속 서버 요구사항

Apple refresh token을 저장한다면 서버에서 암호화해 관리하고 앱 계정 삭제 시 Apple 토큰 폐기도 처리한다. 이 명세에는 삭제 API 구현이나 Apple 이메일 릴레이 발신 도메인 설정은 포함하지 않는다.

## 공식 참고 문서

- [Apple 웹 로그인 설정](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/)
- [Apple 로그인 서명 키 생성](https://developer.apple.com/help/account/capabilities/create-a-sign-in-with-apple-private-key/)
- [Apple 토큰 검증](https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens)
- [Apple 클라이언트 시크릿 생성](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret)
