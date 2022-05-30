const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p'
const apiKey = '5446ab24b5c44c62664c314851352fcf';

var currentApiPage = 1;
var activeSearch = false;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const closeSearchBtn = document.getElementById('close-search-btn');
const moviesSection = document.getElementById('movies-section');
const nowPlayingMovies = document.getElementById('now-playing-movies');
const loadMoreBtn = document.getElementById('load-more-movies-btn');
const searchSection = document.getElementById('search-section');
const moviesSearchResults = document.getElementById('movie-search-results');


async function fetchMoviesNowPlaying() {
    const response = await fetch(`${apiBaseUrl}/movie/now_playing?api_key=${apiKey}&page=${currentApiPage}`);
    const jsonResponse = await response.json();

    let movies = jsonResponse.results.map(result => ({
        id: result.id,
        title: result.title,
        posterPath: result.poster_path,
        voteAvg: result.vote_average,
    }))

    displayMovies(movies, nowPlayingMovies);
    loadMoreBtn.disabled = false;
}

async function searchMovies(searchQuery) {
    const response = await fetch(`${apiBaseUrl}/search/movie?api_key=${apiKey}&query=${searchQuery}`);
    const jsonResponse = await response.json();

    let movies = jsonResponse.results.map(result => ({
        id: result.id,
        title: result.title,
        posterPath: result.poster_path,
        voteAvg: result.vote_average,
    }))

    return movies;
}

async function selectMovie(id) {
    const response = await fetch(`${apiBaseUrl}/movie/${id}?api_key=${apiKey}`);
    const jsonResponse = await response.json();

    const movie = {
        id: id,
        title: jsonResponse.title,
        overview: jsonResponse.overview,
        posterPath: jsonResponse.poster_path,
        backdropPath: jsonResponse.backdrop_path,
        releaseDate: jsonResponse.release_date,
        status: jsonResponse.status,
        runtime: jsonResponse.runtime,
        genres: jsonResponse.genres,
        voteAvg: jsonResponse.vote_average,
    }

    displayMoviePopup(movie);
}

function displayMovies(movies, htmlElement) {
    const moviesHTMLString = movies.map(movie => `
        <li class="movie-card" onclick="selectMovie(${movie.id})">
            <img class="movie-poster" src="${imageBaseUrl}/w342${movie.posterPath}" alt="${movie.title}" title="${movie.title}"/>
            <div class="movie-details">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-votes">⭐ ${movie.voteAvg}</div>
            </div>
        </li>
    `).join('');

    htmlElement.innerHTML = htmlElement.innerHTML + moviesHTMLString;
}

function displayMoviePopup(movie) {
    const popup = document.createElement('div');
    popup.className = 'popup';

    const genres = movie.genres.slice(0, 3).map(genre => genre.name).join(', ');

    popup.innerHTML = `
        <button id="close-btn" onclick="closePopup()">Close</button>
        <article class="movie-popup">
            <img class="movie-backdrop" src="${imageBaseUrl}/w780${movie.backdropPath}" alt="${movie.title}" title="${movie.title}"/>
            <section class="movie-details">
                <div class="movie-image">
                    <img class="movie-poster" src="${imageBaseUrl}/w342${movie.posterPath}" alt="${movie.title}" title="${movie.title}"/>
                </div>
                <div class="movie-info">
                    <p class="movie-genres">${genres}</p>
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-specs">${movie.runtime} min | ${movie.releaseDate}</p>
                </div>
                <div class="movie-votes">
                    <span>⭐</span><br>
                    ${movie.voteAvg}
                </div>
            </section>
            <p class-"movie-overview">${movie.overview}</p>
        </article>
    `;

    document.body.appendChild(popup)
    document.body.style.height = '100vh';
    document.body.style.overflowY = 'hidden';
}

function closePopup() {
    const popup = document.querySelector('.popup');
    popup.parentElement.removeChild(popup);

    document.body.style.height = '';
    document.body.style.overflowY = '';
}

function loadMoreMovies() {
    currentApiPage++;
    loadMoreBtn.disabled = true;
    fetchMoviesNowPlaying();
}

function closeSearch() {
    activeSearch = false;
    moviesSection.classList.remove('hidden');
    searchSection.classList.add('hidden');
    closeSearchBtn.classList.add('hidden');
    moviesSearchResults.innerHTML = '';
    searchInput.value = '';
}

function handleSearchInputFocus(event) {
    event.preventDefault();

    if (activeSearch) {
        return;
    }

    activeSearch = true;

    moviesSection.classList.add('hidden');
    searchSection.classList.remove('hidden');
    closeSearchBtn.classList.remove('hidden');
}

async function handleSearchFormSubmit(event) {
    event.preventDefault();
    moviesSearchResults.innerHTML = '';

    const searchQuery = searchInput.value;

    // Let's ignore submit events with empty search query
    if (!searchQuery.trim().length) {
        return;
    }

    const movieResults = await searchMovies(searchQuery);

    displayMovies(movieResults, moviesSearchResults);
}

function init() {
    // Listen for search input focus event
    searchInput.addEventListener('focus', handleSearchInputFocus);

    // Listen for search form submit events
    searchForm.addEventListener('submit', handleSearchFormSubmit);

    fetchMoviesNowPlaying();
}

init();