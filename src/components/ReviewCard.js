// ========================================
// ReviewCard.js - 개별 리뷰 카드 컴포넌트
// ========================================
// 사용자 리뷰 표시 (프로필, 별점, 텍스트)
// 본인 리뷰인 경우 수정/삭제 버튼 표시

import { useState } from "react";
import PropTypes from "prop-types";
import StarRating from "./StarRating";
import styles from "./ReviewCard.module.css";

function ReviewCard({
    review,
    currentUserId = null,
    onEdit = () => {},
    onDelete = () => {}
}) {
    // ========================================
    // State: 텍스트 접기/펼치기
    // ========================================
    const [isExpanded, setIsExpanded] = useState(false);

    // ========================================
    // State: 삭제 확인 모달
    // ========================================
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ========================================
    // 본인 리뷰인지 확인
    // ========================================
    const isOwnReview = currentUserId && review.userId === currentUserId;

    // ========================================
    // 날짜 포맷팅 (상대 시간 또는 절대 시간)
    // ========================================
    const formatDate = (date) => {
        if (!date) return "";

        try {
            // Firebase Timestamp 또는 Date 객체 처리
            const reviewDate = date.toDate ? date.toDate() : new Date(date);
            const now = new Date();
            const diffInSeconds = Math.floor((now - reviewDate) / 1000);

            // 1분 미만
            if (diffInSeconds < 60) {
                return "just now";
            }

            // 1시간 미만
            if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            }

            // 24시간 미만
            if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }

            // 7일 미만
            if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            }

            // 7일 이상: 날짜 표시
            return reviewDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error("날짜 포맷팅 오류:", error);
            return "";
        }
    };

    // ========================================
    // 텍스트 자르기 (150자 기준)
    // ========================================
    const maxLength = 150;
    const needsTruncation = review.reviewText.length > maxLength;
    const displayText = isExpanded
        ? review.reviewText
        : needsTruncation
            ? `${review.reviewText.slice(0, maxLength)}...`
            : review.reviewText;

    // ========================================
    // 삭제 확인 핸들러
    // ========================================
    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(review.id);
        setShowDeleteConfirm(false);
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    // ========================================
    // 수정 핸들러
    // ========================================
    const handleEditClick = () => {
        onEdit(review);
    };

    // ========================================
    // 렌더링
    // ========================================
    return (
        <div className={styles.card}>
            {/* 헤더: 프로필 + 별점 + 날짜 */}
            <div className={styles.header}>
                {/* 프로필 영역 */}
                <div className={styles.profile}>
                    <img
                        src={review.userPhoto || "https://via.placeholder.com/40"}
                        alt={review.userName}
                        className={styles.profileImage}
                    />
                    <div className={styles.profileInfo}>
                        <span className={styles.userName}>{review.userName}</span>
                        <span className={styles.date}>{formatDate(review.createdAt)}</span>
                    </div>
                </div>

                {/* 별점 */}
                <StarRating
                    value={review.rating}
                    readOnly={true}
                    size="small"
                    showLabel={true}
                />
            </div>

            {/* 리뷰 텍스트 */}
            <div className={styles.content}>
                <p className={styles.reviewText}>{displayText}</p>
                {needsTruncation && (
                    <button
                        className={styles.toggleButton}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "Show less" : "Show more"}
                    </button>
                )}
            </div>

            {/* 수정/삭제 버튼 (본인만) */}
            {isOwnReview && (
                <div className={styles.actions}>
                    <button
                        className={styles.editButton}
                        onClick={handleEditClick}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={handleDeleteClick}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Delete Review</h3>
                        <p className={styles.modalText}>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                className={styles.modalDeleteButton}
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                            <button
                                className={styles.modalCancelButton}
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========================================
// PropTypes
// ========================================
ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        userPhoto: PropTypes.string,
        rating: PropTypes.number.isRequired,
        reviewText: PropTypes.string.isRequired,
        createdAt: PropTypes.any.isRequired,  // Firebase Timestamp 또는 Date
        userId: PropTypes.string.isRequired
    }).isRequired,
    currentUserId: PropTypes.string,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
};

export default ReviewCard;
