// ========================================
// Home.js - 메인 페이지 (영화 목록)
// ========================================
// TMDb API에서 인기 영화 목록을 가져와서 표시
// 페이지네이션(5페이지) 지원
// 뒤로가기 시 스크롤 위치 복원 기능 포함

import { useState, useEffect } from "react";
import Movie from "../components/Movie";
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
  const [currentPage, setCurrentPage] = useState(1);
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
  // 스크롤 위치 복원 (뒤로가기 시)
  // ========================================
  useEffect(() => {
    // 컴포넌트가 mount될 때 (페이지 로드 시)
    // sessionStorage에서 저장된 스크롤 위치 가져오기
    const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');

    if (savedScrollPosition) {
      // 저장된 위치가 있으면 해당 위치로 스크롤
      // setTimeout을 사용하는 이유: 영화 데이터 로드 후 스크롤해야 정확함
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100); // 100ms 후 실행
    }

    // 컴포넌트가 unmount될 때 (다른 페이지로 이동할 때)
    // cleanup 함수: return으로 반환하는 함수는 컴포넌트가 사라질 때 실행됨
    return () => {
      // 현재 스크롤 위치를 sessionStorage에 저장
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };
  }, []); // 빈 배열: 컴포넌트 mount/unmount 시에만 실행

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);    // 페이지 변경 시 맨 위로 스크롤
  };

  return (
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
            >
              Back
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
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;