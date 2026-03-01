// ========================================
// Search.js - 영화 검색 페이지
// ========================================
// 사용자가 검색어를 입력하면 TMDb API로 영화를 검색
// 최근 검색 기록 표시 기능 포함

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Movie from "../components/Movie";
import useSearchHistory from "../hooks/useSearchHistory";
import styles from "./Search.module.css";

// ========================================
// API 설정
// ========================================
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function Search() {
    // ========================================
    // URL Query Parameter 관리
    // ========================================
    const [searchParams, setSearchParams] = useSearchParams();
    const queryFromURL = searchParams.get("q") || ""; // URL에서 검색어 가져오기

    // ========================================
    // State 관리
    // ========================================
    const [searchQuery, setSearchQuery] = useState(queryFromURL); // 검색어 입력값
    const [movies, setMovies] = useState([]); // 검색 결과
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [searched, setSearched] = useState(false); // 검색 실행 여부
    const [totalResults, setTotalResults] = useState(0); // 총 검색 결과 개수

    // ========================================
    // 검색 기록 훅
    // ========================================
    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

    // ========================================
    // 영화 검색 API 호출
    // ========================================
    const searchMovies = async (query, saveToHistory = true) => {
        /*
            TMDb Search API 호출
            - query: 사용자가 입력한 검색어
            - saveToHistory: 검색 기록에 저장할지 여부
        */

        if (!query.trim()) {
            // 빈 문자열 체크 (.trim()은 공백 제거)
            alert("Please enter a search term!");
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

            // 검색 기록에 추가
            if (saveToHistory) {
                addToHistory(query);
            }
        } catch (error) {
            console.error("검색 실패:", error);
            alert("An error occurred during search.");
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // ========================================
    // URL에서 검색어가 있으면 자동 검색
    // ========================================
    useEffect(() => {
        if (queryFromURL) {
            searchMovies(queryFromURL, false); // URL에서 온 검색은 기록에 추가 안 함
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 컴포넌트 mount 시 1회만 실행

    // ========================================
    // 검색 폼 제출 핸들러
    // ========================================
    const handleSubmit = (e) => {
        /*
            폼 제출 시 실행
            e.preventDefault(): 페이지 새로고침 방지
        */
        e.preventDefault();

        // URL에 검색어 추가 (뒤로가기 시 검색 결과 유지)
        setSearchParams({ q: searchQuery });

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
    // 검색 기록 클릭 핸들러
    // ========================================
    const handleHistoryClick = (term) => {
        setSearchQuery(term);
        setSearchParams({ q: term });
        searchMovies(term);
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
                        {/* 검색 입력 컨테이너 */}
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Search for a movie..."
                                className={styles.searchInput}
                            />
                            {/* 입력 내용 지우기 버튼 */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    className={styles.clearInputBtn}
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search input"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <button type="submit" className={styles.searchButton}>
                            Search
                        </button>
                    </form>
                </section>

                {/* ========================================
                    검색 기록 (검색 전에만 표시)
                    ======================================== */}
                {!searched && !loading && (
                    <section className={styles.historySection}>
                        {history.length > 0 ? (
                            <>
                                {/* 헤더 */}
                                <div className={styles.historyHeader}>
                                    <span className={styles.historyTitle}>RECENT SEARCHES</span>
                                    <button
                                        className={styles.clearAllButton}
                                        onClick={clearHistory}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Pill 컨테이너 */}
                                <div className={styles.historyContainer}>
                                    {history.map((term, index) => (
                                        <div key={index} className={styles.historyPill}>
                                            <span
                                                className={styles.historyTerm}
                                                onClick={() => handleHistoryClick(term)}
                                            >
                                                {term}
                                            </span>
                                            <button
                                                className={styles.historyDeleteBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(term);
                                                }}
                                                aria-label={`Remove ${term} from history`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* 빈 상태 */
                            <p className={styles.historyEmpty}>No recent searches yet</p>
                        )}
                    </section>
                )}

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
                                ? `Found ${totalResults} results for "${searchParams.get("q")}"`
                                : `No results found for "${searchParams.get("q")}"`}
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
                                    <p>No movies found</p>
                                    <p>Try a different search term</p>
                                </div>
                            )
                        )}
                    </section>
                )}
            </div>
        </>
    );
}

export default Search;
