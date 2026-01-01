// ========================================
// Detail.js - 영화 상세 페이지
// ========================================
// 개별 영화의 상세 정보를 보여주는 페이지
// TMDb API에서 영화 데이터를 가져와서 표시

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Detail.module.css";

// ========================================
// API 설정
// ========================================
const API_KEY = process.env.REACT_APP_TMDB_API_KEY; // 환경변수에서 API 키 가져오기
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";      // 포스터 이미지 URL
const BACKDROP_URL = "https://image.tmdb.org/t/p/original";  // 배경 이미지 URL (고화질)

function Detail() {
    // ========================================
    // React Hooks
    // ========================================
    const { id } = useParams();              // URL에서 영화 ID 가져오기 (예: /movie/123 → id = "123")
    const navigate = useNavigate();          // 페이지 이동을 위한 Hook

    // ========================================
    // State 관리
    // ========================================
    const [movie, setMovie] = useState(null);           // 영화 데이터 저장
    const [loading, setLoading] = useState(true);       // 로딩 상태
    const [isWishlisted, setIsWishlisted] = useState(false); // 찜 상태 (로컬 전용)

    // ========================================
    // 영화 데이터 가져오기
    // ========================================
    useEffect(() => {
        const getMovie = async () => {
            try {
                // TMDb API에서 영화 상세 정보 요청
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
                );
                const json = await response.json();

                console.log("영화 데이터:", json); // 개발 중 확인용
                setMovie(json); // 영화 데이터 저장
            } catch (error) {
                console.error("영화 정보를 불러오는데 실패했습니다:", error);
            } finally {
                setLoading(false); // 성공/실패 관계없이 로딩 종료
            }
        };

        getMovie(); // 함수 실행
    }, [id]); // id가 바뀔 때마다 다시 실행 (다른 영화로 이동 시)

    // ========================================
    // 찜 버튼 핸들러
    // ========================================
    const handleWishlist = () => {
        // TODO: Firebase 연동 후 실제 DB에 저장하는 기능 구현 예정
        // 현재는 로컬 state만 변경 (새로고침하면 사라짐)
        setIsWishlisted(!isWishlisted);
    };

    // ========================================
    // 로딩 중 화면
    // ========================================
    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    // ========================================
    // 영화 데이터가 없을 때 (에러 처리)
    // ========================================
    if (!movie) {
        return <div className={styles.loading}>영화 정보를 찾을 수 없습니다</div>;
    }

    // ========================================
    // 메인 렌더링
    // ========================================
    return (
        <div>
            {/* ========================================
                1. 히어로 섹션 (Hero Section)
                ========================================
                - 배경 이미지
                - 포스터
                - 제목, 태그라인
                - 평점
                - 찜 버튼
                - 뒤로가기 버튼
            */}
            <section className={styles.heroSection}>
                {/* 배경 이미지 (backdrop_path가 있을 때만 표시) */}
                {movie.backdrop_path && (
                    <>
                        <img
                            className={styles.backdrop}
                            src={`${BACKDROP_URL}${movie.backdrop_path}`}
                            alt={`${movie.title || '영화'} 배경`}
                        />
                        {/* 배경 이미지 위에 어두운 그라데이션 오버레이 */}
                        <div className={styles.backdropOverlay}></div>
                    </>
                )}

                {/* 히어로 컨텐츠 (포스터 + 정보) */}
                <div className={styles.heroContent}>
                    {/* 포스터 이미지 */}
                    <div className={styles.posterContainer}>
                        {movie.poster_path ? (
                            // 포스터가 있으면 표시
                            <img
                                className={styles.poster}
                                src={`${IMG_BASE_URL}${movie.poster_path}`}
                                alt={`${movie.title} 포스터`}
                            />
                        ) : (
                            // 포스터가 없으면 대체 이미지 표시
                            <div className={styles.poster} style={{
                                background: '#2a2a2a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666'
                            }}>
                                No Image
                            </div>
                        )}
                    </div>

                    {/* 영화 정보 영역 */}
                    <div className={styles.movieInfo}>
                        <div className={styles.header}>
                            <div className={styles.titleSection}>
                                {/* 영화 제목 + 19+ 표시 */}
                                <h1 className={styles.title}>
                                    {movie.title || '제목 없음'}
                                    {/* adult가 true면 19+ 표시 */}
                                    {movie.adult && <span className={styles.adult}>19+</span>}
                                </h1>

                                {/* 태그라인 (있을 때만 표시) */}
                                {movie.tagline && (
                                    <p className={styles.tagline}>"{movie.tagline}"</p>
                                )}

                                {/* 평점 섹션 */}
                                <div className={styles.ratingSection}>
                                    <div className={styles.rating}>
                                        <span className={styles.ratingStar}>⭐</span>
                                        <span className={styles.ratingValue}>
                                            {/*
                                                vote_average가 없으면 0으로 표시
                                                || 연산자: 왼쪽이 falsy(0, null, undefined 등)면 오른쪽 값 사용
                                                toFixed(1): 소수점 1자리까지 표시 (7.395 → "7.4")
                                            */}
                                            {(movie.vote_average || 0).toFixed(1)}
                                        </span>
                                        <span className={styles.ratingMax}>/10</span>
                                    </div>
                                    <span className={styles.voteCount}>
                                        {/*
                                            toLocaleString(): 숫자에 쉼표 추가 (1234 → "1,234")
                                        */}
                                        ({(movie.vote_count || 0).toLocaleString()}명 평가)
                                    </span>
                                </div>
                            </div>

                            {/* 찜 버튼 */}
                            <button
                                className={`${styles.wishlistButton} ${isWishlisted ? styles.active : ''}`}
                                onClick={handleWishlist}
                                aria-label="찜하기" // 접근성: 스크린 리더가 읽어줌
                            >
                                {/* 찜 했으면 빨간 하트, 안 했으면 흰 하트 */}
                                {isWishlisted ? '❤️' : '🤍'}
                            </button>
                        </div>

                        {/* 뒤로가기 버튼 */}
                        <button
                            onClick={() => navigate(-1)} // 이전 페이지로 이동
                            style={{
                                position: 'absolute',
                                top: '20px',
                                left: '20px',
                                background: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                backdropFilter: 'blur(10px)', // 배경 흐림 효과
                                transition: 'all 0.3s ease'
                            }}
                            // 마우스 올렸을 때 배경 더 어둡게
                            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                            // 마우스 뗐을 때 원래대로
                            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                        >
                            ← 뒤로가기
                        </button>
                    </div>
                </div>
            </section>

            {/* ========================================
                2. 기본 정보 바 (Info Bar)
                ========================================
                - 개봉년도
                - 상영시간
                - 청불 여부
                - 주요 장르
                → 아직 미구현
            */}
            <section className={styles.infoBar}>
                {/* TODO: 여기에 기본 정보 바 코드 작성 */}
            </section>

            {/* ========================================
                3. 줄거리 (Overview)
                ========================================
                - 영화 줄거리 전체 텍스트
                → 아직 미구현
            */}
            <section className={styles.overview}>
                {/* TODO: 여기에 줄거리 코드 작성 */}
            </section>

            {/* ========================================
                4. 상세 정보 (Details Grid)
                ========================================
                - 원제, 개봉일, 상영시간, 장르
                - 제작국가, 언어, 수익
                → 아직 미구현
            */}
            <section className={styles.details}>
                {/* TODO: 여기에 상세 정보 코드 작성 */}
            </section>

            {/* ========================================
                5. 제작사 정보 (Production Companies)
                ========================================
                - 제작사 로고 및 이름
                → 아직 미구현
            */}
            <section className={styles.production}>
                {/* TODO: 여기에 제작사 정보 코드 작성 */}
            </section>

            {/* ========================================
                6. 시리즈 정보 (Collection)
                ========================================
                - 영화가 시리즈의 일부인 경우만 표시
                → 아직 미구현
            */}
            <section className={styles.collection}>
                {/* TODO: 여기에 시리즈 정보 코드 작성 */}
            </section>
        </div>
    );
}

export default Detail;
