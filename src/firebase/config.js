// ========================================
// Firebase 설정 파일
// ========================================
// Firebase 프로젝트 연결 및 Firestore 초기화

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ========================================
// Firebase 프로젝트 설정
// ========================================
/*
    환경변수에서 Firebase 설정값 가져오기
    .env 파일에 다음 값들을 추가해야 함:

    REACT_APP_FIREBASE_API_KEY=your-api-key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
    REACT_APP_FIREBASE_PROJECT_ID=your-project-id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    REACT_APP_FIREBASE_APP_ID=your-app-id
*/

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// 디버깅: Firebase 환경변수 확인
console.log('🔍 [DEBUG] Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ 있음' : '❌ 없음',
    authDomain: firebaseConfig.authDomain ? '✅ 있음' : '❌ 없음',
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket ? '✅ 있음' : '❌ 없음',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✅ 있음' : '❌ 없음',
    appId: firebaseConfig.appId ? '✅ 있음' : '❌ 없음'
});

// ========================================
// Firebase 앱 초기화
// ========================================
const app = initializeApp(firebaseConfig);
console.log('✅ [DEBUG] Firebase 초기화 완료');

// ========================================
// Firestore 데이터베이스 인스턴스 생성
// ========================================
/*
    Firestore: Firebase의 NoSQL 데이터베이스
    - 찜한 영화 정보를 저장할 곳
    - 구조: users/{userId}/wishlist/{movieId}
*/
export const db = getFirestore(app);

// ========================================
// 기본 export
// ========================================
export default app;
