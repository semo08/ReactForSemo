import PropTypes from "prop-types";
import {Link} from "react-router-dom";

function Movie({ id, coverImg, title, overview, genre_ids, genres }) {
  return (
    <div>
      <img src={coverImg} alt={title} />
      <h2>
        <Link to={`/movie/${id}`}>{title}</Link>
      </h2>
      <p>{overview.length > 235 ? `${overview.slice(0, 235)}...` : overview}</p>
      <ul>
        {genre_ids.map((g) => (
          <li key={g}>{genres[g]}</li>
        ))}
      </ul>
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