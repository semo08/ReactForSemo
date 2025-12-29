// 영화 정보를 카드로 표시. Movie List
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import styles from "./Movie.module.css";

function Movie({ id, coverImg, title, overview, genre_ids, genres }) {

  return (
    <div className={styles.card}>
      <div className={styles.posterContainer}>
        <Link to={`/movie/${id}`}>
          <img className={styles.poster} src={coverImg} alt={title}/>
        </Link>
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Link to={`/movie/${id}`}>{title}</Link>
        </h2>
        <p className={styles.overview}>
          {overview.length > 235 ? `${overview.slice(0, 235)}...` : overview}
        </p>
        <ul className={styles.genres}>
          {genre_ids.map((g) => (
            <li key={g} className={styles.genreTag}>{genres[g]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

Movie.propTypes = {
  id: PropTypes.number.isRequired,
  coverImg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  genre_ids: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Movie;