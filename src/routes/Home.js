import { useState, useEffect } from "react";
import Movie from "../components/Movie";
import { API_KEY, IMG_BASE_URL } from "../config";

function Home() {
    const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});

  const getGenres = async () => {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=ko-KR`);
    const json = await response.json();
    const genreMap = {};
    json.genres.forEach(genre => {
      genreMap[genre.id] = genre.name;
    });
    setGenres(genreMap);
  };

  const getMovies = async () => {
    const json = await (
      await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR`
      )
    ).json();
    setMovies(json.results);
    setLoading(false);
  };
  useEffect(() => {
    getGenres();
    getMovies();
  }, []);
  console.log(movies);

  return (
    <div>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          {movies.map((movie) => (
            <Movie
              key={movie.id}
              id={movie.id}
              coverImg={`${IMG_BASE_URL}${movie.poster_path}`}
              title={movie.original_title}
              overview={movie.overview}
              genres={genres}
              genre_ids={movie.genre_ids}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;