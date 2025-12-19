import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite";
import useRateLimit from "./hooks/useRateLimit";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { canMakeRequest, makeRequest } = useRateLimit(30, 1800000); // 30 mins window

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error obteniendo peliculas: ${error}`);
    }
  };

  const fetchMovies = async (query = "") => {
    if (query && !canMakeRequest) {
      setErrorMessage("Has alcanzado el límite de búsquedas. Por favor, intenta de nuevo en unos minutos.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Fallo el fetch de peliculas");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "fallo el fetch de peliculas");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
        makeRequest(); // Registrar solo si es una búsqueda válida
      }
    } catch (error) {
      console.error(`Error al obtener peliculas: ${error}`);
      setErrorMessage("Error obteniendo peliculas, por favor intenta luego");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          {/* Logo principal - Ajusta el tamaño en App.css buscando .banner img */}
          <div className="banner">
            <img src="/pelipop.png" alt="PeliPop" />
          </div>
          <img src="./hero.png" alt="" />
          <h1>
            Encuentra tus <span className="text-gradient">Peliculas</span>{" "}
            favoritas sin esfuerzo
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Lo más Visto</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>Todas las peliculas</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie, index) => (
                <MovieCard key={movie.id || index} movie={movie} />
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <p>© 2025 Desarrollado por <span className="author-name">matiascoder</span></p>
        </footer>
      </div>
    </main>
  );
};

export default App;
