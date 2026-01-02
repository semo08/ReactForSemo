// ========================================
// Detail.js - 영화 상세 페이지
// ========================================
// 개별 영화의 상세 정보를 보여주는 페이지
// TMDb API에서 영화 데이터를 가져와서 표시

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
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
    // 헬퍼 함수: 상영시간 포맷팅
    // ========================================
    const formatRuntime = (minutes) => {
        /*
            minutes: 분 단위 숫자 (예: 198)
            반환값: "198 min (3h 18m)" 형태

            Math.floor(): 소수점 버림 (내림)
            예: Math.floor(3.9) → 3
        */
        if (!minutes) return "N/A";

        const hours = Math.floor(minutes / 60);  // 시간 = 분 ÷ 60
        const mins = minutes % 60;                // 나머지 분 = 분 % 60

        return `${minutes} min (${hours}h ${mins}m)`;
    };

    // ========================================
    // 헬퍼 함수: 수익 포맷팅
    // ========================================
    const formatRevenue = (amount) => {
        /*
            amount: 숫자 (예: 760400000)
            반환값: "$760,400,000" 형태

            toLocaleString('en-US'): 미국 형식으로 숫자 포맷팅 (쉼표 추가)
            예: 1234567 → "1,234,567"
        */
        if (!amount || amount === 0) return "N/A";

        return `$${amount.toLocaleString('en-US')}`;
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
        <>
            {/* ========================================
                헤더 (상단 고정)
                ======================================== */}
            <Header />

            {/* ========================================
                메인 컨텐츠
                ======================================== */}
            <div>
                {/* ========================================
                    1. 히어로 섹션 (Hero Section)
                    ========================================
                    - 배경 이미지
                    - 포스터
                    - 제목, 태그라인
                    - 평점
                    - 찜 버튼
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

                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate(-1)} // 이전 페이지로 이동
                    style={{
                        position: 'absolute',
                        top: '80px',       // 헤더(60px) + 여백(20px)
                        left: '20px',
                        background: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        backdropFilter: 'blur(10px)', // 배경 흐림 효과
                        transition: 'all 0.3s ease',
                        zIndex: 10  // 다른 요소들 위에 표시
                    }}
                    // 마우스 올렸을 때 배경 더 어둡게
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                    // 마우스 뗐을 때 원래대로
                    onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                >
                    ← 뒤로가기
                </button>

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
            */}
            <section className={styles.infoBar}>
                {/* 개봉 연도 */}
                {movie.release_date && (
                    <span className={styles.infoItem}>
                        {/*
                            release_date 형식: "2025-12-17"
                            split('-'): 문자열을 '-' 기준으로 나눔 → ["2025", "12", "17"]
                            [0]: 첫 번째 요소 (연도)만 가져옴 → "2025"
                        */}
                        {movie.release_date.split('-')[0]}
                    </span>
                )}

                {/* 구분선 | */}
                {movie.release_date && movie.runtime && (
                    <span className={styles.separator}>|</span>
                )}

                {/* 상영시간 */}
                {movie.runtime && (
                    <span className={styles.infoItem}>
                        {/*
                            runtime: 숫자로 분 단위 (예: 198)
                            "분" 붙여서 표시 → "198분"
                        */}
                        {movie.runtime}분
                    </span>
                )}

                {/* 청불 표시 (adult가 true일 때만) */}
                {movie.adult && (
                    <>
                        {/* 구분선 | */}
                        <span className={styles.separator}>|</span>
                        {/* 19+ 표시 */}
                        <span className={styles.infoAdult}>🔞 19+</span>
                    </>
                )}

                {/* 모든 장르 표시 */}
                {movie.genres && movie.genres.length > 0 && (
                    <>
                        {/* 구분선 | */}
                        <span className={styles.separator}>|</span>
                        {/*
                            genres: 배열 (예: [{id: 878, name: "Science Fiction"}, ...])
                            map(): 배열의 각 요소를 순회하면서 변환
                            join(', '): 배열을 ", "로 연결해서 문자열로 만듦
                            예: ["SF", "Adventure"] → "SF, Adventure"
                        */}
                        <span className={styles.infoItem}>
                            {movie.genres.map(genre => genre.name).join(', ')}
                        </span>
                    </>
                )}
            </section>

            {/* ========================================
                3. 줄거리 (Overview)
                ========================================
                - 영화 줄거리 전체 텍스트
            */}
            <section className={styles.overview}>
                {/* 제목 */}
                <h2 className={styles.sectionTitle}>Overview</h2>

                {/* 줄거리 텍스트 */}
                {movie.overview ? (
                    <p className={styles.overviewText}>
                        {/*
                            overview: 영화 줄거리 텍스트
                            예: "In the wake of the devastating war against..."
                        */}
                        {movie.overview}
                    </p>
                ) : (
                    // overview가 없을 때 대체 텍스트
                    <p className={styles.overviewText}>
                        줄거리 정보가 없습니다.
                    </p>
                )}
            </section>

            {/* ========================================
                4. 상세 정보 (Details Grid)
                ========================================
                - 원제, 개봉일, 상영시간, 장르
                - 제작국가, 언어, 수익
            */}
            <section className={styles.details}>
                <h2 className={styles.sectionTitle}>Details</h2>

                <div className={styles.detailsGrid}>
                    {/* Original Title */}
                    {movie.original_title && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Original Title</span>
                            <span className={styles.detailValue}>{movie.original_title}</span>
                        </div>
                    )}

                    {/* Release Date */}
                    {movie.release_date && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Release Date</span>
                            <span className={styles.detailValue}>
                                {/*
                                    release_date: "2025-12-17"
                                    → "December 17, 2025" 형태로 변환

                                    new Date(): Date 객체 생성
                                    toLocaleDateString('en-US'): 미국 날짜 형식으로 변환
                                */}
                                {new Date(movie.release_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}

                    {/* Runtime */}
                    {movie.runtime && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Runtime</span>
                            <span className={styles.detailValue}>
                                {formatRuntime(movie.runtime)}
                            </span>
                        </div>
                    )}

                    {/* Country */}
                    {movie.production_countries && movie.production_countries.length > 0 && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Country</span>
                            <span className={styles.detailValue}>
                                {/*
                                    production_countries: 배열
                                    첫 번째 국가만 표시
                                */}
                                {movie.production_countries[0].name}
                            </span>
                        </div>
                    )}

                    {/* Language */}
                    {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Language</span>
                            <span className={styles.detailValue}>
                                {/*
                                    spoken_languages: 배열
                                    첫 번째 언어만 표시
                                */}
                                {movie.spoken_languages[0].english_name}
                            </span>
                        </div>
                    )}

                    {/* Revenue */}
                    {movie.revenue && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Revenue</span>
                            <span className={styles.detailValue}>
                                {formatRevenue(movie.revenue)}
                            </span>
                        </div>
                    )}

                    {/* Genres - 맨 아래, 2열 전체 차지 */}
                    {movie.genres && movie.genres.length > 0 && (
                        <div className={`${styles.detailItem} ${styles.genresItem}`}>
                            <span className={styles.detailLabel}>Genres</span>
                            <span className={styles.detailValue}>
                                {movie.genres.map(genre => genre.name).join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ========================================
                5. 제작사 정보 (Production Companies)
                ========================================
                - 제작사 로고 및 이름
            */}
            <section className={styles.production}>
                <h2 className={styles.sectionTitle}>Production Companies</h2>

                {movie.production_companies && movie.production_companies.length > 0 ? (
                    <div className={styles.companiesGrid}>
                        {/*
                            map(): 배열의 각 제작사를 순회
                            각 제작사마다 카드 생성
                        */}
                        {movie.production_companies.map((company) => (
                            <div key={company.id} className={styles.companyCard}>
                                {company.logo_path ? (
                                    // 로고가 있으면 이미지 표시
                                    <>
                                        <img
                                            src={`${IMG_BASE_URL}${company.logo_path}`}
                                            alt={company.name}
                                            className={styles.companyLogo}
                                        />
                                        <p className={styles.companyName}>{company.name}</p>
                                    </>
                                ) : (
                                    // 로고가 없으면 이름만 표시
                                    <div className={styles.companyNameOnly}>
                                        <span>{company.name}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noData}>No production company information available</p>
                )}
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
        </>
    );
}

export default Detail;
