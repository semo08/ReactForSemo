// ========================================
// ReviewSection.js - 리뷰 섹션 통합 컴포넌트
// ========================================
// Detail 페이지의 리뷰 섹션 전체
// 내 리뷰 + 다른 사용자 리뷰 목록

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import styles from "./ReviewSection.module.css";
// import { getUserReviewForMovie, getReviewsForMovie, deleteReview } from "../firebase/reviewService"; // TODO: Firebase 연동 후 주석 해제

function ReviewSection({
    movieId,
    movieTitle,
    moviePoster
}) {
    // ========================================
    // AuthContext에서 로그인 정보 가져오기
    // ========================================
    const { user, isLoggedIn } = useAuth();

    // ========================================
    // State 관리
    // ========================================
    const [myReview, setMyReview] = useState(null);           // 내 리뷰
    const [otherReviews, setOtherReviews] = useState([]);     // 다른 사용자 리뷰
    const [loading, setLoading] = useState(true);             // 로딩 상태
    const [sortBy, setSortBy] = useState("createdAt");        // 정렬 옵션: createdAt | rating
    const [showEditForm, setShowEditForm] = useState(false);  // 수정 폼 표시 여부
    const [limit, setLimit] = useState(10);                   // 표시할 리뷰 개수

    // ========================================
    // 리뷰 데이터 로드
    // ========================================
    useEffect(() => {
        loadReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId, sortBy, isLoggedIn]);

    const loadReviews = async () => {
        setLoading(true);

        try {
            // TODO: Firebase 연동 후 주석 해제
            /*
            // 1. 내 리뷰 가져오기 (로그인한 경우)
            if (isLoggedIn && user) {
                const userId = user.sub || user.uid;
                const userReview = await getUserReviewForMovie(userId, movieId);
                setMyReview(userReview);
            }

            // 2. 다른 사용자 리뷰 가져오기
            const reviews = await getReviewsForMovie(movieId, limit, sortBy);

            // 내 리뷰 제외
            const filteredReviews = isLoggedIn && user
                ? reviews.filter(r => r.userId !== (user.sub || user.uid))
                : reviews;

            setOtherReviews(filteredReviews);
            */

            // 임시: 더미 데이터 (Firebase 연동 전)
            await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션

            // 더미 내 리뷰
            if (isLoggedIn && user) {
                setMyReview({
                    id: "my-review-1",
                    userId: user.sub || user.uid || "user123",
                    userName: user.name || "Me",
                    userPhoto: user.picture || "https://via.placeholder.com/40",
                    rating: 8.5,
                    reviewText: "This is my review for this movie. I really enjoyed it! (This is dummy data until Firebase is connected)",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // 더미 다른 사용자 리뷰
            const dummyReviews = [
                {
                    id: "review-1",
                    userId: "user456",
                    userName: "김철수",
                    userPhoto: "https://i.pravatar.cc/150?img=1",
                    rating: 9.0,
                    reviewText: "Absolutely amazing movie! The visuals were stunning and the story kept me engaged throughout. Highly recommend to everyone!",
                    createdAt: new Date(Date.now() - 86400000), // 1일 전
                },
                {
                    id: "review-2",
                    userId: "user789",
                    userName: "이영희",
                    userPhoto: "https://i.pravatar.cc/150?img=5",
                    rating: 7.5,
                    reviewText: "Pretty good movie overall. Some parts were a bit slow, but the ending was worth it.",
                    createdAt: new Date(Date.now() - 172800000), // 2일 전
                },
                {
                    id: "review-3",
                    userId: "user101",
                    userName: "박민수",
                    userPhoto: "https://i.pravatar.cc/150?img=8",
                    rating: 10.0,
                    reviewText: "Masterpiece! One of the best movies I've seen this year. The cinematography, acting, and soundtrack were all perfect. Can't wait to watch it again!",
                    createdAt: new Date(Date.now() - 259200000), // 3일 전
                }
            ];

            // 정렬
            const sorted = [...dummyReviews].sort((a, b) => {
                if (sortBy === "rating") {
                    return b.rating - a.rating;
                }
                return b.createdAt - a.createdAt;
            });

            setOtherReviews(sorted);

        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // 리뷰 작성/수정 성공 핸들러
    // ========================================
    const handleReviewSuccess = () => {
        setShowEditForm(false);
        loadReviews(); // 리뷰 목록 새로고침
    };

    // ========================================
    // 수정 핸들러
    // ========================================
    const handleEdit = () => {
        setShowEditForm(true);
    };

    // ========================================
    // 삭제 핸들러
    // ========================================
    const handleDelete = async (reviewId) => {
        try {
            // TODO: Firebase 연동 후 주석 해제
            /*
            const userId = user.sub || user.uid;
            await deleteReview(reviewId, userId, movieId);
            */

            // 임시: 삭제 시뮬레이션
            console.log("🗑️ 리뷰 삭제 (시뮬레이션):", reviewId);
            alert("Review deleted successfully! (Firebase not connected yet)");

            // 내 리뷰 삭제
            setMyReview(null);
            setShowEditForm(false);
            loadReviews();

        } catch (error) {
            console.error("리뷰 삭제 실패:", error);
            alert("Failed to delete review. Please try again.");
        }
    };

    // ========================================
    // 더 보기 핸들러
    // ========================================
    const handleLoadMore = () => {
        setLimit(prev => prev + 10);
    };

    // ========================================
    // 렌더링
    // ========================================
    return (
        <section className={styles.section}>
            {/* 섹션 제목 */}
            <h2 className={styles.sectionTitle}>⭐ Ratings & Reviews</h2>

            {/* 내 리뷰 영역 */}
            <div className={styles.myReviewArea}>
                <h3 className={styles.subTitle}>📝 My Review</h3>

                {/* 내 리뷰가 있고 수정 모드가 아니면 표시 */}
                {myReview && !showEditForm ? (
                    <ReviewCard
                        review={myReview}
                        currentUserId={user?.sub || user?.uid}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    // 내 리뷰가 없거나 수정 모드면 폼 표시
                    <ReviewForm
                        movieId={movieId}
                        movieTitle={movieTitle}
                        moviePoster={moviePoster}
                        initialData={myReview}
                        mode={myReview ? "edit" : "create"}
                        onSuccess={handleReviewSuccess}
                        onCancel={() => setShowEditForm(false)}
                    />
                )}
            </div>

            {/* 다른 사용자 리뷰 영역 */}
            <div className={styles.othersReviewArea}>
                {/* 헤더 (제목 + 정렬) */}
                <div className={styles.othersHeader}>
                    <h3 className={styles.subTitle}>
                        💬 User Reviews ({otherReviews.length})
                    </h3>
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="createdAt">Latest</option>
                        <option value="rating">Highest Rating</option>
                    </select>
                </div>

                {/* 로딩 상태 */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading reviews...</p>
                    </div>
                ) : (
                    <>
                        {/* 리뷰 목록 */}
                        {otherReviews.length > 0 ? (
                            <div className={styles.reviewsList}>
                                {otherReviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        currentUserId={user?.sub || user?.uid}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            // 빈 상태
                            <div className={styles.empty}>
                                <p className={styles.emptyText}>
                                    No reviews yet. Be the first to review this movie!
                                </p>
                            </div>
                        )}

                        {/* 더 보기 버튼 (나중에 페이지네이션 구현) */}
                        {otherReviews.length >= limit && (
                            <button
                                className={styles.loadMoreButton}
                                onClick={handleLoadMore}
                            >
                                Load More
                            </button>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

// ========================================
// PropTypes
// ========================================
ReviewSection.propTypes = {
    movieId: PropTypes.number.isRequired,
    movieTitle: PropTypes.string.isRequired,
    moviePoster: PropTypes.string.isRequired
};

export default ReviewSection;
