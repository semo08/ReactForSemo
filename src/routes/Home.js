// 메인 페이지
import { useState, useEffect } from "react";
import Movie from "../components/Movie";
import styles from "./Home.module.css";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function Home() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});

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

  const getMovies = async () => {
    try {
      for (let page = 1; page <= 5; page++) {
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
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }

  };
  useEffect(() => {
    getGenres();
    getMovies();
  }, []);
  console.log(movies);

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
        </div>
      )}
    </div>
  );
}

export default Home;