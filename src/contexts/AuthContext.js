// ========================================
// AuthContext.js - 로그인 상태 전역 관리
// ========================================
// React Context API를 사용한 인증 상태 관리
// 모든 컴포넌트에서 로그인 정보에 접근 가능

import { createContext, useContext, useState, useEffect } from 'react';

// ========================================
// Context 생성
// ========================================
/*
    Context: React의 전역 상태 관리 도구
    - props drilling 없이 모든 컴포넌트에서 접근 가능
    - Provider로 감싼 컴포넌트들만 사용 가능
*/
const AuthContext = createContext(null);

// ========================================
// AuthProvider 컴포넌트
// ========================================
/*
    모든 컴포넌트를 감싸는 Provider
    App.js에서 <AuthProvider>로 전체를 감싸면
    하위 모든 컴포넌트에서 로그인 정보 사용 가능
*/
export function AuthProvider({ children }) {
    // ========================================
    // State: 사용자 정보
    // ========================================
    const [user, setUser] = useState(null);

    /*
        user 객체 구조:
        {
            name: "홍길동",
            email: "hong@example.com",
            picture: "https://...",
            token: "eyJhbGciOiJ..."
        }

        null: 로그인 안 됨
        객체: 로그인 됨
    */

    // ========================================
    // 초기화: localStorage에서 사용자 정보 복원
    // ========================================
    useEffect(() => {
        /*
            페이지 새로고침 또는 재방문 시
            localStorage에 저장된 사용자 정보를 불러옴
            → 로그인 상태 유지!
        */
        const savedUser = localStorage.getItem('cinemoUser');

        if (savedUser) {
            try {
                // JSON 문자열을 객체로 변환
                const userData = JSON.parse(savedUser);
                setUser(userData);
                console.log('Login state restored:', userData.name);
            } catch (error) {
                console.error('사용자 정보 복원 실패:', error);
                // 잘못된 데이터면 삭제
                localStorage.removeItem('cinemoUser');
            }
        }
    }, []); // 컴포넌트 mount 시 1회만 실행

    // ========================================
    // 함수: 로그인 처리
    // ========================================
    const login = (credential) => {
        /*
            Google 로그인 성공 시 호출
            credential: Google에서 받은 JWT 토큰

            JWT 디코딩하여 사용자 정보 추출
        */

        try {
            // JWT 토큰 디코딩 (base64)
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);

            /*
                payload 구조 (Google JWT):
                {
                    email: "user@gmail.com",
                    name: "홍길동",
                    picture: "https://...",
                    sub: "구글 고유 ID",
                    ...
                }
            */

            const userData = {
                sub: payload.sub, // Google 고유 사용자 ID (리뷰 등에서 사용)
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                token: credential,
                loginTime: new Date().toISOString(), // 로그인 시간 저장
            };

            // State 업데이트
            setUser(userData);

            // localStorage에 저장 (브라우저 닫아도 유지)
            localStorage.setItem('cinemoUser', JSON.stringify(userData));

            console.log('✅ [DEBUG] 로그인 성공:', userData);
            console.log('✅ [DEBUG] 사용자 이메일:', userData.email);

            return userData;
        } catch (error) {
            console.error('❌ 로그인 처리 실패:', error);
            return null;
        }
    };

    // ========================================
    // 함수: 로그아웃 처리
    // ========================================
    const logout = () => {
        /*
            로그아웃:
            1. State 초기화
            2. localStorage 삭제
            3. Google 로그아웃 (선택)
        */

        console.log('👋 로그아웃:', user?.name);

        // State 초기화
        setUser(null);

        // localStorage에서 삭제
        localStorage.removeItem('cinemoUser');

        // Google 로그아웃 (선택 - 자동 로그인 방지)
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    // ========================================
    // Context 값 정의
    // ========================================
    /*
        value: 모든 컴포넌트에서 사용할 수 있는 값들
        - user: 현재 로그인한 사용자 정보 (null이면 비로그인)
        - login: 로그인 함수
        - logout: 로그아웃 함수
        - isLoggedIn: 로그인 여부 (편의 기능)
    */
    const value = {
        user,
        login,
        logout,
        isLoggedIn: user !== null, // 로그인 여부 체크
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ========================================
// Custom Hook: useAuth
// ========================================
/*
    다른 컴포넌트에서 쉽게 사용하기 위한 Hook

    사용법:
    const { user, login, logout, isLoggedIn } = useAuth();
*/
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth는 AuthProvider 내부에서만 사용 가능합니다.');
    }

    return context;
}

export default AuthContext;
