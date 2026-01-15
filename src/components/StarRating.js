// ========================================
// StarRating.js - 별점 입력/표시 컴포넌트
// ========================================
// 1-10점 별점 시스템 (10개 별)
// 클릭으로 입력, 호버 미리보기 지원
// 읽기 전용 모드 지원

import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./StarRating.module.css";

function StarRating({
    value = 0,           // 현재 별점 (0-10)
    onChange = null,     // 별점 변경 핸들러 (입력 모드)
    readOnly = false,    // 읽기 전용 여부
    size = "medium",     // 크기: small, medium, large
    showLabel = true     // 숫자 레이블 표시 여부
}) {
    // ========================================
    // State: 호버 중인 별점
    // ========================================
    const [hoverValue, setHoverValue] = useState(null);

    // ========================================
    // 별 클릭 핸들러
    // ========================================
    const handleClick = (rating) => {
        if (!readOnly && onChange) {
            onChange(rating);
        }
    };

    // ========================================
    // 별 호버 핸들러
    // ========================================
    const handleMouseEnter = (rating) => {
        if (!readOnly) {
            setHoverValue(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverValue(null);
        }
    };

    // ========================================
    // 현재 표시할 별점 (호버 중이면 호버값, 아니면 실제값)
    // ========================================
    const displayValue = hoverValue !== null ? hoverValue : value;

    // ========================================
    // 10개 별 생성
    // ========================================
    const stars = [];
    for (let i = 1; i <= 10; i++) {
        const isFilled = i <= displayValue;
        stars.push(
            <span
                key={i}
                className={`${styles.star} ${isFilled ? styles.filled : styles.empty} ${styles[size]} ${!readOnly ? styles.interactive : ''}`}
                onClick={() => handleClick(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                aria-label={`${i}점`}
            >
                {isFilled ? "★" : "☆"}
            </span>
        );
    }

    // ========================================
    // 렌더링
    // ========================================
    return (
        <div className={styles.container}>
            <div className={styles.stars}>
                {stars}
            </div>
            {showLabel && (
                <span className={`${styles.label} ${styles[size]}`}>
                    {value.toFixed(1)}/10
                </span>
            )}
        </div>
    );
}

// ========================================
// PropTypes
// ========================================
StarRating.propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    size: PropTypes.oneOf(["small", "medium", "large"]),
    showLabel: PropTypes.bool
};

export default StarRating;
