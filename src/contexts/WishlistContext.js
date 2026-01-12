// ========================================
// WishlistContext.js - 찜 기능 전역 상태 관리
// ========================================
// 사용자의 찜한 영화 목록을 관리하는 Context

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// ========================================
// Context 생성
// ========================================
const WishlistContext = createContext();

// ========================================
// WishlistProvider 컴포넌트
// ========================================
export function WishlistProvider({ children }) {
    // ========================================
    // 1. 로그인 정보 가져오기
    // ========================================
    const { user, isLoggedIn } = useAuth();

    // ========================================
    // 2. 찜 목록 상태
    // ========================================
    const [wishlist, setWishlist] = useState([]);
    /*
        wishlist 구조:
        [
            {
                id: 123,
                title: "Avatar",
                poster_path: "/abc.jpg",
                vote_average: 7.5,
                addedAt: 1234567890
            },
            ...
        ]
    */

    const [loading, setLoading] = useState(false);

    // ========================================
    // 3. Firestore 경로 생성
    // ========================================
    // useCallback으로 감싸서 ESLint 에러 방지
    const getWishlistRef = useCallback((movieId) => {
        if (!user?.email) return null;

        // users/{userId}/wishlist/{movieId} 경로
        return doc(db, 'users', user.email, 'wishlist', String(movieId));
    }, [user?.email]);

    const getWishlistCollectionRef = useCallback(() => {
        if (!user?.email) return null;

        // users/{userId}/wishlist 컬렉션
        return collection(db, 'users', user.email, 'wishlist');
    }, [user?.email]);

    // ========================================
    // 4. 찜 목록 불러오기 (Firestore → State)
    // ========================================
    // useCallback으로 감싸서 함수가 불필요하게 재생성되는 것 방지
    // ESLint exhaustive-deps 에러 해결
    const loadWishlist = useCallback(async () => {
        if (!isLoggedIn || !user?.email) {
            setWishlist([]);
            return;
        }

        try {
            setLoading(true);

            const wishlistRef = getWishlistCollectionRef();
            if (!wishlistRef) return;

            // Firestore에서 찜 목록 가져오기 (최신순 정렬)
            const q = query(wishlistRef, orderBy('addedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            console.log("querySnapshot: ", querySnapshot);

            const movies = [];
            querySnapshot.forEach((doc) => {
                movies.push({
                    ...doc.data(),
                    id: doc.id // document ID 우선 (항상 문자열)
                });
            });

            setWishlist(movies);
            console.log(`✅ 찜 목록 로드 완료: ${movies.length}개`);
        } catch (error) {
            console.error('찜 목록 로드 실패:', error);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, user?.email, getWishlistCollectionRef]); // dependencies 추가

    // ========================================
    // 5. 찜 추가
    // ========================================
    const addToWishlist = useCallback(async (movie) => {
        /*
            movie 파라미터:
            {
                id: 123,
                title: "Avatar",
                poster_path: "/abc.jpg",
                vote_average: 7.5,
                ...기타 영화 정보
            }
        */

        if (!isLoggedIn) {
            alert('로그인이 필요합니다!');
            return false;
        }

        try {
            const movieRef = getWishlistRef(movie.id);
            if (!movieRef) return false;

            // Firestore에 저장할 데이터
            const wishlistData = {
                id: String(movie.id), // 문자열로 저장 (Firestore document ID와 일치)
                title: movie.title,
                poster_path: movie.poster_path || null,
                backdrop_path: movie.backdrop_path || null,
                vote_average: movie.vote_average || 0,
                release_date: movie.release_date || null,
                overview: movie.overview || '',
                addedAt: Date.now() // 추가한 시간 (밀리초)
            };

            // Firestore에 저장
            await setDoc(movieRef, wishlistData);

            // State 업데이트 (즉시 반영)
            setWishlist(prev => [wishlistData, ...prev]);

            console.log(`✅ 찜 추가: ${movie.title}`);
            return true;
        } catch (error) {
            console.error('찜 추가 실패:', error);
            alert('찜 추가에 실패했습니다.');
            return false;
        }
    }, [isLoggedIn, getWishlistRef]);

    // ========================================
    // 6. 찜 삭제
    // ========================================
    const removeFromWishlist = useCallback(async (movieId) => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다!');
            return false;
        }

        try {
            const movieRef = getWishlistRef(movieId);
            if (!movieRef) return false;

            // Firestore에서 삭제
            await deleteDoc(movieRef);

            // State 업데이트 (즉시 반영)
            setWishlist(prev => prev.filter(movie => movie.id !== String(movieId)));

            console.log(`✅ 찜 삭제: ${movieId}`);
            return true;
        } catch (error) {
            console.error('찜 삭제 실패:', error);
            alert('찜 삭제에 실패했습니다.');
            return false;
        }
    }, [isLoggedIn, getWishlistRef]);

    // ========================================
    // 7. 찜 여부 확인
    // ========================================
    const isInWishlist = useCallback((movieId) => {
        /*
            movieId가 찜 목록에 있는지 확인
            반환값: true/false
        */
        return wishlist.some(movie => movie.id === String(movieId));
    }, [wishlist]);

    // ========================================
    // 8. 찜 토글 (추가/삭제)
    // ========================================
    const toggleWishlist = useCallback(async (movie) => {
        const inWishlist = isInWishlist(movie.id);

        if (inWishlist) {
            return await removeFromWishlist(movie.id);
        } else {
            return await addToWishlist(movie);
        }
    }, [isInWishlist, removeFromWishlist, addToWishlist]);

    // ========================================
    // 9. 초기 로드: 컴포넌트 마운트 시 찜 목록 로드
    // ========================================
    useEffect(() => {
        if (isLoggedIn && user?.email) {
            loadWishlist();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 컴포넌트 마운트 시 1회만 실행 (의도적으로 빈 배열)

    // ========================================
    // 10. 로그인 상태 변경 시 찜 목록 로드
    // ========================================
    useEffect(() => {
        if (isLoggedIn) {
            loadWishlist();
        } else {
            setWishlist([]);
        }
    }, [isLoggedIn, user?.email, loadWishlist]); // loadWishlist 추가 (ESLint 에러 수정)

    // ========================================
    // 10. Context Value
    // ========================================
    const value = {
        wishlist,           // 찜 목록 배열
        loading,            // 로딩 상태
        addToWishlist,      // 찜 추가 함수
        removeFromWishlist, // 찜 삭제 함수
        isInWishlist,       // 찜 여부 확인 함수
        toggleWishlist,     // 찜 토글 함수
        loadWishlist        // 찜 목록 새로고침 함수
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

// ========================================
// Custom Hook
// ========================================
export function useWishlist() {
    /*
        사용법:
        const { wishlist, addToWishlist, isInWishlist } = useWishlist();
    */
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error('useWishlist는 WishlistProvider 안에서 사용해야 합니다.');
    }

    return context;
}
