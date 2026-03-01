# Cinemo

> React 학습을 위한 영화 정보 검색 및 리뷰 웹 애플리케이션

[Live Demo](https://semo08.github.io/ReactForSemo)

## 프로젝트 소개

Cinemo는 TMDb(The Movie Database) API를 활용하여 영화 정보를 검색하고, 사용자가 리뷰를 작성할 수 있는 웹 애플리케이션입니다. React의 핵심 개념(컴포넌트, Hooks, Context API, React Router 등)을 실습하기 위해 개발되었습니다.

## 주요 기능

- **영화 목록**: 인기 영화 목록 조회 (페이지네이션 지원)
- **영화 상세**: 줄거리, 제작사, 평점, 장르 등 상세 정보 확인
- **영화 검색**: 제목으로 영화 검색
- **시리즈/컬렉션**: 영화 시리즈 목록 조회
- **리뷰 시스템**: 1-10점 별점과 텍스트 리뷰 작성
- **찜 기능**: 관심 영화 즐겨찾기
- **Google 로그인**: OAuth 2.0 기반 인증
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크 테마**: Glassmorphism 스타일 UI

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18.3.1 |
| Routing | React Router 6.30.2 |
| Styling | CSS Modules |
| Backend | Firebase (Firestore) |
| Authentication | Google OAuth (Google Identity Services) |
| API | TMDb API |
| Deployment | GitHub Pages |


## 시작하기

### 필수 조건

- Node.js 16.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/semo08/ReactForSemo.git

# 디렉토리 이동
cd ReactForSemo

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# TMDb API
REACT_APP_TMDB_API_KEY=your_tmdb_api_key

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Firebase (리뷰 시스템 사용 시)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**API 키 발급:**
- TMDb API: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Google OAuth: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/)

### 실행

```bash
# 개발 서버 실행
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

## 프로젝트 구조

```
src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── Header.js       # 네비게이션 헤더
│   ├── Movie.js        # 영화 카드
│   ├── StarRating.js   # 별점 컴포넌트
│   ├── ReviewForm.js   # 리뷰 작성 폼
│   ├── ReviewCard.js   # 리뷰 카드
│   └── ReviewSection.js # 리뷰 섹션 통합
│
├── routes/             # 페이지 컴포넌트
│   ├── Home.js         # 메인 페이지 (영화 목록)
│   ├── Detail.js       # 영화 상세 페이지
│   ├── Search.js       # 검색 페이지
│   └── Collection.js   # 시리즈 페이지
│
├── contexts/           # 전역 상태 관리
│   └── AuthContext.js  # 로그인 상태 관리
│
├── firebase/           # Firebase 연동
│   ├── config.js       # Firebase 초기화
│   └── reviewService.js # 리뷰 CRUD 함수
│
├── App.js              # 최상위 컴포넌트 + 라우터
└── index.js            # 진입점
```

## 학습 가이드

이 프로젝트를 통해 다음 React 개념을 학습할 수 있습니다:

1. **컴포넌트와 Props** - `Movie.js`, `ReviewCard.js`
2. **useState Hook** - `StarRating.js`, `Search.js`
3. **useEffect Hook** - `Home.js`, `Detail.js`
4. **React Router** - `App.js`, 페이지 이동
5. **Context API** - `AuthContext.js`
6. **폼 처리** - `ReviewForm.js`
7. **CSS Modules** - 모든 컴포넌트

자세한 학습 가이드는 [REACT_STUDY_GUIDE.md](./markdown/REACT_STUDY_GUIDE.md)를 참고하세요. 

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm start` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | 테스트 실행 |
| `npm run deploy` | GitHub Pages 배포 |

## 향후 계획

- [ ] Firebase 리뷰 시스템 전체 기능 완성
- [ ] 예고편 재생 기능
- [ ] 캐스팅 정보 표시
- [ ] PWA 지원

## 기여하기

버그 리포트나 기능 제안은 [Issues](https://github.com/semo08/ReactForSemo/issues)에 등록해주세요.

## 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 참고 자료

- [React 공식 문서](https://ko.react.dev/)
- [React Router 문서](https://reactrouter.com/)
- [Firebase 문서](https://firebase.google.com/docs)
- [TMDb API 문서](https://developer.themoviedb.org/docs)

---

Made with React
