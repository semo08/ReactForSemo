import { useState, useEffect } from "react";
import Movie from "../components/Movie";
const API_KEY = 'a29edf6ab4f6a55946f26c28cd66c6fb';
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

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