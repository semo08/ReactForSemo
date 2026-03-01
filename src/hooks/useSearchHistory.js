// ========================================
// useSearchHistory.js - 검색 기록 관리 커스텀 훅
// ========================================
// localStorage를 사용한 검색 기록 저장/조회/삭제

import { useState, useEffect, useCallback } from 'react';

// ========================================
// 상수 정의
// ========================================
const STORAGE_KEY = 'cinemo_search_history';
const MAX_HISTORY = 10; // 최대 저장 개수

// ========================================
// localStorage 유틸리티
// ========================================
const isStorageAvailable = () => {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        console.warn('localStorage 사용 불가:', e);
        return false;
    }
};

// ========================================
// useSearchHistory 훅
// ========================================
function useSearchHistory() {
    const [history, setHistory] = useState([]);

    // ========================================
    // 초기 로드: localStorage에서 기록 가져오기
    // ========================================
    useEffect(() => {
        if (!isStorageAvailable()) return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setHistory(parsed);
                }
            }
        } catch (error) {
            console.error('검색 기록 로드 실패:', error);
        }
    }, []);

    // ========================================
    // localStorage에 저장
    // ========================================
    const saveToStorage = useCallback((newHistory) => {
        if (!isStorageAvailable()) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('검색 기록 저장 실패:', error);
        }
    }, []);

    // ========================================
    // 검색어 추가
    // ========================================
    const addToHistory = useCallback((term) => {
        const trimmed = term.trim();

        // 빈 문자열 무시
        if (!trimmed) return;

        setHistory((prev) => {
            // 중복 제거 (기존 항목 삭제)
            const filtered = prev.filter(
                (item) => item.toLowerCase() !== trimmed.toLowerCase()
            );

            // 맨 앞에 추가
            const newHistory = [trimmed, ...filtered];

            // 최대 개수 제한
            const limited = newHistory.slice(0, MAX_HISTORY);

            // localStorage에 저장
            saveToStorage(limited);

            return limited;
        });
    }, [saveToStorage]);

    // ========================================
    // 개별 항목 삭제
    // ========================================
    const removeFromHistory = useCallback((term) => {
        setHistory((prev) => {
            const newHistory = prev.filter((item) => item !== term);
            saveToStorage(newHistory);
            return newHistory;
        });
    }, [saveToStorage]);

    // ========================================
    // 전체 삭제
    // ========================================
    const clearHistory = useCallback(() => {
        setHistory([]);
        saveToStorage([]);
    }, [saveToStorage]);

    return {
        history,           // 검색 기록 배열
        addToHistory,      // 검색어 추가 함수
        removeFromHistory, // 개별 삭제 함수
        clearHistory,      // 전체 삭제 함수
    };
}

export default useSearchHistory;
