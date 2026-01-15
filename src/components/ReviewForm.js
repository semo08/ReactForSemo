// ========================================
// ReviewForm.js - 리뷰 작성/수정 폼
// ========================================
// 별점 + 텍스트 리뷰 입력
// 로그인 체크, 유효성 검사, 로딩 상태

import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "./StarRating";
import styles from "./ReviewForm.module.css";
// import { createReview, updateReview } from "../firebase/reviewService"; // TODO: Firebase 연동 후 주석 해제

function ReviewForm({
    movieId,
    movieTitle = "",
    moviePoster = "",
    initialData = null,      // 수정 모드: { rating, reviewText, reviewId }
    mode = "create",         // "create" | "edit"
    onSuccess = () => {},    // 성공 콜백
    onCancel = () => {}      // 취소 콜백
}) {
    // ========================================
    // AuthContext에서 로그인 정보 가져오기
    // ========================================
    const { user, isLoggedIn } = useAuth();

    // ========================================
    // State 관리
    // ========================================
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [reviewText, setReviewText] = useState(initialData?.reviewText || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ========================================
    // 글자 수 계산
    // ========================================
    const charCount = reviewText.length;
    const maxChars = 500;
    const minChars = 10;

    // ========================================
    // 폼 유효성 검사
    // ========================================
    const validateForm = () => {
        if (rating < 1 || rating > 10) {
            setError("Please select a rating (1-10)");
            return false;
        }

        const trimmedText = reviewText.trim();
        if (trimmedText.length < minChars) {
            setError(`Review must be at least ${minChars} characters`);
            return false;
        }

        if (trimmedText.length > maxChars) {
            setError(`Review cannot exceed ${maxChars} characters`);
            return false;
        }

        // 공백만 입력 체크
        if (!trimmedText) {
            setError("Review cannot be empty");
            return false;
        }

        return true;
    };

    // ========================================
    // 저장 핸들러
    // ========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 유효성 검사
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // TODO: Firebase 연동 후 주석 해제
            /*
            if (mode === "create") {
                // 리뷰 생성
                const reviewData = {
                    userId: user.sub || user.uid,
                    userEmail: user.email,
                    userName: user.name,
                    userPhoto: user.picture,
                    movieId,
                    movieTitle,
                    moviePoster,
                    rating,
                    reviewText: reviewText.trim()
                };
                await createReview(reviewData);
            } else {
                // 리뷰 수정
                await updateReview(initialData.reviewId, {
                    rating,
                    reviewText: reviewText.trim(),
                    updatedAt: new Date()
                });
            }
            */

            // 임시: 성공 시뮬레이션 (Firebase 연동 전)
            console.log("📝 리뷰 저장 (시뮬레이션):", {
                mode,
                rating,
                reviewText: reviewText.trim(),
                movieId,
                user: user?.name
            });

            // 성공 콜백
            onSuccess();

            // 폼 초기화 (생성 모드만)
            if (mode === "create") {
                setRating(0);
                setReviewText("");
            }

            alert(`Review ${mode === "create" ? "submitted" : "updated"} successfully! (Firebase not connected yet)`);

        } catch (err) {
            console.error("리뷰 저장 실패:", err);
            setError("Failed to save review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // 취소 핸들러
    // ========================================
    const handleCancel = () => {
        setRating(initialData?.rating || 0);
        setReviewText(initialData?.reviewText || "");
        setError("");
        onCancel();
    };

    // ========================================
    // 텍스트 변경 핸들러
    // ========================================
    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length <= maxChars) {
            setReviewText(text);
            setError(""); // 에러 초기화
        }
    };

    // ========================================
    // 비로그인 상태 UI
    // ========================================
    if (!isLoggedIn) {
        return (
            <div className={styles.loginPrompt}>
                <p className={styles.loginText}>
                    🔒 Please login to write a review
                </p>
                <p className={styles.loginSubtext}>
                    Sign in with Google to share your thoughts!
                </p>
            </div>
        );
    }

    // ========================================
    // 로그인 상태 UI (폼)
    // ========================================
    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {/* 제목 */}
            <h3 className={styles.title}>
                {mode === "create" ? "📝 Write Your Review" : "✏️ Edit Your Review"}
            </h3>

            {/* 별점 입력 */}
            <div className={styles.field}>
                <label className={styles.label}>Rating:</label>
                <StarRating
                    value={rating}
                    onChange={setRating}
                    size="large"
                    showLabel={true}
                />
            </div>

            {/* 리뷰 텍스트 입력 */}
            <div className={styles.field}>
                <label className={styles.label}>Review:</label>
                <textarea
                    className={styles.textarea}
                    value={reviewText}
                    onChange={handleTextChange}
                    placeholder="Share your thoughts about this movie... (minimum 10 characters)"
                    rows={6}
                    disabled={loading}
                />
                <div className={styles.charCounter}>
                    <span className={charCount > maxChars ? styles.overLimit : ""}>
                        {charCount}/{maxChars}
                    </span>
                    {charCount < minChars && charCount > 0 && (
                        <span className={styles.minWarning}>
                            (minimum {minChars} characters)
                        </span>
                    )}
                </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className={styles.error}>
                    ⚠️ {error}
                </div>
            )}

            {/* 버튼 */}
            <div className={styles.buttons}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || rating === 0 || charCount < minChars}
                >
                    {loading ? "Saving..." : mode === "create" ? "Submit Review" : "Update Review"}
                </button>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ========================================
// PropTypes
// ========================================
ReviewForm.propTypes = {
    movieId: PropTypes.number.isRequired,
    movieTitle: PropTypes.string,
    moviePoster: PropTypes.string,
    initialData: PropTypes.shape({
        rating: PropTypes.number,
        reviewText: PropTypes.string,
        reviewId: PropTypes.string
    }),
    mode: PropTypes.oneOf(["create", "edit"]),
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func
};

export default ReviewForm;
