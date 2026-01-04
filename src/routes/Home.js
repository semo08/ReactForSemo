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
  // currentPage 초기값: sessionStorage에서 복원
  // ========================================
  /*
    뒤로가기로 돌아왔을 때:
    - sessionStorage에 저장된 페이지가 있으면 그 페이지로 시작
    - 없으면 1페이지로 시작

    parseInt(): 문자열을 숫자로 변환
    || 1: 값이 없거나 잘못된 경우 기본값 1 사용
  */
  const [currentPage, setCurrentPage] = useState(() => {
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
  // 브라우저 기본 스크롤 복원 비활성화 + 즉시 스크롤 복원
  // ========================================
  useEffect(() => {
    /*
      브라우저와 React Router는 기본적으로 페이지 전환 시
      스크롤을 맨 위로 올립니다.
      이것을 방지하기 위해 'manual' 모드로 설정합니다.

      이게 핵심!
      - auto (기본값): 브라우저가 자동으로 스크롤 위치 복원
      - manual: 우리가 직접 스크롤 위치를 관리
    */
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    /*
      즉시 스크롤 위치 복원!
      - 데이터 로드 전에 먼저 스크롤 위치를 설정
      - 깜빡임 없이 바로 이전 위치로 이동
      - 나중에 데이터가 로드되면 자연스럽게 컨텐츠가 채워짐
    */
    const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedScrollPosition) {
      // 즉시 스크롤 (setTimeout 없이!)
      window.scrollTo(0, parseInt(savedScrollPosition));
      console.log('⚡ 즉시 스크롤 복원:', savedScrollPosition);
    }
  }, []); // 컴포넌트 mount 시 한 번만 실행

  // ========================================
  // 영화 데이터 로드
  // ========================================
  useEffect(() => {
    getGenres();
    getMovies(currentPage);   // 현재 페이지의 영화만 불러오기
  }, [currentPage]);    // currentPage가 바뀔 때마다 실행
  console.log(movies);

  // ========================================
  // currentPage 저장 (페이지가 바뀔 때마다)
  // ========================================
  useEffect(() => {
    /*
      currentPage가 변경될 때마다 sessionStorage에 저장
      예: 사용자가 3페이지로 이동 → '3' 저장
    */
    sessionStorage.setItem('homeCurrentPage', currentPage.toString());
  }, [currentPage]); // currentPage가 바뀔 때마다 실행

  // ========================================
  // 스크롤 위치 저장 (스크롤할 때마다 실시간 저장)
  // ========================================
  useEffect(() => {
    /*
      문제: cleanup 함수에서 저장하면 너무 늦음
      - Link 클릭 → 페이지 전환 시작 → 스크롤 0으로 리셋 → cleanup 실행
      - 이미 스크롤이 0이 된 후라 0이 저장됨!

      해결: 스크롤할 때마다 실시간으로 저장
      - 사용자가 스크롤 → 즉시 sessionStorage에 저장
      - Link 클릭 시 이미 올바른 값이 저장되어 있음!
    */
    const handleScroll = () => {
      // 현재 스크롤 위치를 즉시 저장
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);

    // cleanup: 컴포넌트 unmount 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.log('✅ 저장된 스크롤 위치:', sessionStorage.getItem('homeScrollPosition'));
    };
  }, []); // 빈 배열: 컴포넌트 mount/unmount 시에만 실행

  // ========================================
  // 스크롤 위치 미세 조정 (데이터 로드 후)
  // ========================================
  useEffect(() => {
    /*
      데이터가 로드된 후 스크롤 위치를 한 번 더 확인
      - 즉시 복원으로 대부분 해결되지만, 혹시 모를 경우를 대비
      - 데이터 로드 후 DOM이 완전히 렌더링되면 정확한 위치로 재조정
    */
    if (!loading && movies.length > 0) {
      const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');

      if (savedScrollPosition) {
        // 짧은 delay로 DOM 렌더링 완료 후 미세 조정
        setTimeout(() => {
          const targetPosition = parseInt(savedScrollPosition);
          const currentPosition = window.scrollY;

          // 현재 위치와 목표 위치가 다르면 재조정
          if (Math.abs(currentPosition - targetPosition) > 10) {
            window.scrollTo(0, targetPosition);
            console.log('🔧 스크롤 위치 미세 조정:', currentPosition, '→', targetPosition);
          }

          // 복원 완료 후 sessionStorage에서 삭제
          sessionStorage.removeItem('homeScrollPosition');
        }, 50); // 매우 짧은 delay
      }
    }
  }, [loading, movies]); // loading과 movies가 변경될 때마다 실행

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