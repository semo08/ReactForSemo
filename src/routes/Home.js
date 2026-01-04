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
  // 브라우저 기본 스크롤 복원 비활성화
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
  // 스크롤 위치 복원 (영화 데이터 로드 후)
  // ========================================
  useEffect(() => {
    /*
      스크롤 복원 조건:
      1. loading이 false여야 함 (데이터 로드 완료)
      2. movies 배열에 데이터가 있어야 함 (렌더링할 컨텐츠 존재)

      왜 이렇게?
      - 영화 카드가 화면에 렌더링된 후에 스크롤해야 정확한 위치로 이동
      - 데이터가 없는 상태에서 스크롤하면 스크롤할 컨텐츠가 없어서 실패
    */
    if (!loading && movies.length > 0) {
      // sessionStorage에서 저장된 스크롤 위치 가져오기
      const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');

      console.log('🔍 스크롤 복원 체크:', {
        loading,
        moviesCount: movies.length,
        savedScrollPosition
      });

      if (savedScrollPosition) {
        /*
          setTimeout을 사용하는 이유:
          1. loading이 false가 되어도 DOM 렌더링은 조금 더 시간이 걸림
          2. 브라우저가 영화 카드들을 화면에 그리는 동안 잠깐 기다림
          3. React Router가 뒤로가기 시 자동으로 스크롤을 맨 위로 올리는데,
             그것보다 늦게 실행되도록 시간을 늘림 (100ms → 300ms)
        */
        setTimeout(() => {
          const targetPosition = parseInt(savedScrollPosition);
          console.log('📜 스크롤 이동 시도:', targetPosition);

          window.scrollTo(0, targetPosition);

          // 실제로 스크롤이 이동했는지 확인
          setTimeout(() => {
            console.log('📍 현재 스크롤 위치:', window.scrollY);
          }, 50);

          // ✅ 복원 후 sessionStorage에서 삭제
          // 이렇게 하면 페이지 버튼 클릭 시에는 복원하지 않고,
          // 뒤로가기로 돌아왔을 때만 한 번만 복원됨
          sessionStorage.removeItem('homeScrollPosition');
        }, 300); // 100ms → 300ms로 증가
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
    </>
  );
}

export default Home;