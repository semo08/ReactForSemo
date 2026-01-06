# React 스크롤 위치 복원 기능 완벽 가이드

> **난이도**: 초급~중급
> **학습 시간**: 30분
> **핵심 개념**: useRef, useLocation, useEffect, sessionStorage

---

## 📌 목차

1. [왜 필요한가?](#1-왜-필요한가)
2. [해결해야 할 문제들](#2-해결해야-할-문제들)
3. [핵심 개념 이해하기](#3-핵심-개념-이해하기)
4. [구현 방법](#4-구현-방법)
5. [전체 코드 분석](#5-전체-코드-분석)
6. [동작 흐름 정리](#6-동작-흐름-정리)
7. [주의사항 & 팁](#7-주의사항--팁)

---

## 1. 왜 필요한가?

### 🎯 사용자 경험 개선

**문제 상황:**
```
1. 홈 페이지에서 스크롤을 많이 내림 (10번째 영화까지 봄)
2. 영화 하나 클릭 → 상세 페이지로 이동
3. 뒤로가기 버튼 클릭
4. ❌ 홈 페이지 맨 위로 돌아감 (1번째 영화부터 다시 스크롤해야 함)
```

**해결:**
```
1. 홈 페이지에서 스크롤을 많이 내림 (10번째 영화까지 봄)
2. 영화 하나 클릭 → 상세 페이지로 이동
3. 뒤로가기 버튼 클릭
4. ✅ 홈 페이지가 이전 스크롤 위치(10번째 영화)에서 시작됨!
```

**결과:**
- 사용자가 다시 스크롤할 필요 없음 👍
- 자연스러운 네비게이션 경험 👍
- 페이지네이션 상태도 유지됨 👍

---

## 2. 해결해야 할 문제들

### ❌ 문제 1: React Router의 기본 동작

React Router는 기본적으로 **페이지 전환 시 스크롤을 맨 위로 올립니다**.

```javascript
// 기본 동작
Home (스크롤: 1000px) → Detail → 뒤로가기 → Home (스크롤: 0px) ❌
```

### ❌ 문제 2: 각 페이지마다 다른 스크롤 위치

여러 페이지를 방문하면 각각의 스크롤 위치를 기억해야 합니다.

```javascript
Home (1000px) → Detail (500px) → Search (200px) → 뒤로가기 → Detail (500px) → 뒤로가기 → Home (1000px)
```

**어려운 점:**
- 어떻게 각 페이지를 구분할까? 🤔
- URL만으로는 구분 불가 (같은 URL이어도 방문할 때마다 다를 수 있음)

### ❌ 문제 3: 데이터 로딩 시간

스크롤 위치를 복원하려고 해도 **데이터가 아직 로딩 안 됐으면 실패합니다**.

```javascript
1. 뒤로가기 → 스크롤 3000px로 복원 시도
2. 하지만 아직 영화 데이터 로딩 중 (빈 페이지)
3. 페이지 높이가 200px밖에 안 됨
4. 실제로는 200px까지만 스크롤됨 ❌
5. 데이터 로딩 완료 → 페이지 높이 5000px로 증가
6. 하지만 이미 늦음 (스크롤은 200px에 고정)
```

### ❌ 문제 4: 페이지네이션 상태 유지

```javascript
// 문제
1. 홈에서 3페이지로 이동
2. 영화 클릭 → Detail
3. 뒤로가기
4. ❌ 1페이지로 돌아감 (currentPage state가 초기화됨)
```

---

## 3. 핵심 개념 이해하기

### 🔑 1. `useRef` - 값 저장소

**useState vs useRef 비교:**

| 특징 | useState | useRef |
|------|----------|--------|
| 값 변경 시 리렌더링 | ✅ 발생 | ❌ 발생 안 함 |
| 컴포넌트 재실행 시 | 초기화 안 됨 | 초기화 안 됨 |
| 용도 | UI에 표시되는 상태 | UI와 무관한 데이터 저장 |

**예시:**

```javascript
// ❌ useState 사용 (비효율적)
const [scrollPositions, setScrollPositions] = useState({});

// 스크롤할 때마다:
setScrollPositions({ ...scrollPositions, [key]: 100 });  // 리렌더링 발생! 😱
setScrollPositions({ ...scrollPositions, [key]: 101 });  // 리렌더링 발생! 😱
setScrollPositions({ ...scrollPositions, [key]: 102 });  // 리렌더링 발생! 😱
// → 스크롤할 때마다 컴포넌트 재실행 → 성능 저하
```

```javascript
// ✅ useRef 사용 (효율적)
const scrollPositions = useRef({});

// 스크롤할 때마다:
scrollPositions.current[key] = 100;  // 리렌더링 없음! 👍
scrollPositions.current[key] = 101;  // 리렌더링 없음! 👍
scrollPositions.current[key] = 102;  // 리렌더링 없음! 👍
// → 성능 좋음!
```

**useRef 사용법:**

```javascript
import { useRef } from 'react';

function Component() {
  // 1. 생성
  const scrollPositions = useRef({});

  // 2. 값 저장
  scrollPositions.current[key] = 1000;

  // 3. 값 읽기
  const savedValue = scrollPositions.current[key];

  // ⚠️ 주의: .current 붙여야 함!
  // scrollPositions[key] ❌
  // scrollPositions.current[key] ✅
}
```

---

### 🔑 2. `useLocation` - 현재 위치 정보

React Router가 제공하는 Hook으로, 현재 페이지의 정보를 알려줍니다.

```javascript
import { useLocation } from 'react-router-dom';

function Component() {
  const location = useLocation();

  console.log(location);
  // {
  //   pathname: "/movie/123",     // URL 경로
  //   search: "?page=2",          // 쿼리 스트링
  //   hash: "#comments",          // 해시
  //   state: { from: "/" },       // 전달된 state
  //   key: "abc123"               // 고유 키 ⭐ 이게 핵심!
  // }
}
```

**⭐ `location.key`가 중요한 이유:**

```javascript
// 같은 URL이어도 방문할 때마다 다른 key!
홈 첫 방문:        pathname: "/", key: "default"
Detail 방문:       pathname: "/movie/123", key: "abc123"
뒤로가기로 홈:     pathname: "/", key: "default"  ← 같은 key!
다른 Detail 방문:  pathname: "/movie/456", key: "def456"
뒤로가기로 홈:     pathname: "/", key: "default"  ← 같은 key!

// → key로 "어떤 페이지 방문인지" 구분 가능! 🎯
```

**활용:**

```javascript
const scrollPositions = useRef({});

// 각 페이지 방문마다 독립적으로 스크롤 위치 저장
scrollPositions.current["default"] = 1000;   // 홈 첫 방문
scrollPositions.current["abc123"] = 500;     // Detail 방문
scrollPositions.current["default"] = 1000;   // 뒤로가기로 홈 (같은 key!)

// 뒤로가기로 돌아오면 같은 key이므로 저장된 값 불러올 수 있음!
```

---

### 🔑 3. `useEffect` - 생명주기 관리

컴포넌트의 **특정 시점**에 코드를 실행하는 Hook입니다.

**기본 문법:**

```javascript
useEffect(() => {
  // 실행할 코드

  return () => {
    // cleanup 함수 (선택사항)
  };
}, [의존성 배열]);
```

**의존성 배열에 따른 동작:**

```javascript
// 1. 의존성 배열 없음 - 매 렌더링마다 실행 (거의 안 씀)
useEffect(() => {
  console.log('매번 실행');
});

// 2. 빈 배열 - 마운트 시 1회만 실행
useEffect(() => {
  console.log('컴포넌트 첫 등장 시 1회만');
}, []);

// 3. 특정 값 - 그 값이 바뀔 때마다 실행 ⭐ 가장 많이 씀
useEffect(() => {
  console.log('location이 바뀔 때마다 실행');
}, [location]);
```

**cleanup 함수:**

```javascript
useEffect(() => {
  // 이벤트 리스너 등록
  window.addEventListener('scroll', handleScroll);

  // cleanup: 컴포넌트가 사라질 때 실행
  return () => {
    // 이벤트 리스너 제거 (메모리 누수 방지)
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

---

### 🔑 4. `sessionStorage` - 임시 저장소

브라우저가 제공하는 저장소로, **탭을 닫으면 삭제**됩니다.

**localStorage vs sessionStorage:**

| 특징 | localStorage | sessionStorage |
|------|--------------|----------------|
| 유효 기간 | 영구 (삭제 전까지) | 탭 닫으면 삭제 |
| 공유 범위 | 모든 탭 공유 | 현재 탭만 |
| 용도 | 로그인 정보, 설정 | 임시 데이터 |

**사용법:**

```javascript
// 저장
sessionStorage.setItem('key', 'value');
sessionStorage.setItem('pageNumber', '3');  // 숫자도 문자열로 저장됨!

// 불러오기
const value = sessionStorage.getItem('key');  // "value"
const page = sessionStorage.getItem('pageNumber');  // "3" (문자열!)

// 숫자로 변환
const pageNum = parseInt(page);  // 3 (숫자)

// 삭제
sessionStorage.removeItem('key');

// 전체 삭제
sessionStorage.clear();
```

**주의사항:**

```javascript
// ❌ 숫자를 직접 저장할 수 없음
sessionStorage.setItem('count', 123);  // 내부적으로 "123" 문자열로 저장됨

// ✅ toString() 명시적으로 사용 권장
sessionStorage.setItem('count', count.toString());

// ✅ 불러올 때 parseInt/parseFloat로 변환
const count = parseInt(sessionStorage.getItem('count'));
```

---

## 4. 구현 방법

### 📁 파일 구조

```
src/
├── components/
│   └── ScrollManager.js    ← 스크롤 관리 컴포넌트 (새로 생성)
├── routes/
│   └── Home.js             ← 페이지네이션 상태 저장 (수정)
└── App.js                  ← ScrollManager 추가 (수정)
```

---

### 1️⃣ ScrollManager.js - 전역 스크롤 관리

**역할:**
- 모든 페이지의 스크롤 위치를 자동으로 저장/복원
- location.key 기반으로 각 페이지를 독립적으로 관리

**전체 코드:**

```javascript
// src/components/ScrollManager.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollManager() {
    // ========================================
    // 1. 현재 위치 정보 가져오기
    // ========================================
    const location = useLocation();
    /*
        location.key: 각 페이지 방문마다 고유한 키
        - 홈 첫 방문: "default"
        - Detail 방문: "abc123"
        - 뒤로가기로 홈: "default" (같은 key!)
    */

    // ========================================
    // 2. 스크롤 위치 저장소 생성
    // ========================================
    const scrollPositions = useRef({});
    /*
        왜 useRef를 쓰나요?
        - 스크롤할 때마다 값이 바뀌는데
        - useState 쓰면 매번 리렌더링 발생 → 성능 저하
        - useRef는 값이 바뀌어도 리렌더링 안 함 → 성능 좋음!

        구조:
        {
          "default": 1000,    // 홈 페이지 스크롤 위치
          "abc123": 500,      // Detail 페이지 스크롤 위치
          "def456": 200,      // Search 페이지 스크롤 위치
        }
    */

    // ========================================
    // 3. 스크롤 저장/복원 로직
    // ========================================
    useEffect(() => {
        // ------------------------------
        // 3-1. 스크롤 저장 함수
        // ------------------------------
        const saveScroll = () => {
            // 현재 스크롤 위치를 location.key로 저장
            scrollPositions.current[location.key] = window.scrollY;

            console.log(`💾 저장: ${location.pathname} [${location.key}] = ${window.scrollY}px`);
        };

        // ------------------------------
        // 3-2. 스크롤 복원 함수
        // ------------------------------
        const restoreScroll = () => {
            // 현재 location.key로 저장된 스크롤 위치 찾기
            const savedPosition = scrollPositions.current[location.key];

            if (savedPosition !== undefined) {
                // ✅ 저장된 위치가 있으면 복원
                window.scrollTo(0, savedPosition);
                console.log(`✅ 복원 (즉시): ${location.pathname} → ${savedPosition}px`);

                // ------------------------------
                // 🔧 데이터 로딩 대기 후 재복원
                // ------------------------------
                /*
                    문제: 즉시 복원하면 데이터가 아직 로딩 안 돼서 실패할 수 있음
                    해결: 50ms, 100ms, 200ms 후 재시도
                */
                const retryTimes = [50, 100, 200];
                retryTimes.forEach(delay => {
                    setTimeout(() => {
                        const currentScroll = window.scrollY;

                        // 현재 스크롤 위치와 목표 위치가 10px 이상 차이나면
                        if (Math.abs(currentScroll - savedPosition) > 10) {
                            // 다시 복원 시도
                            window.scrollTo(0, savedPosition);
                            console.log(`🔧 재복원 (${delay}ms): ${currentScroll}px → ${savedPosition}px`);
                        }
                    }, delay);
                });
            } else {
                // ❌ 저장된 위치가 없으면 맨 위로 (새 페이지)
                window.scrollTo(0, 0);
                console.log(`🆕 새 페이지: ${location.pathname} → 맨 위로`);
            }
        };

        // ------------------------------
        // 3-3. 실행 순서
        // ------------------------------

        // (1) 페이지 진입 시 즉시 스크롤 복원
        restoreScroll();

        // (2) 스크롤 이벤트 리스너 등록
        //     사용자가 스크롤할 때마다 위치 저장
        window.addEventListener('scroll', saveScroll);

        // (3) cleanup: 컴포넌트 unmount 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('scroll', saveScroll);
        };

    }, [location]); // location이 바뀔 때마다 실행 (페이지 이동 시)

    // ========================================
    // 4. 렌더링 없음
    // ========================================
    /*
        이 컴포넌트는 UI를 그리지 않음
        오직 스크롤 위치 관리만 담당
    */
    return null;
}

export default ScrollManager;
```

**핵심 포인트:**

1. **location.key로 페이지 구분**
   - URL이 같아도 방문할 때마다 다른 key
   - 뒤로가기하면 같은 key로 돌아옴

2. **useRef로 성능 최적화**
   - 스크롤할 때마다 값 저장하는데
   - useState 쓰면 매번 리렌더링 → 느림
   - useRef 쓰면 리렌더링 없음 → 빠름

3. **재복원 메커니즘**
   - 즉시 복원 + 50ms, 100ms, 200ms 후 재시도
   - 데이터 로딩 완료 시점을 정확히 알 수 없으므로 여러 번 재시도

---

### 2️⃣ App.js - ScrollManager 추가

```javascript
// src/App.js
import ScrollManager from "./components/ScrollManager";

function App() {
  return (
    <AuthProvider>
      <Router basename="/ReactForSemo">
        {/* ⭐ ScrollManager 추가 - 모든 페이지에 적용됨 */}
        <ScrollManager />

        <Routes>
          <Route path="/movie/:id" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**왜 여기에 넣나요?**
- `<Router>` 안에 있어야 `useLocation()` 사용 가능
- `<Routes>` 밖에 있어야 모든 페이지에 적용됨

---

### 3️⃣ Home.js - 페이지네이션 상태 저장

**문제:**
```javascript
// 기본 상태
const [currentPage, setCurrentPage] = useState(1);

// 뒤로가기하면?
// → 컴포넌트가 새로 마운트되면서 currentPage가 1로 초기화됨 😱
```

**해결:**
```javascript
// sessionStorage에서 복원
const [currentPage, setCurrentPage] = useState(() => {
  const savedPage = sessionStorage.getItem('homeCurrentPage');
  return savedPage ? parseInt(savedPage) : 1;
});

// 페이지 바뀔 때마다 저장
useEffect(() => {
  sessionStorage.setItem('homeCurrentPage', currentPage.toString());
}, [currentPage]);
```

**전체 코드:**

```javascript
// src/routes/Home.js
import { useState, useEffect } from "react";

function Home() {
  // ========================================
  // 페이지네이션 상태 (sessionStorage에서 복원)
  // ========================================
  const [currentPage, setCurrentPage] = useState(() => {
    // 뒤로가기로 돌아왔을 때 이전 페이지 번호 복원
    const savedPage = sessionStorage.getItem('homeCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });

  // ========================================
  // currentPage를 sessionStorage에 저장
  // ========================================
  useEffect(() => {
    // 페이지가 바뀔 때마다 저장 (뒤로가기 시 복원용)
    sessionStorage.setItem('homeCurrentPage', currentPage.toString());
  }, [currentPage]);

  // 나머지 코드...
}
```

---

## 5. 전체 코드 분석

### 🔍 시나리오별 동작 분석

#### 시나리오 1: 첫 방문

```javascript
// 1. 홈 페이지 첫 방문
ScrollManager:
  location.key = "default"
  scrollPositions.current = {}  // 빈 객체
  savedPosition = undefined
  → window.scrollTo(0, 0)  // 맨 위로
  → console.log("🆕 새 페이지: / → 맨 위로")

Home:
  currentPage = sessionStorage.getItem('homeCurrentPage')  // null
  → currentPage = 1  // 기본값
  → 1페이지 데이터 로드
```

#### 시나리오 2: 스크롤 & 저장

```javascript
// 2. 사용자가 스크롤 내림
(스크롤 이벤트 발생)
ScrollManager.saveScroll():
  scrollPositions.current["default"] = 100
  → console.log("💾 저장: / [default] = 100px")

(더 스크롤)
  scrollPositions.current["default"] = 500
  → console.log("💾 저장: / [default] = 500px")

(더 스크롤)
  scrollPositions.current["default"] = 1000
  → console.log("💾 저장: / [default] = 1000px")
```

#### 시나리오 3: Detail 페이지 이동

```javascript
// 3. 영화 클릭 → Detail 페이지로 이동
ScrollManager:
  location.key = "abc123"  // 새로운 key!
  scrollPositions.current = { default: 1000 }  // 이전 값 유지됨 (useRef!)
  savedPosition = undefined  // "abc123" key는 처음
  → window.scrollTo(0, 0)  // 맨 위로
  → console.log("🆕 새 페이지: /movie/123 → 맨 위로")
```

#### 시나리오 4: 뒤로가기 (핵심!)

```javascript
// 4. 뒤로가기 버튼 클릭
ScrollManager:
  location.key = "default"  // 이전과 같은 key!
  scrollPositions.current = { default: 1000, abc123: 0 }
  savedPosition = 1000  // "default" key에 저장된 값!

  → window.scrollTo(0, 1000)  // 즉시 복원 시도
  → console.log("✅ 복원 (즉시): / → 1000px")

  → setTimeout 50ms: 재확인
  → setTimeout 100ms: 재확인 (데이터 로딩 완료 시점 예상)
  → setTimeout 200ms: 최종 확인

Home:
  currentPage = sessionStorage.getItem('homeCurrentPage')  // "1"
  → currentPage = 1
  → 1페이지 데이터 로드
  → 데이터 로딩 완료
  → ScrollManager의 setTimeout이 재복원 실행
  → 정확히 1000px 위치로 복원 완료!
```

#### 시나리오 5: 페이지네이션 이동

```javascript
// 5. 3페이지로 이동
Home:
  handlePageChange(3) 호출
  → setCurrentPage(3)
  → useEffect 실행:
     sessionStorage.setItem('homeCurrentPage', '3')
  → window.scrollTo(0, 0)  // 페이지 전환 시 맨 위로

ScrollManager:
  location.key = "default"  // 같은 페이지 내 이동이므로 key 동일
  (스크롤 0으로 이동했으므로)
  scrollPositions.current["default"] = 0
```

#### 시나리오 6: 3페이지 → Detail → 뒤로가기

```javascript
// 6-1. 3페이지에서 스크롤 내림
ScrollManager:
  scrollPositions.current["default"] = 2000

// 6-2. Detail로 이동
ScrollManager:
  location.key = "def456"
  scrollPositions.current = { default: 2000, abc123: 0 }

// 6-3. 뒤로가기
ScrollManager:
  location.key = "default"
  savedPosition = 2000
  → window.scrollTo(0, 2000)  // 복원 시도

Home:
  currentPage = sessionStorage.getItem('homeCurrentPage')  // "3"
  → currentPage = 3  ← 3페이지로 복원!
  → 3페이지 데이터 로드
  → 데이터 로딩 완료
  → 스크롤 2000px로 정확히 복원!
```

---

## 6. 동작 흐름 정리

### 📊 전체 흐름도

```
┌─────────────────────────────────────────────────────────┐
│ App.js                                                   │
│  └─ <Router>                                            │
│      └─ <ScrollManager />  ← 모든 페이지 감시           │
│      └─ <Routes>                                        │
│          ├─ <Home />                                     │
│          ├─ <Detail />                                   │
│          └─ <Search />                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ScrollManager (전역 관리자)                              │
│                                                          │
│  useRef: { default: 1000, abc123: 500, ... }  ← 메모리 │
│                                                          │
│  useEffect:                                              │
│    - location 변경 감지 → restoreScroll()               │
│    - scroll 이벤트 감지 → saveScroll()                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ sessionStorage (브라우저 저장소)                         │
│                                                          │
│  homeCurrentPage: "3"  ← 페이지 번호                    │
└─────────────────────────────────────────────────────────┘
```

### 🔄 페이지 이동 시 실행 순서

```
1. 사용자가 Link 클릭
   ↓
2. React Router가 URL 변경
   ↓
3. location 객체 변경 (새로운 location.key 생성)
   ↓
4. ScrollManager의 useEffect 실행 (location 의존성)
   ↓
5. restoreScroll() 실행
   - 저장된 위치 찾기
   - window.scrollTo() 실행 (즉시 복원)
   - setTimeout으로 재복원 예약
   ↓
6. 새 페이지 컴포넌트 마운트 (예: Home)
   - useState 초기화 (sessionStorage에서 복원)
   - useEffect로 데이터 로딩 시작
   ↓
7. 데이터 로딩 중...
   ↓
8. setTimeout 50ms 실행 → 재복원 시도
   ↓
9. 데이터 로딩 완료!
   ↓
10. setTimeout 100ms 실행 → 재복원 성공!
    ↓
11. setTimeout 200ms 실행 → 이미 복원됨, 스킵
    ↓
12. 스크롤 복원 완료! ✅
```

---

## 7. 주의사항 & 팁

### ⚠️ 주의사항

#### 1. useRef의 .current 잊지 말기

```javascript
// ❌ 틀린 코드
const scrollPositions = useRef({});
scrollPositions[key] = 100;  // 작동 안 함!

// ✅ 올바른 코드
const scrollPositions = useRef({});
scrollPositions.current[key] = 100;  // .current 필수!
```

#### 2. sessionStorage는 문자열만 저장

```javascript
// ❌ 숫자 그대로 저장
sessionStorage.setItem('page', 3);  // "3"으로 자동 변환됨

// ✅ 명시적으로 변환
sessionStorage.setItem('page', currentPage.toString());
const page = parseInt(sessionStorage.getItem('page'));
```

#### 3. useEffect cleanup 함수 필수

```javascript
// ❌ cleanup 없으면 메모리 누수!
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  // return 없음 → 이벤트 리스너 계속 쌓임
}, []);

// ✅ cleanup으로 정리
useEffect(() => {
  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

#### 4. ScrollManager는 Router 안에 위치

```javascript
// ❌ Router 밖에 있으면 useLocation 사용 불가
<ScrollManager />
<Router>
  <Routes>...</Routes>
</Router>

// ✅ Router 안에 있어야 함
<Router>
  <ScrollManager />
  <Routes>...</Routes>
</Router>
```

---

### 💡 성능 최적화 팁

#### 1. 로그 제거 (프로덕션)

개발 중에는 로그가 유용하지만, 배포 시에는 제거하세요:

```javascript
// 개발 환경에서만 로그
if (process.env.NODE_ENV === 'development') {
  console.log(`💾 스크롤 저장: ${window.scrollY}px`);
}
```

#### 2. 스크롤 이벤트 throttle

스크롤 이벤트는 매우 자주 발생합니다. throttle을 사용하면 성능 향상:

```javascript
// lodash의 throttle 사용 예시
import { throttle } from 'lodash';

const saveScroll = throttle(() => {
  scrollPositions.current[location.key] = window.scrollY;
}, 100);  // 100ms마다 최대 1회만 실행
```

#### 3. 재복원 횟수 조정

데이터 로딩이 빠른 경우 재복원 횟수를 줄일 수 있습니다:

```javascript
// 기본 (안정적)
const retryTimes = [50, 100, 200];

// 빠른 환경 (최적화)
const retryTimes = [50, 150];
```

---

### 🎓 심화 학습

#### 더 공부하면 좋을 것들:

1. **React Router v6 Data APIs**
   - `loader` 함수로 데이터 미리 로드
   - 스크롤 복원이 더 쉬워짐

2. **Intersection Observer API**
   - 스크롤 위치가 아닌 "어떤 요소가 보이는지" 기반 복원
   - 더 정확한 복원 가능

3. **Custom Hooks 만들기**
   ```javascript
   function useScrollRestoration() {
     // ScrollManager 로직을 hook으로 분리
   }
   ```

4. **전역 상태 관리 (Zustand, Recoil)**
   - sessionStorage 대신 전역 상태로 관리
   - 더 React스러운 방식

---

## 📚 참고 자료

- [React Hooks 공식 문서](https://react.dev/reference/react)
- [React Router 공식 문서](https://reactrouter.com/)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: Window.scrollTo()](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo)

---

## ✅ 학습 체크리스트

- [ ] useRef의 역할과 useState와의 차이 이해
- [ ] useLocation의 location.key 개념 이해
- [ ] useEffect의 의존성 배열 동작 원리 이해
- [ ] sessionStorage 사용법 이해
- [ ] 전체 동작 흐름 이해
- [ ] 실제 코드 작성 및 테스트 완료
- [ ] 콘솔 로그 분석 가능

---

**🎉 축하합니다! 스크롤 위치 복원 기능을 완벽히 마스터했습니다!**

이 개념들은 React 개발에서 매우 자주 사용되므로, 잘 복습하고 다른 프로젝트에도 적용해보세요! 💪
