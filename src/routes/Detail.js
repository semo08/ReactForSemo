import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_KEY } from "../config";

function Detail() {
    const { id } = useParams();
    const getMovie = async () => {
        const json = await (
            await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ko-KR`)
        ).json();
        console.log(json);
    };
    useEffect(() => {
        getMovie();
    }, [])
    return <h1>Detail</h1>;
}

export default Detail;