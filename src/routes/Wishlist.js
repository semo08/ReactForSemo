// ========================================
// Wishlist.js - 찜한 영화 목록 페이지
// ========================================
// 사용자가 찜한 영화들을 보여주는 페이지

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Movie from '../components/Movie';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './Wishlist.module.css';

// ========================================
// API 설정
// ========================================
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

function Wishlist() {
    // ========================================
    // Hooks
    // ========================================
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // ========================================
    // 로그인 체크
    // ========================================
    useEffect(() => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다!');
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    // ========================================
    // 찜 삭제 핸들러
    // ========================================
    const handleRemove = async (movieId, movieTitle) => {
        if (window.confirm(`"${movieTitle}"을(를) 찜 목록에서 삭제하시겠습니까?`)) {
            await removeFromWishlist(movieId);
        }
    };

    // ========================================
    // 렌더링
    // ========================================
    return (
        <>
            {/* 헤더 */}
            <Header />

            <div className={styles.container}>
                {/* ========================================
                    페이지 타이틀
                    ======================================== */}
                <section className={styles.titleSection}>
                    <h1 className={styles.title}>My Wishlist</h1>
                    <p className={styles.subtitle}>
                        {wishlist.length > 0
                            ? `You have ${wishlist.length} movie${wishlist.length > 1 ? 's' : ''} in your wishlist`
                            : 'Your wishlist is empty'}
                    </p>
                </section>

                {/* ========================================
                    로딩 중
                    ======================================== */}
                {loading && (
                    <div className={styles.loading}>
                        Loading your wishlist...
                    </div>
                )}

                {/* ========================================
                    찜 목록
                    ======================================== */}
                {!loading && wishlist.length > 0 && (
                    <div className={styles.moviesGrid}>
                        {wishlist.map((movie) => (
                            <div key={movie.id} className={styles.movieWrapper}>
                                <Movie
                                    id={movie.id}
                                    coverImg={movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : null}
                                    title={movie.title}
                                    overview={movie.overview}
                                    genres={{}}
                                    genre_ids={[]}
                                />
                                {/* 삭제 버튼 */}
                                <button
                                    className={styles.removeButton}
                                    onClick={() => handleRemove(movie.id, movie.title)}
                                    aria-label="Remove from wishlist"
                                >
                                    Remove ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ========================================
                    빈 목록 (로딩 완료 후)
                    ======================================== */}
                {!loading && wishlist.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💔</div>
                        <h2 className={styles.emptyTitle}>No movies in your wishlist</h2>
                        <p className={styles.emptyText}>
                            Start adding movies you want to watch!
                        </p>
                        <button
                            className={styles.browseButton}
                            onClick={() => navigate('/')}
                        >
                            Browse Movies
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Wishlist;
