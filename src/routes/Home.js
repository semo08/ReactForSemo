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

function Home() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});

  // ========================================
  // 페이지네이션 상태 (sessionStorage에서 복원)
  // ========================================
  const [currentPage, setCurrentPage] = useState(() => {
    // 뒤로가기로 돌아왔을 때 이전 페이지 번호 복원
    const savedPage = sessionStorage.getItem('homeCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
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

  const getMovies = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
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
    getMovies(currentPage);   // 현재 페이지의 영화만 불러오기
  }, [currentPage]);    // currentPage가 바뀔 때마다 실행
  console.log(movies);

  // ========================================
  // currentPage를 sessionStorage에 저장
  // ========================================
  useEffect(() => {
    // 페이지가 바뀔 때마다 저장 (뒤로가기 시 복원용)
    sessionStorage.setItem('homeCurrentPage', currentPage.toString());
  }, [currentPage]);

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