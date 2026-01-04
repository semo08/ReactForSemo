// ========================================
// Header.js - Cinemo 헤더 컴포넌트
// ========================================
// 모든 페이지 상단에 표시되는 고정 헤더
// 로고, 네비게이션, 스크롤 효과 포함

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import { useAuth } from '../contexts/AuthContext';

// Google OAuth Client ID (.env에서 가져오기)
// .env 파일에 REACT_APP_GOOGLE_CLIENT_ID="your-client-id" 형식으로 저장
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function Header() {
    // ========================================
    // 0. 로그인 상태 관리
    // ========================================
    const { user, login, logout, isLoggedIn } = useAuth();
    /*
        user: 로그인한 사용자 정보 객체 (또는 null)
        login: 로그인 함수
        logout: 로그아웃 함수
        isLoggedIn: 로그인 여부 (true/false)
    */

    // ========================================
    // 1. 현재 페이지 위치 감지
    // ========================================
    // useLocation: 현재 URL 경로를 알려주는 Hook
    // 예: "/" (홈페이지), "/movie/123" (상세페이지)
    const location = useLocation();

    // ========================================
    // 2. 모바일 메뉴 열림/닫힘 상태
    // ========================================
    // true: 메뉴 열림, false: 메뉴 닫힘
    const [menuOpen, setMenuOpen] = useState(false);

    // ========================================
    // 3. 스크롤 감지 상태
    // ========================================
    // true: 스크롤 내림 (배경 진하게), false: 맨 위 (배경 투명)
    const [scrolled, setScrolled] = useState(false);

    // ========================================
    // 4. 스크롤 이벤트 감지 (배경 진해지는 효과)
    // ========================================
    useEffect(() => {
        // 스크롤 이벤트 핸들러 함수
        const handleScroll = () => {
            // window.scrollY: 현재 스크롤 위치 (픽셀 단위)
            // 50px 이상 스크롤하면 배경 진하게
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        // 스크롤 이벤트 리스너 등록
        // 사용자가 스크롤할 때마다 handleScroll 함수 실행
        window.addEventListener('scroll', handleScroll);

        // Cleanup 함수: 컴포넌트가 사라질 때 이벤트 리스너 제거
        // 메모리 누수 방지
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // 빈 배열: 컴포넌트 mount 시 1회만 실행

    // ========================================
    // Google OAuth 초기화
    // ========================================
    useEffect(() => {
        /*
            Google Identity Services 초기화
            - Google Script가 로드된 후 실행되어야 함
            - 로그인 버튼 렌더링
        */

        // Google Script가 로드되었는지 확인
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
            });

            // 로그인 버튼 렌더링 (loginBtn ID를 가진 요소에)
            const loginButton = document.getElementById("loginBtn");
            if (loginButton) {
                window.google.accounts.id.renderButton(loginButton, {
                    theme: "filled_black",   // 다크 테마 (어두운 배경)
                    size: "medium",          // 중간 크기
                    shape: "rectangular",    // 사각형 (기본)
                    text: "signin",          // "Sign in" (짧은 텍스트)
                    logo_alignment: "left",  // 로고 왼쪽 정렬
                });
            }
        } else {
            console.warn("Google Identity Services script가 로드되지 않았습니다.");
        }
    }, []); // 컴포넌트 mount 시 1회만 실행

    // ========================================
    // Google OAuth 응답 처리 함수
    // ========================================
    const handleCredentialResponse = (response) => {
        /*
            Google 로그인 성공 시 호출되는 함수
            response.credential: JWT 토큰 (사용자 정보 포함)
        */
        console.log("✅ Google 로그인 응답 받음!");

        // AuthContext의 login 함수 호출
        // → 토큰 디코딩 + 사용자 정보 저장 + localStorage 저장
        const userData = login(response.credential);

        if (userData) {
            console.log("👤 로그인 완료:", userData.name);
        }
    };

    // ========================================
    // 5. 모바일 메뉴 토글 함수
    // ========================================
    const toggleMenu = () => {
        setMenuOpen(!menuOpen); // true ↔ false 전환
    };

    return (
        <>
            {/* ========================================
                헤더 본체
                ======================================== */}
            <header
                className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
            >
                {/*
                    className 설명:
                    - styles.header: 기본 헤더 스타일
                    - scrolled ? styles.scrolled : '':
                      스크롤 내리면 styles.scrolled 클래스 추가
                      → CSS에서 배경 진하게 만듦
                */}

                <div className={styles.container}>
                    {/* ========================================
                        왼쪽: 로고 (삼각형 + CINEMO)
                        ======================================== */}
                    <Link to="/" className={styles.logo}>
                        {/*
                            Link: React Router의 링크 컴포넌트
                            to="/": 클릭하면 홈페이지로 이동
                        */}
                        <span className={styles.triangle}>▲</span>
                        <span className={styles.logoText}>CINEMO</span>
                    </Link>

                    {/* ========================================
                        중앙: 네비게이션 (데스크톱용)
                        ======================================== */}
                    <nav className={styles.nav}>
                        {/* Home 링크 */}
                        <Link
                            to="/"
                            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
                        >
                            {/*
                                location.pathname === '/' : 현재 페이지가 홈인지 확인
                                맞으면 styles.active 클래스 추가 → 빨간색으로 강조
                            */}
                            Home
                        </Link>

                        {/* Search 링크 */}
                        <Link
                            to="/search"
                            className={`${styles.navLink} ${location.pathname === '/search' ? styles.active : ''}`}
                        >
                            Search
                        </Link>

                        {/* 로그인 / 프로필 영역 */}
                        {isLoggedIn ? (
                            // 로그인 상태: 프로필 + 로그아웃
                            <div className={styles.profileArea}>
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className={styles.profileImage}
                                    title={user.name}
                                />
                                <span className={styles.userName}>{user.name}</span>
                                <button
                                    onClick={logout}
                                    className={styles.logoutButton}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // 비로그인 상태: 커스텀 로그인 버튼
                            <div className={styles.loginArea}>
                                <div id="loginBtn" className={styles.googleLoginButton}></div>
                            </div>
                        )}
                    </nav>

                    {/* ========================================
                        오른쪽: 모바일 햄버거 메뉴 버튼
                        ======================================== */}
                    <button
                        className={styles.menuButton}
                        onClick={toggleMenu}
                        aria-label="메뉴 열기"
                    >
                        {/*
                            aria-label: 스크린 리더를 위한 설명
                            onClick={toggleMenu}: 클릭하면 메뉴 열림/닫힘
                        */}
                        <span className={styles.hamburger}>≡</span>
                    </button>
                </div>
            </header>

            {/* ========================================
                모바일 메뉴 드로어 (사이드 메뉴)
                ======================================== */}
            {menuOpen && (
                <>
                    {/* 어두운 오버레이 (배경 클릭하면 닫힘) */}
                    <div
                        className={styles.overlay}
                        onClick={toggleMenu}
                    ></div>

                    {/* 슬라이드 메뉴 */}
                    <div className={styles.drawer}>
                        {/* 닫기 버튼 */}
                        <button
                            className={styles.closeButton}
                            onClick={toggleMenu}
                            aria-label="메뉴 닫기"
                        >
                            ✕
                        </button>

                        {/* 모바일 네비게이션 */}
                        <nav className={styles.mobileNav}>
                            <Link
                                to="/"
                                className={styles.mobileNavLink}
                                onClick={toggleMenu} // 클릭하면 메뉴 닫힘
                            >
                                🏠 Home
                            </Link>
                            <Link
                                to="/search"
                                className={styles.mobileNavLink}
                                onClick={toggleMenu}
                            >
                                🔍 Search
                            </Link>

                            {/* 로그인 / 프로필 영역 (모바일) */}
                            {isLoggedIn ? (
                                // 로그인 상태: 프로필 정보 + 로그아웃
                                <div className={styles.mobileProfileArea}>
                                    <div className={styles.mobileUserInfo}>
                                        <img
                                            src={user.picture}
                                            alt={user.name}
                                            className={styles.mobileProfileImage}
                                        />
                                        <div className={styles.mobileUserText}>
                                            <span className={styles.mobileUserName}>{user.name}</span>
                                            <span className={styles.mobileUserEmail}>{user.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            toggleMenu();
                                        }}
                                        className={styles.mobileLogoutButton}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            ) : (
                                // 비로그인 상태: 로그인 안내
                                <div className={styles.mobileLoginArea}>
                                    <p className={styles.mobileLoginText}>
                                        Login required
                                    </p>
                                    <p className={styles.mobileLoginSubText}>
                                        Please login on desktop
                                    </p>
                                </div>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}

export default Header;
