import PropTypes from "prop-types";
import {Link} from "react-router-dom";

function Movie({ coverImg, title, overview, genre_ids, genres }) {
  return (
    <div>
      <img src={coverImg} alt={title} />
      <h2>
        <Link to="/movie">{title}</Link>
      </h2>
      <p>{overview}</p>
      <ul>
        {genre_ids.map((g) => (
          <li key={g}>{genres[g]}</li>
        ))}
      </ul>
    </div>
  );
}

Movie.propTypes = {
  coverImg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  genre_ids: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Movie;