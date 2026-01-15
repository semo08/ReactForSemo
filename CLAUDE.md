# Movie App - 프로젝트 문서

## 프로젝트 개요
- **타입**: 영화 정보 검색 및 리뷰 웹 애플리케이션
- **데이터 소스**: The Movie Database (TMDb) API
- **기술 스택**: React 18.3.1, React Router v6, CSS Modules, Firebase (예정)
- **인증**: Google OAuth (Google Identity Services)
- **배포**: GitHub Pages (https://semo08.github.io/ReactForSemo)

---

## 완료된 기능 ✅

### 페이지
- **Home**: 인기 영화 목록 (페이지네이션 5페이지, 스크롤 위치 복원)
- **Detail**: 영화 상세 정보 (히어로, 줄거리, 제작사, 컬렉션, 리뷰)
- **Collection**: 영화 시리즈 목록
- **Search**: 영화 검색 기능

### 인증
- **Google 로그인/로그아웃** (AuthContext)
- **로그인 상태 유지** (localStorage)
- **프로필 표시** (Header)

### UI/UX
- **반응형 디자인** (모바일/태블릿/데스크톱)
- **다크 테마** (Glassmorphism)
- **영화 카드** (포스터 + 제목 심플 디자인)

---

## 리뷰 시스템 (완성) ⭐

### 개요
사용자가 영화에 **1-10점 별점**과 **텍스트 리뷰**를 작성할 수 있는 완전한 리뷰 시스템입니다.
현재 **더미 데이터**로 동작하며, Firebase 연동 시 실제 데이터 저장이 가능합니다.

---

## 구현된 컴포넌트

### 1. StarRating (별점 컴포넌트)

**위치**: `src/components/StarRating.js`

**기능**:
- 1-10점 별점 시스템 (10개 별)
- 클릭으로 별점 입력
- 호버 시 미리보기 (마우스 올리면 노란색 강조)
- 읽기 전용 모드 지원
- 크기 조절 (small/medium/large)
- 숫자 레이블 표시 ("8.0/10")

**Props**:
```javascript
<StarRating
  value={8.5}              // 현재 별점 (0-10)
  onChange={(v) => {}}     // 별점 변경 핸들러
  readOnly={false}         // 읽기 전용 여부
  size="medium"            // small | medium | large
  showLabel={true}         // 숫자 레이블 표시
/>
```

**스타일**:
- 채워진 별: `#ffd700` (골드)
- 빈 별: `#444444` (어두운 회색)
- 호버 효과: `scale(1.2)` + 그림자

---

### 2. ReviewForm (리뷰 작성/수정 폼)

**위치**: `src/components/ReviewForm.js`

**기능**:
- StarRating 통합 (별점 입력)
- Textarea (리뷰 텍스트 입력)
- 글자 수 제한 (최소 10자, 최대 500자)
- 실시간 글자 수 카운터
- 로그인 체크 (비로그인 시 안내 메시지)
- 폼 유효성 검사
- 로딩 상태 ("Saving..." 버튼 비활성화)
- 에러 메시지 표시
- 작성/수정 모드 구분

**Props**:
```javascript
<ReviewForm
  movieId={123}
  movieTitle="Avatar"
  moviePoster="https://..."
  initialData={null}       // 수정 시: { rating, reviewText, reviewId }
  mode="create"            // "create" | "edit"
  onSuccess={() => {}}     // 저장 성공 콜백
  onCancel={() => {}}      // 취소 콜백
/>
```

**유효성 검사**:
- 별점: 1-10 사이 필수
- 리뷰: 10자 이상 500자 이하
- 공백만 입력 불가

**비로그인 시**:
```
🔒 Please login to write a review
Sign in with Google to share your thoughts!
```

---

### 3. ReviewCard (개별 리뷰 카드)

**위치**: `src/components/ReviewCard.js`

**기능**:
- 프로필 사진 + 이름 표시
- StarRating (읽기 전용, small 크기)
- 리뷰 텍스트 표시
- 긴 텍스트 접기/펼치기 (150자 기준)
  - "Show more" / "Show less" 버튼
- 날짜 포맷팅 (상대 시간):
  - "just now"
  - "5 minutes ago"
  - "2 hours ago"
  - "3 days ago"
  - "Jan 15, 2025" (7일 이상)
- 수정/삭제 버튼 (본인 리뷰만 표시)
- 삭제 확인 모달

**Props**:
```javascript
<ReviewCard
  review={{
    id: "review123",
    userName: "홍길동",
    userPhoto: "https://...",
    rating: 8.5,
    reviewText: "Great movie!",
    createdAt: new Date(),
    userId: "user123"
  }}
  currentUserId="user123"
  onEdit={(review) => {}}
  onDelete={(id) => {}}
/>
```

**삭제 확인 모달**:
```
Delete Review
Are you sure you want to delete this review?
This action cannot be undone.
[Delete] [Cancel]
```

---

### 4. ReviewSection (리뷰 섹션 통합)

**위치**: `src/components/ReviewSection.js`

**기능**:
- **내 리뷰 영역**:
  - 리뷰가 없으면 ReviewForm 표시
  - 리뷰가 있으면 ReviewCard 표시 (수정/삭제 가능)
- **다른 사용자 리뷰 목록**:
  - ReviewCard 배열로 표시
  - 정렬 옵션 (최신순 / 평점 높은 순)
  - 로딩 스피너
  - 빈 상태 ("No reviews yet")
  - 더 보기 버튼 (페이지네이션 준비)
- **더미 데이터**:
  - 내 리뷰 1개
  - 다른 사용자 리뷰 3개
  - Firebase 연동 전까지 테스트용

**Props**:
```javascript
<ReviewSection
  movieId={123}
  movieTitle="Avatar"
  moviePoster="https://..."
/>
```

**정렬 옵션**:
- **Latest**: 최신순 (createdAt 기준)
- **Highest Rating**: 평점 높은 순 (rating 기준)

**UI 구조**:
```
┌─────────────────────────────────┐
│ ⭐ Ratings & Reviews             │
├─────────────────────────────────┤
│ 📝 My Review                     │
│ [ReviewForm 또는 ReviewCard]     │
├─────────────────────────────────┤
│ 💬 User Reviews (3)              │
│ [Latest ▼]                       │
│                                  │
│ [ReviewCard 1]                   │
│ [ReviewCard 2]                   │
│ [ReviewCard 3]                   │
│                                  │
│ [Load More]                      │
└─────────────────────────────────┘
```

---

## Detail 페이지 통합 ✅

**위치**: `src/routes/Detail.js`

**추가 내용**:
```javascript
import ReviewSection from "../components/ReviewSection";

// Collection 섹션 아래에 추가
<ReviewSection
    movieId={movie.id}
    movieTitle={movie.title}
    moviePoster={movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : ""}
/>
```

**Detail 페이지 전체 구조**:
1. Hero Section (배경, 포스터, 제목, 평점, 찜 버튼)
2. Info Bar (개봉일, 상영시간, 장르)
3. Overview (줄거리)
4. Details Grid (상세 정보)
5. Production Companies (제작사)
6. Collection (시리즈)
7. **Reviews Section (리뷰)** ← 신규 추가

---

## 스타일링 가이드

### 색상 팔레트
```css
/* 배경 */
--background-primary: #0f0f0f;
--background-secondary: #1a1a1a;

/* 강조 색상 */
--accent-red: #e50914;
--accent-red-hover: #f40612;

/* 텍스트 */
--text-primary: #ffffff;
--text-secondary: #cccccc;
--text-muted: #888888;

/* 별 색상 */
--star-filled: #ffd700;      /* 골드 */
--star-empty: #444444;       /* 어두운 회색 */
```

### Glassmorphism 카드
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.05) 0%,
  rgba(255, 255, 255, 0.02) 100%);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
```

---

## 더미 데이터 (Firebase 연동 전)

### 내 리뷰 (로그인 시)
```javascript
{
  id: "my-review-1",
  userId: user.uid,
  userName: user.name,
  userPhoto: user.picture,
  rating: 8.5,
  reviewText: "This is my review...",
  createdAt: new Date()
}
```

### 다른 사용자 리뷰 (3개)
```javascript
[
  {
    id: "review-1",
    userId: "user456",
    userName: "김철수",
    userPhoto: "https://i.pravatar.cc/150?img=1",
    rating: 9.0,
    reviewText: "Absolutely amazing movie!",
    createdAt: new Date(Date.now() - 86400000) // 1일 전
  },
  // ... 2개 더
]
```

프로필 사진: **pravatar.cc** 사용

---

## Firebase 연동 준비 (TODO)

### 1. Firebase 설정
- Firebase Console에서 프로젝트 생성
- Firestore Database 활성화
- Firebase SDK 설치: `npm install firebase`

### 2. 환경 변수 추가 (.env)
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 3. 파일 생성
- `src/firebase/config.js` - Firebase 초기화
- `src/firebase/reviewService.js` - 리뷰 CRUD 함수

### 4. Firestore 데이터 구조
```javascript
reviews/ {
  reviewId: {
    userId: "google_uid",
    userEmail: "user@example.com",
    userName: "홍길동",
    userPhoto: "https://...",
    movieId: 123,
    movieTitle: "Avatar",
    moviePoster: "https://...",
    rating: 8.0,
    reviewText: "Great movie!",
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

### 5. 코드 주석 해제
- `ReviewForm.js`: createReview, updateReview 호출
- `ReviewSection.js`: getUserReviewForMovie, getReviewsForMovie, deleteReview 호출

---

## 버그 수정 내역 🐛

### 1. 검색 결과 유지 문제 (Search Navigation)

**문제**: 검색 → 영화 클릭 → 상세 페이지 → 뒤로가기 시 검색 결과가 사라지고 빈 검색 페이지로 이동

**원인**: 검색어가 컴포넌트 state에만 저장되어 뒤로가기 시 초기화됨

**해결 방법**:
```javascript
// src/routes/Search.js

import { useSearchParams } from "react-router-dom";

function Search() {
    // URL 쿼리 파라미터로 검색어 관리
    const [searchParams, setSearchParams] = useSearchParams();
    const queryFromURL = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(queryFromURL);

    // URL에 검색어가 있으면 자동 검색
    useEffect(() => {
        if (queryFromURL) {
            searchMovies(queryFromURL);
        }
    }, []);

    // 검색 시 URL 업데이트
    const handleSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery }); // ← /search?q=avatar
        searchMovies(searchQuery);
    };
}
```

**결과**:
- URL: `/search` → `/search?q=avatar`
- 뒤로가기 시 검색 결과 유지 ✅
- 브라우저 히스토리 관리 개선 ✅

---

### 2. 로그아웃 후 로그인 버튼 미표시 문제

**문제**: 로그아웃 후 페이지 새로고침 전까지 로그인 버튼이 나타나지 않음

**원인**: Google OAuth 초기화 useEffect가 mount 시 1회만 실행 (빈 의존성 배열 `[]`)

**해결 방법**:
```javascript
// src/components/Header.js

useEffect(() => {
    // 비로그인 상태일 때만 로그인 버튼 렌더링
    if (!isLoggedIn && window.google) {
        window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
        });

        const loginButton = document.getElementById("loginBtn");
        if (loginButton) {
            loginButton.innerHTML = ""; // 기존 내용 초기화
            window.google.accounts.id.renderButton(loginButton, {
                theme: "filled_black",
                size: "medium",
                shape: "rectangular",
                text: "signin",
                logo_alignment: "left",
            });
        }
    }
}, [isLoggedIn]); // ← 의존성 배열에 isLoggedIn 추가
```

**변경 사항**:
- 의존성 배열: `[]` → `[isLoggedIn]`
- `loginButton.innerHTML = ""` 추가로 중복 렌더링 방지
- 로그인/로그아웃 시마다 버튼 상태 자동 업데이트

**결과**:
- 로그아웃 즉시 로그인 버튼 표시 ✅
- 새로고침 불필요 ✅

---

## 빌드 상태 ✅

```bash
npm run build
```

**결과**:
```
Compiled successfully.

File sizes after gzip:
  62.57 kB (+3.29 kB)  build/static/js/main.js
  6.88 kB (+1.7 kB)    build/static/css/main.css
```

**에러 없음!** 배포 준비 완료.

---

## 테스트 방법

### 로컬 테스트
```bash
npm start
```

1. Home 페이지에서 영화 선택
2. Detail 페이지로 이동
3. 페이지 하단 **⭐ Ratings & Reviews** 섹션 확인
4. **로그인 후**:
   - 별점 클릭 (1-10점)
   - 리뷰 작성 (10-500자)
   - Submit Review 버튼 클릭
   - 내 리뷰 카드 표시 확인
   - 수정/삭제 버튼 확인
5. **비로그인 시**:
   - "Please login to write a review" 메시지 표시

---

## 파일 구조

```
src/
├── components/
│   ├── StarRating.js            ⭐ 별점 컴포넌트
│   ├── StarRating.module.css
│   ├── ReviewForm.js            📝 리뷰 폼
│   ├── ReviewForm.module.css
│   ├── ReviewCard.js            💬 리뷰 카드
│   ├── ReviewCard.module.css
│   ├── ReviewSection.js         🎬 리뷰 섹션 통합
│   ├── ReviewSection.module.css
│   ├── Header.js                (기존)
│   ├── Movie.js                 (기존, 포스터+제목 심플화)
│   └── Movie.module.css
│
├── routes/
│   ├── Home.js                  (기존)
│   ├── Detail.js                (수정: ReviewSection 추가)
│   ├── Collection.js            (기존)
│   └── Search.js                (수정: URL 쿼리 파라미터)
│
└── contexts/
    └── AuthContext.js           (기존)
```

---

## 다음 단계

### 즉시 가능
- [x] 로컬 테스트 (`npm start`)
- [x] 더미 데이터로 UI 확인
- [ ] 커밋 & 푸시
- [ ] GitHub Pages 배포

### Firebase 연동 후
- [ ] Firebase 프로젝트 생성
- [ ] firebase/config.js 작성
- [ ] firebase/reviewService.js 작성 (CRUD 함수)
- [ ] 환경변수 추가 (.env + GitHub Secrets)
- [ ] 코드 주석 해제
- [ ] 실제 리뷰 저장/불러오기 테스트

---

## 주의사항

### Firebase 비용
- Firestore 무료 할당량: 읽기 50,000건/일, 쓰기 20,000건/일
- 초과 시 과금 발생 주의

### 보안
- Firestore 보안 규칙 설정 필수 (본인만 본인 리뷰 수정/삭제)
- `.env` 파일 `.gitignore`에 추가
- Firebase API 키 사용 제한 설정

---

## 현재 환경 변수

```
REACT_APP_TMDB_API_KEY=a29edf6ab4f6a55946f26c28cd66c6fb
REACT_APP_GOOGLE_CLIENT_ID=449831008348-ovm13145ksoute43uf256r19l3kvbmqf.apps.googleusercontent.com
```

**추가 필요 (Firebase 연동 시)**:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

---

## 완료! 🎉

**리뷰 시스템 코드 완성!**
- ✅ 4개 컴포넌트 구현
- ✅ Detail 페이지 통합
- ✅ 빌드 성공
- ✅ 더미 데이터로 동작 확인 가능
- ✅ 검색 결과 유지 (URL 쿼리 파라미터)
- ✅ 로그아웃 후 로그인 버튼 즉시 표시
- ⏳ Firebase 연동 대기

**로컬에서 테스트하고 Firebase 설정 후 실제 데이터 연동하면 완전히 작동합니다!** 🚀
