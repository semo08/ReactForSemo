// ========================================
// Search.js - 영화 검색 페이지
// ========================================
// 사용자가 검색어를 입력하면 TMDb API로 영화를 검색

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Movie from "../components/Movie";
import styles from "./Search.module.css";

// ========================================
// API 설정
// ========================================
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function Search() {
    // ========================================
    // State 관리
    // ========================================
    const [searchQuery, setSearchQuery] = useState(""); // 검색어 입력값
    const [movies, setMovies] = useState([]); // 검색 결과
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [searched, setSearched] = useState(false); // 검색 실행 여부
    const [totalResults, setTotalResults] = useState(0); // 총 검색 결과 개수

    // ========================================
    // React Router Hooks
    // ========================================
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /*
        useSearchParams: URL 쿼리 파라미터 읽기
        예: /search?q=avatar
        searchParams.get('q') → "avatar"
    */

    // ========================================
    // 영화 검색 API 호출
    // ========================================
    const searchMovies = async (query) => {
        /*
            TMDb Search API 호출
            - query: 사용자가 입력한 검색어
            - 예: "avatar", "toy story" 등
        */

        if (!query.trim()) {
            // 빈 문자열 체크 (.trim()은 공백 제거)
            alert("검색어를 입력해주세요!");
            return;
        }

        try {
            setLoading(true); // 로딩 시작
            setSearched(true); // 검색 실행됨 표시

            /*
                fetch: API 호출
                - encodeURIComponent: 검색어를 URL에 안전하게 포함
                  예: "toy story" → "toy%20story"
            */
            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
                    query
                )}&language=en-US&page=1`
            );

            const json = await response.json();

            console.log("검색 결과:", json);

            setMovies(json.results || []); // 결과 저장 (없으면 빈 배열)
            setTotalResults(json.total_results || 0); // 총 개수 저장
        } catch (error) {
            console.error("검색 실패:", error);
            alert("검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // ========================================
    // 검색 폼 제출 핸들러
    // ========================================
    const handleSubmit = (e) => {
        /*
            폼 제출 시 실행
            e.preventDefault(): 페이지 새로고침 방지
        */
        e.preventDefault();
        searchMovies(searchQuery);
    };

    // ========================================
    // 검색어 입력 핸들러
    // ========================================
    const handleInputChange = (e) => {
        /*
            input 값이 변경될 때마다 실행
            e.target.value: 현재 입력된 값
        */
        setSearchQuery(e.target.value);
    };

    // ========================================
    // 메인 렌더링
    // ========================================
    return (
        <>
            <Header />

            <div className={styles.container}>
                {/* ========================================
                    검색 폼
                    ======================================== */}
                <section className={styles.searchSection}>
                    <h1 className={styles.title}>Search Movies</h1>

                    <form onSubmit={handleSubmit} className={styles.searchForm}>
                        {/*
                            input: 검색어 입력
                            - type="text": 일반 텍스트 입력
                            - value: 현재 값 (state와 연결)
                            - onChange: 값이 바뀔 때마다 실행
                            - placeholder: 힌트 텍스트
                        */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Search for a movie..."
                            className={styles.searchInput}
                        />

                        {/*
                            button: 검색 버튼
                            - type="submit": 폼 제출 버튼
                        */}
                        <button type="submit" className={styles.searchButton}>
                            🔍 Search
                        </button>
                    </form>
                </section>

                {/* ========================================
                    로딩 중 화면
                    ======================================== */}
                {loading && (
                    <div className={styles.loading}>
                        Searching...
                    </div>
                )}

                {/* ========================================
                    검색 결과
                    ======================================== */}
                {!loading && searched && (
                    <section className={styles.resultsSection}>
                        {/* 검색 결과 개수 */}
                        <h2 className={styles.resultsTitle}>
                            {totalResults > 0
                                ? `Found ${totalResults} results for "${searchQuery}"`
                                : `No results found for "${searchQuery}"`}
                        </h2>

                        {/* 영화 목록 */}
                        {movies.length > 0 ? (
                            <div className={styles.moviesGrid}>
                                {/*
                                    map(): 배열의 각 영화를 Movie 컴포넌트로 변환
                                    - Home.js와 동일한 방식
                                */}
                                {movies.map((movie) => (
                                    <Movie
                                        key={movie.id}
                                        id={movie.id}
                                        coverImg={
                                            movie.poster_path
                                                ? `${IMG_BASE_URL}${movie.poster_path}`
                                                : null
                                        }
                                        title={movie.title}
                                        overview={movie.overview}
                                        genres={{}} // 검색 결과에는 장르 정보 없음
                                        genre_ids={movie.genre_ids || []}
                                    />
                                ))}
                            </div>
                        ) : (
                            // 검색 결과 없을 때
                            searched && !loading && (
                                <div className={styles.noResults}>
                                    <p>😢 No movies found</p>
                                    <p>Try a different search term</p>
                                </div>
                            )
                        )}
                    </section>
                )}

                {/* ========================================
                    초기 화면 (검색 전)
                    ======================================== */}
                {!searched && !loading && (
                    <div className={styles.initialState}>
                        <p className={styles.initialText}>
                            🎬 Search for your favorite movies
                        </p>
                        <p className={styles.initialSubText}>
                            Enter a movie title above to get started
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Search;
