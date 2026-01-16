// ========================================
// reviewService.js - 리뷰 관련 Firebase 함수
// ========================================
// Firestore에 리뷰 데이터 저장/조회/수정/삭제

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    limit as limitQuery,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// ========================================
// 1. 리뷰 생성 (Create)
// ========================================
/**
 * 새 리뷰 작성
 * @param {Object} reviewData - 리뷰 데이터
 * @param {string} reviewData.userId - 사용자 ID (Google UID)
 * @param {string} reviewData.userEmail - 사용자 이메일
 * @param {string} reviewData.userName - 사용자 이름
 * @param {string} reviewData.userPhoto - 사용자 프로필 사진 URL
 * @param {number} reviewData.movieId - 영화 ID (TMDb)
 * @param {string} reviewData.movieTitle - 영화 제목
 * @param {string} reviewData.moviePoster - 영화 포스터 URL
 * @param {number} reviewData.rating - 별점 (1-10)
 * @param {string} reviewData.reviewText - 리뷰 텍스트
 * @returns {Promise<string>} 생성된 리뷰 ID
 */
export const createReview = async (reviewData) => {
    try {
        // 리뷰 ID 생성 (userId_movieId 형식으로 고유 ID)
        const reviewId = `${reviewData.userId}_${reviewData.movieId}`;
        const reviewRef = doc(db, 'reviews', reviewId);

        // Firestore에 저장할 데이터
        const data = {
            userId: reviewData.userId,
            userEmail: reviewData.userEmail,
            userName: reviewData.userName,
            userPhoto: reviewData.userPhoto || null,
            movieId: Number(reviewData.movieId), // 숫자로 변환
            movieTitle: reviewData.movieTitle,
            moviePoster: reviewData.moviePoster || null,
            rating: Number(reviewData.rating), // 숫자로 변환
            reviewText: reviewData.reviewText,
            createdAt: serverTimestamp(), // Firebase 서버 시간
            updatedAt: serverTimestamp()
        };

        // Firestore에 저장
        await setDoc(reviewRef, data);

        console.log('✅ 리뷰 생성 완료:', reviewId);
        return reviewId;
    } catch (error) {
        console.error('❌ 리뷰 생성 실패:', error);
        throw new Error('Failed to create review: ' + error.message);
    }
};

// ========================================
// 2. 리뷰 수정 (Update)
// ========================================
/**
 * 기존 리뷰 수정
 * @param {string} reviewId - 리뷰 ID
 * @param {Object} updateData - 수정할 데이터
 * @param {number} updateData.rating - 별점
 * @param {string} updateData.reviewText - 리뷰 텍스트
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, updateData) => {
    try {
        const reviewRef = doc(db, 'reviews', reviewId);

        // 기존 리뷰 확인
        const reviewSnap = await getDoc(reviewRef);
        if (!reviewSnap.exists()) {
            throw new Error('Review not found');
        }

        // 수정할 데이터
        const data = {
            rating: Number(updateData.rating),
            reviewText: updateData.reviewText,
            updatedAt: serverTimestamp()
        };

        // Firestore 업데이트
        await setDoc(reviewRef, data, { merge: true });

        console.log('✅ 리뷰 수정 완료:', reviewId);
    } catch (error) {
        console.error('❌ 리뷰 수정 실패:', error);
        throw new Error('Failed to update review: ' + error.message);
    }
};

// ========================================
// 3. 리뷰 삭제 (Delete)
// ========================================
/**
 * 리뷰 삭제
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
    try {
        const reviewRef = doc(db, 'reviews', reviewId);

        // Firestore에서 삭제
        await deleteDoc(reviewRef);

        console.log('✅ 리뷰 삭제 완료:', reviewId);
    } catch (error) {
        console.error('❌ 리뷰 삭제 실패:', error);
        throw new Error('Failed to delete review: ' + error.message);
    }
};

// ========================================
// 4. 특정 사용자의 특정 영화 리뷰 가져오기 (Read - Single)
// ========================================
/**
 * 내 리뷰 가져오기 (한 사용자는 한 영화당 리뷰 1개만 작성 가능)
 * @param {string} userId - 사용자 ID
 * @param {number} movieId - 영화 ID
 * @returns {Promise<Object|null>} 리뷰 데이터 또는 null
 */
export const getUserReviewForMovie = async (userId, movieId) => {
    try {
        const reviewId = `${userId}_${movieId}`;
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewSnap = await getDoc(reviewRef);

        if (reviewSnap.exists()) {
            const data = reviewSnap.data();
            console.log('✅ 내 리뷰 로드 완료:', reviewId);
            return {
                id: reviewSnap.id,
                ...data,
                // Firestore Timestamp를 JavaScript Date로 변환
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        }

        console.log('ℹ️ 내 리뷰 없음:', reviewId);
        return null;
    } catch (error) {
        console.error('❌ 내 리뷰 로드 실패:', error);
        throw new Error('Failed to get user review: ' + error.message);
    }
};

// ========================================
// 5. 특정 영화의 모든 리뷰 가져오기 (Read - Multiple)
// ========================================
/**
 * 특정 영화의 모든 리뷰 가져오기
 * @param {number} movieId - 영화 ID
 * @param {number} limit - 가져올 리뷰 개수 (기본 10개)
 * @param {string} sortBy - 정렬 기준: 'createdAt' | 'rating' (기본 createdAt)
 * @returns {Promise<Array>} 리뷰 배열
 */
export const getReviewsForMovie = async (movieId, limit = 10, sortBy = 'createdAt') => {
    try {
        const reviewsRef = collection(db, 'reviews');

        // 쿼리 구성
        let q;
        if (sortBy === 'rating') {
            // 평점 높은 순
            q = query(
                reviewsRef,
                where('movieId', '==', Number(movieId)),
                orderBy('rating', 'desc'),
                orderBy('createdAt', 'desc'), // 동점이면 최신순
                limitQuery(limit)
            );
        } else {
            // 최신순 (기본)
            q = query(
                reviewsRef,
                where('movieId', '==', Number(movieId)),
                orderBy('createdAt', 'desc'),
                limitQuery(limit)
            );
        }

        // 쿼리 실행
        const querySnapshot = await getDocs(q);

        // 결과 변환
        const reviews = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            reviews.push({
                id: doc.id,
                ...data,
                // Firestore Timestamp를 JavaScript Date로 변환
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            });
        });

        console.log(`✅ 리뷰 로드 완료: ${reviews.length}개 (영화 ID: ${movieId})`);
        return reviews;
    } catch (error) {
        console.error('❌ 리뷰 로드 실패:', error);
        throw new Error('Failed to get reviews: ' + error.message);
    }
};

// ========================================
// 6. 특정 사용자의 모든 리뷰 가져오기 (선택 사항)
// ========================================
/**
 * 내가 작성한 모든 리뷰 가져오기 (프로필 페이지 등에서 사용)
 * @param {string} userId - 사용자 ID
 * @param {number} limit - 가져올 리뷰 개수
 * @returns {Promise<Array>} 리뷰 배열
 */
export const getUserReviews = async (userId, limit = 20) => {
    try {
        const reviewsRef = collection(db, 'reviews');

        const q = query(
            reviewsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limitQuery(limit)
        );

        const querySnapshot = await getDocs(q);

        const reviews = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            reviews.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            });
        });

        console.log(`✅ 사용자 리뷰 로드 완료: ${reviews.length}개`);
        return reviews;
    } catch (error) {
        console.error('❌ 사용자 리뷰 로드 실패:', error);
        throw new Error('Failed to get user reviews: ' + error.message);
    }
};

// ========================================
// Export 정리
// ========================================
export default {
    createReview,
    updateReview,
    deleteReview,
    getUserReviewForMovie,
    getReviewsForMovie,
    getUserReviews
};
