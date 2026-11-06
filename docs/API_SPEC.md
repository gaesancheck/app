# 개산책 API 명세

작성일: 2026-11-06 · 기준: 현재 프런트엔드 소스와 개발 인증 서버

## 1. 범위와 구현 상태

이 문서는 백엔드 연동을 위한 API 계약이다. **현재 구현을 기술하는 부분과 새로 제안하는 HTTP 경로를 구분한다.** 서버 구현, 배포 및 실제 연동 완료를 뜻하지 않는다.

| 구분 | 현재 상태 | 근거 |
| --- | --- | --- |
| Google 로그인 | 앱 HTTP 호출 및 개발 서버 라우트 있음 | `src/modules/oauth.ts`, `src/modules/rest/auth.ts`, `server/dev-oauth-server.mjs` |
| 네이버·카카오 로그인 | 네이티브 SDK 토큰 교환 호출 및 개발 서버 라우트 있음 | 위와 같음 |
| Apple 로그인 | 앱 호출 및 별도 계약 있음, 개발 서버 라우트 없음 | `docs/APPLE_OAUTH_API.md` |
| 온보딩 | 경로·타입·입력 검증 정의됨, AsyncStorage mock | `src/modules/rest/onboarding.ts` |
| 회원·반려견·FAQ·문의 | 경로·타입 정의됨, mock 응답 | `src/modules/rest/my.ts` |
| 커뮤니티 | 로컬 서비스 및 API 어댑터, HTTP 경로 미정 | `src/modules/rest/posts.ts`, `src/modules/communityData.ts` |
| 산책·추천 코스 | 로컬 기록 저장 및 코스 계산, HTTP 경로 미정 | `src/modules/userData.ts`, `src/modules/walkData.ts` |
| 실종·제보·채팅·보호동물 | 로컬 서비스·예제 데이터, HTTP 경로 미정 | `src/modules/emergencyService.ts`, `src/modules/emergencyData.ts` |
| 파일 업로드·문의 조회·반려견 다중 관리 | 로컬 처리, HTTP 경로 미정 | `src/modules/careData.ts` 및 관련 화면 |

아래에서 **기존 계약**은 코드 주석·타입 또는 호출 경로가 있는 항목, **제안**은 로컬 기능을 서버로 옮기기 위해 새로 정한 항목이다. 제안 경로와 응답은 백엔드 합의 후 프런트엔드 어댑터를 변경해야 한다.

## 2. 공통 규칙

### 기본 주소와 헤더

- Base URL: 환경변수 `EXPO_PUBLIC_API_BASE_URL`. 뒤의 `/`는 클라이언트에서 제거한다.
- 경로 접두사: `/v1`.
- 운영 환경은 HTTPS, 개발 모드에서는 HTTP도 허용한다.
- JSON 요청: `Content-Type: application/json`.
- 인증이 필요한 요청: `Authorization: Bearer <앱 access_token>`.
- 로그인 시작·콜백·교환은 앱 JWT 없이 호출한다. 나머지 API는 인증 필요를 기본 계약으로 제안한다. 현재 mock의 인증 검사 유무는 실제 서버 권한 검증을 대체하지 않는다.
- URL 경로의 `id`는 문자열 식별자다. 조회·수정·삭제 시 서버에서 소유권 또는 참여 권한을 검증한다.

### 응답 형식

HTTP 응답 본문에는 실제 데이터만 반환한다. 프런트엔드 `REST()`가 만드는 `success`, `headers`, `options`, `data` 래퍼를 서버 JSON에 다시 넣지 않는다.

성공 예시:

```json
{
  "access_token": "<APP_JWT>",
  "expires_in": 604800,
  "needs_onboarding": true
}
```

실패 계약 (`APIError`):

```json
{
  "status": 400,
  "message": "입력값을 확인해주세요."
}
```

`204 No Content`에는 응답 본문을 보내지 않는다. 어댑터가 반환하는 `data: null`은 클라이언트 표현이다. 개발 인증 서버와 일부 mock은 현재 `message`만 반환하므로, 서버 연동 시 `status`를 포함하도록 맞춰야 한다.

| 상태 | 의미 |
| --- | --- |
| 200 | 조회·수정·인증 성공 |
| 201 | 생성 성공. 아래 제안 API에 사용 |
| 204 | 본문 없는 성공 |
| 400 | 요청 형식 또는 입력 검증 실패 |
| 401 | 인증 없음·만료·잘못된 인증 코드 |
| 403 | 수정·삭제·조회 권한 없음 |
| 404 | 대상 없음 |
| 409 | 중복 생성 등 상태 충돌. 제안 API에 사용 |
| 429 | 요청 제한 |
| 500 / 502 / 503 | 서버 오류 / 외부 서비스 오류 / 설정 또는 서비스 이용 불가 |

개별 항목의 성공 상태는 아래 표를 따른다. 공통 오류 상태 전체가 현재 개발 서버에 구현되어 있다는 뜻은 아니다.

### 자료형과 단위

- 별도 설명이 없는 시간 숫자: Unix timestamp **밀리초**.
- `expires_in`: **초**, 현재 앱은 `-1`도 무기한 세션으로 처리한다.
- 산책 `duration`: 초, `distance`: 미터.
- 산책 `date`: `YYYYMMDD`. 날짜별 집계 제안은 Asia/Seoul 기준으로 한다.
- 반려견 `birth`: 연도 없는 `MM.DD`. 윤년과 무관하게 `02.29` 허용. 기존 데이터의 `YYYYMMDD`는 마이그레이션 대상이다.
- 좌표: `{ "latitude": number, "longitude": number }`. 위도 -90~90, 경도 -180~180, 유한수.
- 기존 camelCase·snake_case 필드는 현재 타입을 보존한다.
- 목록은 현재 어댑터 호환을 위해 배열을 직접 반환한다. 별도의 `items`·`nextCursor` 래퍼는 정의하지 않는다. 대량 데이터 페이지네이션은 후속 합의가 필요하다.

## 3. 인증 — 기존 계약

### 엔드포인트

| 메서드 | 경로 | 성공 | 상태 |
| --- | --- | --- | --- |
| GET | `/v1/auth/oauth/google/authorize` | 302 공급자 인증 화면 이동 | 개발 서버 구현 |
| GET | `/v1/auth/oauth/google/callback` | 302 앱 복귀 | 개발 서버 구현 |
| POST | `/v1/auth/oauth/google/exchange` | 200 AuthSession | 개발 서버 구현 |
| POST | `/v1/auth/oauth/naver/exchange` | 200 AuthSession | 개발 서버 구현 |
| POST | `/v1/auth/oauth/kakao/exchange` | 200 AuthSession | 개발 서버 구현 |
| GET | `/v1/auth/oauth/apple/authorize` | 302 공급자 인증 화면 이동 | 계약만 있음 |
| POST | `/v1/auth/oauth/apple/callback` | 302 앱 복귀 | 계약만 있음 |
| POST | `/v1/auth/oauth/apple/exchange` | 200 AuthSession | 계약만 있음 |

### Google·Apple 인증 시작

`GET /v1/auth/oauth/{provider}/authorize`, provider는 `google` 또는 `apple`.

| 쿼리 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| `redirect_uri` | string | O | `pawstep://login` |
| `state` | string | O | 앱에서 생성한 64자리 hex 난수 |
| `code_challenge` | string | O | verifier SHA-256의 패딩 없는 base64url |
| `code_challenge_method` | string | O | `S256` |
| `keep_me_logged_in` | string | O | `true` 또는 `false`. 현재 Google 서버는 누락 시 false 처리 |

성공 시 공급자 화면으로 302 이동한다. 콜백 처리가 끝나면 `pawstep://login?code=<APP_CODE>&state=<APP_STATE>`로 복귀한다. `APP_CODE`는 공급자 코드와 별도로 발급한 짧은 수명의 일회용 코드다. 실패 복귀는 `error`와 `state`를 사용하며, 앱 JWT를 URL에 넣지 않는다.

Google 콜백은 공급자의 `code`, `state` 또는 `error` 쿼리를 받는다. Apple 콜백은 `application/x-www-form-urlencoded` POST로 `state`, `code`, `id_token`, 선택적 `user` 또는 `error`를 받는다. Apple의 검증·TTL·오류 복귀 상세는 [기존 Apple 계약](APPLE_OAUTH_API.md)을 따른다.

### Google·Apple 코드 교환

`POST /v1/auth/oauth/{provider}/exchange`

```json
{
  "code": "<APP_CODE>",
  "state": "<APP_STATE>",
  "code_verifier": "<43~128자 PKCE verifier>",
  "redirect_uri": "pawstep://login"
}
```

네 필드 모두 필수 문자열이다. 서버는 코드의 유효기간·일회성·state·복귀 URI·PKCE를 확인한다. Apple 계약은 provider 일치 검증도 요구한다. 로그인 유지 여부는 인증 시작 시 저장한 값을 사용한다.

### 네이버·카카오 네이티브 토큰 교환

`POST /v1/auth/oauth/{provider}/exchange`, provider는 `naver` 또는 `kakao`.

```json
{
  "access_token": "<PROVIDER_ACCESS_TOKEN>",
  "keep_me_logged_in": true
}
```

두 필드 모두 필수다. 공급자 access token으로 사용자 정보를 검증한 뒤 **앱 JWT**를 발급한다. 요청의 공급자 토큰과 응답의 앱 토큰은 서로 다른 값이다.

### AuthSession

| 필드 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| `access_token` | string | O | 앱 JWT |
| `expires_in` | number | O | 양수 초 또는 현재 호환 값 `-1` |
| `needs_onboarding` | boolean | X | 온보딩 미완료 여부 |

앱 교환 요청 제한 시간은 15초다. 개발 서버는 현재 `needs_onboarding`을 반환하지 않는다. 필드가 없으면 앱은 사용자별 로컬 온보딩 상태를 사용한다. 서버 연동 후에는 해당 계정의 실제 완료 상태를 반환해야 한다.

별도의 refresh token·갱신 API·서버 로그아웃 API는 현재 정의되어 있지 않다.

## 4. 온보딩 — 기존 계약, 로컬 mock

| 메서드 | 경로 | 요청 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/me/onboarding` | 없음 | 200 OnboardingStatus |
| PUT | `/v1/me/onboarding` | CompleteOnboardingRequest | 200 OnboardingStatus |

### 완료 요청

```json
{
  "age_group": "0-3살",
  "walk_duration": "30분 미만",
  "walk_condition": "좋아요",
  "region": "강서구",
  "pet": {
    "name": "초코",
    "type": "푸들",
    "gender": "female",
    "age": 2,
    "birth": "03.01",
    "neutering": true,
    "diseases": "없음"
  }
}
```

모든 필드는 필수다.

| 필드 | 허용값·검증 |
| --- | --- |
| `age_group` | `0-3살`, `4-6살`, `7-9살`, `9-12살`, `13살 이상` |
| `walk_duration` | `30분 미만`, `30분-1시간`, `1시간-1시간 30분`, `1시간 30분-2시간`, `2시간 이상` |
| `walk_condition` | `최고예요!`, `좋아요`, `평범한 것 같아요`, `조금 힘들어해요`, `많이 힘들어해요` |
| `region` | trim 후 1~100자 |
| `pet.name` | trim 후 1~30자 |
| `pet.type` | 품종. trim 후 1~50자 |
| `pet.gender` | `female` 또는 `male` |
| `pet.age` | 0~99 정수 |
| `pet.birth` | 실제 월·일에 맞는 `MM.DD`, `02.29` 허용 |
| `pet.neutering` | boolean |
| `pet.diseases` | trim 후 1~300자. 질병이 없으면 `없음` |

### 상태 응답

미완료: `{ "needs_onboarding": true }`.

완료:

```json
{
  "needs_onboarding": false,
  "completed_at": 1793836800000,
  "answers": {
    "age_group": "0-3살",
    "walk_duration": "30분 미만",
    "walk_condition": "좋아요",
    "region": "강서구",
    "pet": {
      "name": "초코",
      "type": "푸들",
      "gender": "female",
      "age": 2,
      "birth": "03.01",
      "neutering": true,
      "diseases": "없음"
    }
  }
}
```

`completed_at`, `answers`, 타입에 정의된 `nickname: string`은 선택 필드다. 현재 완료 로직은 nickname을 생성하지 않는다. 완료 시 첫 반려견 정보를 갱신하거나 신규 생성하고 산책량·컨디션도 저장한다. 서버에서도 온보딩 상태와 반려견 저장을 일관되게 처리해야 한다. 실패는 400 또는 401.

## 5. 회원·반려견·문의 — 기존 계약, mock

| 메서드 | 경로 | 요청 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/me` | 없음 | 200 MyInfo |
| PUT | `/v1/me` | 아래 회원 수정 객체 | 204 |
| DELETE | `/v1/me` | 없음 | 204 |
| PUT | `/v1/me/pet` | PetInfo의 일부 필드 | 204 |
| GET | `/v1/me/faqs` | 없음 | 200 FAQ[] |
| POST | `/v1/me/contact` | 아래 문의 객체 | 204 |

### MyInfo

```json
{
  "account": {
    "id": "user-1",
    "name": "보호자",
    "profile": "https://example.com/profile.jpg",
    "registeredAt": 1793836800000
  },
  "petInfo": {
    "name": "초코",
    "type": "푸들",
    "gender": "female",
    "age": 2,
    "birth": "03.01",
    "neutering": true,
    "diseases": "없음",
    "picture": "https://example.com/pet.jpg",
    "size": "소형견",
    "walkDuration": "30분 미만",
    "walkCondition": "좋아요"
  }
}
```

`account.profile`, `petInfo.size`, `petInfo.walkDuration`, `petInfo.walkCondition`은 선택 필드다. 나머지는 현재 타입에서 필수다. `size`는 문자열이며 서버 enum은 아직 없다. 온보딩과 달리 일반 PetInfo 수정의 길이 제한은 코드 계약에 정의되지 않았으므로 서버 합의가 필요하다.

회원 수정은 `{ "id"?: string, "password"?: string, "picture"?: string, "name"?: string }`의 부분 객체다. `id`·`password`는 타입에 남아 있지만 현재 인증은 소셜 로그인이므로 서버에서 실제 지원할지는 미정이다. 응답의 프로필 키는 `profile`, 수정 요청의 키는 `picture`라는 차이가 있으므로 매핑이 필요하다.

FAQ 항목: `{ "id": string, "name": string, "answer": string }`.

문의 요청:

```json
{
  "contactType": "질문",
  "title": "산책 기록 문의",
  "content": "산책 기록을 확인하고 싶어요.",
  "attachments": [
    { "name": "capture.jpg", "url": "https://example.com/capture.jpg" }
  ]
}
```

네 필드는 모두 필수이며 첨부가 없으면 빈 배열을 보낸다. `contactType`은 현재 자유 문자열이다. 문의 조회용 `Inquiry`는 이 객체에 `id: string`, `createdAt: number`, 선택적 `answer: string`을 더한다.

탈퇴 시 로컬 앱은 계정·산책·온보딩·커뮤니티·실종 관련 데이터를 정리한다. 서버의 삭제 범위와 외부 로그인 토큰 폐기 정책은 별도 구현이 필요하다.

### 다중 반려견·문의 조회 — 제안

기존 `/v1/me`는 반려견 한 마리만 반환하지만 화면은 `Pet[]`를 저장한다. 다중 관리를 위해 다음 API를 제안한다. 기존 단일 반려견 API와 병행 시 `/v1/me/pet`이 가리키는 대표 반려견 규칙을 합의해야 한다.

| 메서드 | 제안 경로 | 요청 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/me/pets` | 없음 | 200 Pet[] |
| POST | `/v1/me/pets` | Pet에서 id 제외 | 201 Pet |
| PUT | `/v1/me/pets/{petId}` | Pet에서 id 제외한 필드의 부분 객체 | 200 Pet |
| DELETE | `/v1/me/pets/{petId}` | 없음 | 204 |
| GET | `/v1/me/contacts` | 없음 | 200 Inquiry[] |
| GET | `/v1/me/contacts/{contactId}` | 없음 | 200 Inquiry |

`Pet = PetInfo + { "id": string, "specials": string }`. 기존 문의 생성은 204이므로 문의 ID가 필요하면 목록을 재조회한다. 생성 응답을 Inquiry로 바꾸려면 기존 계약 변경이 필요하다.

## 6. 커뮤니티 — HTTP 계약 제안

현재 `APIPosts`는 HTTP를 호출하지 않는다. 아래는 기존 함수의 입력과 반환 데이터를 보존한 제안이다.

| 메서드 | 제안 경로 | 대응 함수 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/posts` | getPosts | 200 PostSummary[] |
| GET | `/v1/posts/{postId}` | getPost | 200 Post |
| POST | `/v1/posts` | writeNewPost | 201 Post |
| PUT | `/v1/posts/{postId}/reactions` | heartPost | 200 `null` |
| POST | `/v1/posts/{postId}/comments` | addComment | 200 갱신된 Post |
| DELETE | `/v1/posts/{postId}` | deletePost | 204 |

현재 로컬 어댑터는 작성·댓글·삭제도 200 래퍼를 사용하며 삭제 결과는 undefined다. 제안한 생성 201·삭제 204로 연동할 때 어댑터를 맞춘다.

### 목록 쿼리

모두 선택 사항이다.

| 쿼리 | 값 |
| --- | --- |
| `category` | `popular`, `recent`, `missing`, `others` |
| `query` | 제목·본문 검색어. trim 후 대소문자 구분 없이 검색 |
| `collection` | `mine`, `bookmarked`, `liked`, `commented` |
| `sort` | `recent`, `oldest`, `likes` |
| `nextFrom` | 마지막으로 받은 게시물 ID. 해당 게시물 다음부터 반환 |

기본 정렬은 최신순이다. `popular`는 별도 임계값 필터가 아니라 좋아요순 정렬이며, 명시한 sort가 우선한다. 좋아요가 같으면 최신순이다. `missing`·`others`만 실제 저장 카테고리다. 현재 nextFrom이 없거나 ID를 찾지 못하면 처음부터 반환한다. 서버도 이 동작을 유지하는 것으로 제안한다.

### Post·Comment 모델

```typescript
type Comment = {
    "id": string;
    "wroteBy": { "username": string; "profile"?: string };
    "content": string;
    "wroteAt": number;
    "mine"?: boolean;
};

type Post = {
    "id": string;
    "wroteAt": number;
    "title": string;
    "content": string;
    "hearts": number;
    "liked": boolean;
    "bookmarked": boolean;
    "mine": boolean;
    "category": "others" | "missing";
    "attachments": { "id": string; "url": string }[];
    "comments": Comment[];
    "missingPetId"?: string;
};

type PostSummary = Omit<Post, "comments"> & { "comments": number };
```

`liked`, `bookmarked`, `mine`은 인증된 사용자 기준으로 계산한다.

### 작성·반응·댓글·삭제

게시물 작성 요청:

```json
{
  "title": "오늘 산책길",
  "content": "공원에서 산책했어요.",
  "attachments": [{ "url": "https://example.com/walk.jpg" }]
}
```

제목·본문은 trim 후 비어 있으면 400. 현재 어댑터는 attachments 배열을 요구하며 최대 10개만 저장한다. 서버 제안도 앞의 10개만 처리한다. 첨부 id는 서버가 생성한다. 어댑터 타입의 선택적 `wroteAt`은 로컬 저장 구현에서 무시하며 작성 시각은 서버 생성값을 사용한다. 일반 작성의 category는 `others`다.

반응 요청은 `{ "bookmark"?: boolean, "heart"?: boolean }`. 전달한 필드만 원하는 상태로 설정하며 같은 상태를 반복해도 좋아요가 중복 증가하지 않는다. 두 필드가 모두 있으면 둘 다 반영한다. 경로 postId를 기존 함수의 id로 매핑한다.

댓글 요청은 `{ "content": string }`. trim 후 빈 내용은 400. 현재 반환은 댓글 단독 객체가 아니라 **갱신된 Post 전체**다.

본인 게시물만 삭제 가능하다. 타인 게시물은 403, 없는 게시물은 404로 제안한다. 실종 연동 게시물은 직접 삭제 대신 실종 해제를 사용하며 직접 삭제 요청은 409로 제안한다. 현재 mock은 이런 오류를 모두 400으로 반환하므로 어댑터의 오류 처리를 맞춰야 한다.

검색 이력은 현재 사용자별 로컬 데이터이며 최근 20개를 유지한다. 서버 동기화 API는 이번 계약에 포함하지 않는다.

## 7. 산책 — HTTP 계약 제안

### 기록 API

| 메서드 | 제안 경로 | 요청·쿼리 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/walk-records` | 선택적 `date`, `query` | 200 WalkRecord[] |
| GET | `/v1/walk-records/{recordId}` | 없음 | 200 WalkRecord |
| POST | `/v1/walk-records` | WalkRecord에서 id 제외 | 201 WalkRecord |
| PUT | `/v1/walk-records/{recordId}` | WalkRecord에서 id 제외한 전체 객체 | 200 WalkRecord |
| DELETE | `/v1/walk-records/{recordId}` | 없음 | 204 |

목록은 본인 기록을 최신 날짜순으로 반환하는 것으로 제안한다. date는 정확한 YYYYMMDD 일치, query는 destination·content 검색으로 제안한다. 현재 기록 ID는 앱에서 생성하지만 이 제안에서는 서버가 생성하고 앱이 응답 ID를 사용한다. 통계는 현재 앱이 기록을 집계하므로 별도 통계 API를 정의하지 않는다.

```typescript
type WalkRecord = {
    "id": string;
    "date": string;
    "rate": 1 | 2 | 3 | 4 | 5;
    "routes": { "latitude": number; "longitude": number }[];
    "duration": number;
    "distance": number;
    "destination": string;
    "picture"?: string;
    "weather"?: "cloudy" | "partly_cloudy" | "mostly_cloudy" | "clear" | "rainy" | "thunder" | "snowy";
    "content": string;
};
```

서버 검증 제안: date는 유효한 날짜, duration·distance는 0 이상 유한수, rate·weather는 위 enum, routes는 유효한 좌표 배열. 수동 일지는 경로가 없고 시간·거리가 0일 수 있으므로 빈 배열과 0을 허용한다.

### 추천 코스 API

`POST /v1/walk-courses/recommendations` → 200 아래 응답. 현재 `courseFor()`를 서버로 이전할 경우의 제안이다.

```json
{
  "duration": "30분 미만",
  "course": "공원 위주",
  "social": "상관 없어요",
  "intensity": "가볍게",
  "time": "오후",
  "alternative": 0
}
```

| 필드 | 허용값 |
| --- | --- |
| `duration` | `30분 미만`, `30분-1시간`, `1시간-2시간`, `2시간 이상` |
| `course` | `공원 위주`, `도심 위주`, `하천 위주`, `숲길 위주` |
| `social` | `강아지가 많은 곳`, `적은 곳`, `상관 없어요` |
| `intensity` | `가볍게`, `보통`, `활동적이게` |
| `time` | `오전`, `오후`, `밤`, `새벽` |
| `alternative` | 선택적 0 이상 정수, 기본 0 |

다섯 필터는 필수로 제안한다. 온보딩의 walk_duration과 추천의 duration은 enum이 다르므로 별도로 처리한다.

응답: `{ "name": string, "stops": string[], "points": [number, number][], "routes": Coordinate[], "distance": number, "minutes": number, "reversed": boolean }`. points의 각 쌍은 `[위도, 경도]`, minutes는 분이다. 현재 구현은 정적 코스를 선택·반전·반복하는 방식이며 실시간 길찾기 결과가 아니다. 실제 길찾기로 대체할 경우 위치 입력과 공급자 연동 계약이 추가로 필요하다.

## 8. 실종·제보·채팅 — HTTP 계약 제안

현재 APIEmergency는 emergencyService를 그대로 노출하고 HTTP 응답 래퍼를 사용하지 않는다. 아래 경로는 신규 제안이며 API 어댑터를 추가해야 한다.

| 메서드 | 제안 경로 | 대응 기능 | 성공 |
| --- | --- | --- | --- |
| GET | `/v1/missing-pets` | getMissingPets | 200 MissingPet[] |
| POST | `/v1/missing-pets` | registerMissing | 201 MissingPet |
| DELETE | `/v1/missing-pets/{petId}` | resolveMissing | 204 |
| GET | `/v1/shelter-pets` | getShelterPets | 200 ShelterPet[] |
| GET | `/v1/reports` | getReports | 200 Report[] |
| GET | `/v1/reports/{reportId}` | getReport | 200 Report |
| POST | `/v1/reports` | submitReport | 201 Report |
| POST | `/v1/reports/{reportId}/messages` | sendMessage | 200 갱신된 Report |
| GET | `/v1/me/emergency` | 본인 실종모드·체크리스트 조회 | 200 아래 상태 객체 |
| PUT | `/v1/me/emergency/checks` | 체크리스트 저장 | 200 `{ "checks": string[] }` |

### 실종 등록·해제

`MissingPet = Pet + { "missingSince": number, "lastPosition": string, "lastTime": string, "ownerName": string, "ownerId"?: string }`.

등록 요청은 기존 반려견 스냅샷을 보존하기 위해 `MissingPet`에서 ownerId·ownerName을 제외한 객체를 제안한다. id는 기존 반려견 ID를 사용하며 서버에서 본인 반려견인지 검증한다. ownerId·ownerName은 서버에서 채운다. lastTime은 현재 자유 문자열이며 missingSince는 밀리초다.

등록 시 커뮤니티 실종 게시물을 생성 또는 갱신하고 본인 emergency 상태를 저장하며 체크리스트를 초기화한다. 동일 계정의 활성 실종모드는 현재 단일 슬롯이므로, 서버 제안에서는 이미 활성 상태인 다른 반려견이 있으면 409를 반환한다.

해제는 보호자만 가능하다. 실종 목록과 연결된 커뮤니티 게시물을 제거하고 본인 emergency와 체크리스트를 초기화한다. 관련 데이터 변경은 서버에서 일관되게 처리한다.

`GET /v1/me/emergency` 응답: `{ "emergency": MissingPet | null, "checks": string[] }`. 체크리스트 저장 요청: `{ "checks": ["체크 항목 ID"] }`. 항목 ID는 앱의 checklistGroups와 일치해야 하며 체크 상태를 전체 교체한다. 현재 정적 체크리스트 내용 조회 API는 없다.

### 제보·채팅 모델

```typescript
type Message = {
    "id": string;
    "content": string;
    "createdAt": number;
    "senderId"?: string;
    "senderName"?: string;
};

type Report = {
    "id": string;
    "petId": string;
    "petName": string;
    "time": string;
    "position": string;
    "content": string;
    "pictures": string[];
    "createdAt": number;
    "senderId"?: string;
    "senderName"?: string;
    "ownerId"?: string;
    "messages": Message[];
};
```

제보 요청: `{ "petId": string, "petName": string, "time": string, "position": string, "content": string, "pictures": string[] }`. 모두 필수이며 사진이 없으면 빈 배열이다. time은 현재 자유 문자열이다. 서버는 petId 존재 여부를 확인하고, petName을 대상 반려견 정보와 맞추며 id·createdAt·senderId·senderName·ownerId·빈 messages를 생성한다. 인증 관련 식별자를 요청에서 신뢰하지 않는다.

목록 쿼리 `incoming=true`는 받은 제보, `incoming=false` 또는 생략은 보낸 제보다. 생성 시각 내림차순으로 반환한다. 제보 상세와 메시지는 발신자·보호자만 조회·전송 가능하도록 제안한다.

메시지 요청: `{ "content": string }`. trim 후 빈 문자열은 400. 서버에서 발신자·시각·ID를 채우고 messages에 추가한 뒤 **Report 전체**를 반환한다. 현재 WebSocket·읽음 처리·푸시 알림 계약은 없다. 화면 갱신은 조회 API를 사용한다.

`rest/emergency.ts`의 APIMissingPetInfo는 lastSeen의 hours·minutes를 가지지만 현재 서비스는 MissingPet의 lastTime 문자열을 사용한다. 이 문서는 실제 서비스 모델을 기준으로 한다. 두 형식을 혼용하지 않는다.

### 보호동물

ShelterPet의 모든 필드는 현재 필수 문자열이다.

```typescript
type ShelterPet = {
    "id": string;
    "shelter": string;
    "region": string;
    "district": string;
    "town": string;
    "type": string;
    "gender": string;
    "age": string;
    "size": string;
    "found": string;
    "specials": string;
};
```

gender는 `여자` 같은 표시용 문자열, age는 `5살 추정` 같은 문자열이므로 Pet의 enum·숫자 타입과 다르다. 현재 반환값은 예제 데이터이며 외부 보호소 연동·검색 쿼리·갱신 주기는 미정이다.

## 9. 파일 업로드 — HTTP 계약 제안

현재 첨부는 앱 내부 파일로 복사되며 원격 업로드 API가 없다. 서버에 저장할 이미지·첨부는 먼저 업로드하고 URL을 본문에 사용한다. `file://` 등 기기 내부 URI를 서버 데이터에 저장하지 않는다.

`POST /v1/uploads`, 인증 필요.

- Content-Type: `multipart/form-data`.
- 폼 필드: `file` 한 개, 필수 바이너리.
- 성공: 201, `{ "id": string, "name": string, "url": string }`.
- 게시물은 id·url, 문의는 name·url, 반려견·산책 사진은 url을 사용한다.
- 허용 형식·크기·URL 만료 여부·미사용 파일 삭제 정책은 서버 합의가 필요하다. 현재 코드에서 확정된 업로드 제한은 없다.

## 10. 연동 시 결정할 항목

1. 제안 경로와 생성·삭제 성공 상태를 확정하고 로컬 어댑터를 HTTP 호출로 교체한다.
2. 회원 수정의 id·password 지원 여부 및 picture→profile 매핑을 결정한다.
3. 단일 반려견 응답과 다중 반려견 목록 사이 대표 반려견 규칙을 결정한다.
4. 일반 입력의 길이 제한·첨부 크기 제한·대량 목록 페이지네이션을 결정한다. 온보딩 검증과 게시물 첨부 10개 제한은 위 계약에 반영했다.
5. 로그인 세션의 만료·갱신·폐기 정책과 needs_onboarding의 서버 저장을 구현한다.
6. 실종 해제 후 기존 제보·메시지 유지 기간 및 탈퇴 데이터 삭제 범위를 결정한다.

이 문서는 현재 소스의 계약과 로컬 동작을 대조해 작성했다. 실제 서버 배포 상태나 API 통신 결과는 검증하지 않았다.
