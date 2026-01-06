// ========================================
// ScrollManager.js - 전역 스크롤 위치 관리
// ========================================
// 모든 페이지의 스크롤 위치를 자동으로 저장/복원
// location.key 기반으로 각 페이지 상태를 독립적으로 관리

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollManager() {
    // ========================================
    // React Router의 현재 위치 정보
    // ========================================
    const location = useLocation();
    /*
        location.key: 각 페이지 방문마다 고유한 키 생성
    */

    // ========================================
    // 스크롤 위치 저장소 (useRef)
    // ========================================
    const scrollPositions = useRef({});
    /*
        구조:
        {
          "default": 0,      // 홈페이지 스크롤 위치
          "abc123": 450,     // Detail 페이지 스크롤 위치
          "def456": 1200,    // 다른 페이지 스크롤 위치
        }
    */

    // ========================================
    // 스크롤 저장/복원 로직
    // ========================================
    useEffect(() => {
        // ========================================
        // 1. 스크롤 위치 저장 함수
        // ========================================
        const saveScroll = () => {
            /*
                현재 페이지의 스크롤 위치를 저장
                - location.key: 페이지 고유 식별자
                - window.scrollY: 현재 스크롤 위치 (픽셀 단위)
            */
            scrollPositions.current[location.key] = window.scrollY;
        };

        // ========================================
        // 2. 스크롤 위치 복원 함수
        // ========================================
        const restoreScroll = () => {
            const savedPosition = scrollPositions.current[location.key];

            if (savedPosition !== undefined) {
                // ✅ 저장된 위치가 있으면 복원
                window.scrollTo(0, savedPosition);

                // 데이터 로딩 완료 후 재복원 (페이지 높이 확보 대기)
                // 50ms, 100ms, 200ms 후 재시도
                const retryTimes = [50, 100, 200];
                retryTimes.forEach(delay => {
                    setTimeout(() => {
                        const currentScroll = window.scrollY;
                        if (Math.abs(currentScroll - savedPosition) > 10) {
                            window.scrollTo(0, savedPosition);
                        }
                    }, delay);
                });
            } else {
                // ❌ 새 페이지면 맨 위로
                window.scrollTo(0, 0);
            }
        };

        // ========================================
        // 3. 실행 순서
        // ========================================
        // (1) 페이지 진입 시 즉시 스크롤 복원
        restoreScroll();

        // (2) 스크롤 이벤트 리스너 등록
        // 사용자가 스크롤할 때마다 위치 저장
        window.addEventListener('scroll', saveScroll);

        // ========================================
        // 4. Cleanup (컴포넌트 unmount 시)
        // ========================================
        return () => {
            window.removeEventListener('scroll', saveScroll);
        };
    }, [location]); // location이 바뀔 때마다 실행

    // ========================================
    // 렌더링 없음 (null 반환)
    // ========================================
    /*
        이 컴포넌트는 UI를 그리지 않음
        오직 스크롤 위치 관리만 담당
    */
    return null;
}

export default ScrollManager;
