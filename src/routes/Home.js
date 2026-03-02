// ========================================
// Home.js - 메인 페이지 (영화 목록)
// ========================================
// TMDb API에서 인기 영화 목록을 가져와서 표시
// 페이지네이션(5페이지) 지원
// 뒤로가기 시 스크롤 위치 복원 기능 포함

import { useState, useEffect } from "react";
import Movie from "../components/Movie";
import Header from "../components/Header";
import styles from "./Home.module.css";

// ========================================
// API 설정
// ========================================
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";      // 포스터 이미지 URL
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;          // 환경변수에서 API 키 가져오기

// ========================================
// 정렬 옵션 정의
// ========================================
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "Latest" },
  { value: "revenue.desc", label: "Highest Grossing" },
];

function Home() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});

  // ========================================
  // 페이지네이션 상태 (sessionStorage에서 복원)
  // ========================================
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem('homeCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });

  // ========================================
  // 정렬 상태 (sessionStorage에서 복원)
  // ========================================
  const [sortBy, setSortBy] = useState(() => {
    const savedSort = sessionStorage.getItem('homeSortBy');
    return savedSort || "popularity.desc";
  });

  const totalPages = 5;

  const getGenres = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
      const json = await response.json();
      if (json.genres) {
        const genreMap = {};
        json.genres.forEach(genre => {
          genreMap[genre.id] = genre.name;
        });
        setGenres(genreMap);
      } else {
        console.error("API Error:", json);
      }
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    }
  };

  const getMovies = async (page, sort) => {
    setLoading(true);
    try {
      // Top Rated 정렬 시 투표 수 최소값 필터 추가 (신뢰성 있는 평점)
      const voteFilter = sort === "vote_average.desc" ? "&vote_count.gte=200" : "";

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=${sort}&page=${page}${voteFilter}`
      );
      const json = await response.json();
      if (json.results) {
        setMovies(json.results);
      } else {
        console.error("API Error:", json);
        setMovies([]);
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 영화 데이터 로드
  // ========================================
  useEffect(() => {
    getGenres();
    getMovies(currentPage, sortBy);
  }, [currentPage, sortBy]); // 페이지 또는 정렬 변경 시 실행

  // ========================================
  // 상태를 sessionStorage에 저장
  // ========================================
  useEffect(() => {
    sessionStorage.setItem('homeCurrentPage', currentPage.toString());
    sessionStorage.setItem('homeSortBy', sortBy);
  }, [currentPage, sortBy]);

  // ========================================
  // 정렬 변경 핸들러
  // ========================================
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // 정렬 변경 시 1페이지로
    window.scrollTo(0, 0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);    // 페이지 변경 시 맨 위로 스크롤
  };

  return (
    <>
      {/* ========================================
          헤더 (상단 고정)
          ======================================== */}
      <Header />

      {/* ========================================
          메인 컨텐츠
          ======================================== */}
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div>
            {/* 정렬 옵션 */}
            <div className={styles.sortSection}>
              <label htmlFor="sortSelect" className={styles.sortLabel}>Sort by</label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={handleSortChange}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.moviesGrid}>
            {movies.map((movie) => (
              <Movie  // pagenation
                key={movie.id}
                id={movie.id}
                coverImg={`${IMG_BASE_URL}${movie.poster_path}`}
                title={movie.title}
                overview={movie.overview}
                genres={genres}
                genre_ids={movie.genre_ids}
              />
            ))}
          </div>
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.prevButton}
            >
              <span className={styles.buttonText}>Back</span>
              <span className={styles.buttonArrow}>←</span>
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? styles.active : ''}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.nextButton}
            >
              <span className={styles.buttonText}>Next</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default Home;