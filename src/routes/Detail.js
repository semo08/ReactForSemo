// 상세 페이지
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Detail.module.css";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/original";

function Detail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const getMovie = async () => {
            try {
                const json = await (
                    await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`)
                ).json();
                console.log(json);
                setMovie(json);
            } catch (error) {
                console.error("Failed to fetch movie:", error);
            } finally {
                setLoading(false);
            }
        };
        getMovie();
    }, [id]);

    const handleWishlist = () => {
        // TODO: Firebase 연동 후 찜 기능 구현
        setIsWishlisted(!isWishlisted);
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!movie) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Can't find movie details</div>;
    }

    return (
        <div>
            {/* 1. 히어로 섹션 */}
            <section className={styles.heroSection}>
                {/* 배경 이미지 */}
                {movie.backdrop_path && (
                    <>
                        <img
                            src={`${BACKDROP_URL}${movie.poster_path}`}
                            alt={movie.title}
                        />
                    </>
                )}
                {/* 포스터 */}
                <div>
                    <img
                        src={`${IMG_BASE_URL}${movie.poster_path}`}
                        alt={movie.title} />
                </div>
                <h1>
                    {movie.title}
                    {movie.adult && <span>🔞 19+</span>}
                </h1>
                {movie.tagline && (<p>"{movie.tagline}"</p>
                )}
            </section>

            {/* 2. 영화 정보 */}
            <section className={styles.infoBar}>
                {/* 여기에 기본 정보 바 코드 작성 */}
            </section>

            {/* 3. 줄거리 */}
            <section className={styles.overview}>
                {/* 여기에 줄거리 코드 작성 */}
            </section>

            {/* 4. 상세 정보 */}
            <section className={styles.details}>
                {/* 여기에 상세 정보 코드 작성 */}
            </section>

            {/* 5. 제작사 정보 */}
            <section className={styles.production}>
                {/* 여기에 제작사 정보 코드 작성 */}
            </section>

            {/* 6. 시리즈 정보 (있는 경우만) */}
            <section className={styles.collection}>
                {/* 여기에 시리즈 정보 코드 작성 */}
            </section>
        </div>
    );
}

export default Detail;