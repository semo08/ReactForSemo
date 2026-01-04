// ========================================
// Collection.js - 시리즈 컬렉션 페이지
// ========================================
// 영화 시리즈의 모든 작품을 보여주는 페이지
// 예: Avatar Collection → Avatar 1, 2, 3 등

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Movie from "../components/Movie";
import styles from "./Collection.module.css";

// ========================================
// API 설정
// ========================================
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function Collection() {
    // ========================================
    // React Router Hooks
    // ========================================
    const { id } = useParams(); // URL에서 collection ID 가져오기 (예: /collection/87096)
    const navigate = useNavigate(); // 뒤로가기 등 페이지 이동용

    // ========================================
    // State 관리
    // ========================================
    const [loading, setLoading] = useState(true);
    const [collection, setCollection] = useState(null);

    // ========================================
    // Collection 데이터 로드
    // ========================================
    useEffect(() => {
        const getCollection = async () => {
            try {
                /*
                    TMDb API - Collection Details
                    GET /3/collection/{collection_id}

                    예: https://api.themoviedb.org/3/collection/87096?api_key=xxx&language=en-US

                    응답 데이터:
                    - id: 컬렉션 ID
                    - name: 컬렉션 이름 (예: "Avatar Collection")
                    - overview: 컬렉션 설명
                    - poster_path: 컬렉션 포스터
                    - backdrop_path: 배경 이미지
                    - parts: 컬렉션에 포함된 영화들 배열
                */
                const response = await fetch(
                    `https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}&language=en-US`
                );
                const json = await response.json();

                console.log("컬렉션 데이터:", json);

                // 에러 체크 (404 등)
                if (json.success === false) {
                    console.error("Collection을 찾을 수 없습니다:", json);
                    alert("Collection not found.");
                    navigate(-1); // 뒤로가기
                    return;
                }

                setCollection(json);
            } catch (error) {
                console.error("Collection 정보를 불러오는데 실패했습니다:", error);
                alert("Failed to load collection information.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        getCollection();
    }, [id, navigate]); // id가 바뀔 때마다 다시 실행

    // ========================================
    // 로딩 중 화면
    // ========================================
    if (loading) {
        return (
            <>
                <Header />
                <div className={styles.loading}>Loading...</div>
            </>
        );
    }

    // ========================================
    // 데이터 없을 때
    // ========================================
    if (!collection) {
        return (
            <>
                <Header />
                <div className={styles.loading}>Collection not found</div>
            </>
        );
    }

    // ========================================
    // 메인 렌더링
    // ========================================
    return (
        <>
            <Header />

            {/* ========================================
                히어로 섹션 (배경 이미지 + 컬렉션 정보)
                ======================================== */}
            <section className={styles.heroSection}>
                {/* 배경 이미지 */}
                {collection.backdrop_path && (
                    <>
                        <img
                            src={`${IMG_BASE_URL}${collection.backdrop_path}`}
                            alt={collection.name}
                            className={styles.backdrop}
                        />
                        <div className={styles.backdropOverlay}></div>
                    </>
                )}

                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate(-1)}
                    className={styles.backButton}
                >
                    ← Back
                </button>

                {/* 컬렉션 정보 */}
                <div className={styles.heroContent}>
                    {/* 포스터 */}
                    {collection.poster_path && (
                        <img
                            src={`${IMG_BASE_URL}${collection.poster_path}`}
                            alt={collection.name}
                            className={styles.poster}
                        />
                    )}

                    {/* 텍스트 정보 */}
                    <div className={styles.collectionInfo}>
                        <h1 className={styles.title}>{collection.name}</h1>
                        {collection.overview && (
                            <p className={styles.overview}>{collection.overview}</p>
                        )}
                        <p className={styles.movieCount}>
                            {collection.parts?.length || 0} Movies
                        </p>
                    </div>
                </div>
            </section>

            {/* ========================================
                영화 목록 (컬렉션에 포함된 영화들)
                ======================================== */}
            <section className={styles.moviesSection}>
                <h2 className={styles.sectionTitle}>Movies in this Collection</h2>

                <div className={styles.moviesGrid}>
                    {/*
                        parts: 컬렉션에 포함된 영화들 배열
                        release_date 기준으로 정렬 (오래된 순서)
                    */}
                    {collection.parts
                        ?.sort((a, b) => {
                            // release_date 기준 오름차순 정렬
                            return new Date(a.release_date) - new Date(b.release_date);
                        })
                        .map((movie) => (
                            <Movie
                                key={movie.id}
                                id={movie.id}
                                coverImg={`${IMG_BASE_URL}${movie.poster_path}`}
                                title={movie.title}
                                overview={movie.overview}
                                genres={{}} // Collection API는 장르 정보가 없음
                                genre_ids={[]}
                            />
                        ))}
                </div>
            </section>
        </>
    );
}

export default Collection;
