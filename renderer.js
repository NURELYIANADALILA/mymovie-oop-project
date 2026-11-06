const API_KEY = typeof module !== 'undefined' && module.exports ? require('./config') : window.TMDB_API_KEY;
const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const movieSearch = document.getElementById('movieSearch');
const movieResults = document.getElementById('movieResults');
const message = document.getElementById('message');
const recommendButton = document.getElementById('recommendButton');
let allMovies = [];
// TMDB GENRE ID
const genreList = {Action: 28, Adventure: 12, Comedy: 35, Horror: 27, Thriller: 53, 'Sci-Fi': 878, Romance: 10749};
// CONVERT TMDB MOVIE DATA TO MYMOVIE FORMAT
function formatMovie(movie) {
    const genres = movie.genre_ids || [];
    const genreNames = genres.map(id => {
        for (const [name, genreID] of Object.entries(genreList)) {
            if (id === genreID) {
                return name;
            }
        }
        return null;
    }).filter(Boolean);
    return {
        imdbID: `tmdb-${movie.id}`,
        Title: movie.title || 'Unknown Title',
        Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
        Poster: movie.poster_path? `https://image.tmdb.org/t/p/w500${movie.poster_path}`: 'N/A',
        Genre: genreNames.join(', ') || 'Other',
        imdbRating: movie.vote_average ? movie.vote_average.toFixed(1): 'N/A',
        overview: movie.overview || 'No description available.',
        status: 'Not Watched'
    };
}
// GET MOVIE DATA FROM TMDB
async function fetchMovies(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.success === false) {
        throw new Error(data.status_message);
    }
    return data.results || [];
}
// DISPLAY MOVIE CARDS
function displayMovies(movies) {
    movieResults.innerHTML = '';
    if (movies.length === 0) {
        movieResults.textContent = 'No movies available.';
        return;
    }
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        // MOVIE POSTER
        const poster = document.createElement('img');
        poster.src = movie.Poster !== 'N/A' ? movie.Poster : '';
        poster.alt = movie.Title;
        // MOVIE TITLE
        const title = document.createElement('h3');
        title.textContent = movie.Title;
        // VIEW DETAILS BUTTON
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'View details';
        detailsButton.addEventListener('click', () => {
            showMovieDetails(movie);
        });
        // ADD TO WATCH LIST BUTTON
        const addButton = document.createElement('button');
        const watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
        const alreadyAdded = watchlist.some(item => item.imdbID === movie.imdbID);
        addButton.textContent = alreadyAdded ? 'Already added' : 'Add to watch list';
        addButton.disabled = alreadyAdded;
        addButton.addEventListener('click', () => {
            addToWatchlist(movie, addButton);
        });
        // DISPLAY MOVIE CARD
        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(detailsButton);
        card.appendChild(addButton);
        movieResults.appendChild(card);
    });
}
//DISPLAY MOVIE DETAILS
function showMovieDetails(movie) {
    // CREATE POPUP BACKGROUND
    const overlay = document.createElement('div');
    overlay.className = 'movie-modal-overlay';
    // CREATE MOVIE DETAILS CONTAINER
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    // CLOSE BUTTON
    const closeButton = document.createElement('button');
    closeButton.className = 'close-modal';
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    // MOVIE POSTER
    const poster = document.createElement('img');
    poster.src = movie.Poster !== 'N/A' ? movie.Poster : '';
    poster.alt = movie.Title;
    // MOVIE INFORMATION
    const details = document.createElement('div');
    details.className = 'movie-details';
    const title = document.createElement('h2');
    title.textContent = movie.Title;
    const year = document.createElement('p');
    year.textContent = `Release Year: ${movie.Year}`;
    const genre = document.createElement('p');
    genre.textContent = `Genre: ${movie.Genre}`;
    const rating = document.createElement('p');
    rating.textContent = `TMDB Rating: ${movie.imdbRating}/10`;
    const description = document.createElement('p');
    description.textContent = `Description: ${movie.overview || 'No description available.'}`;
    // ADD TO WATCH LIST BUTTON
    const addButton = document.createElement('button');
    addButton.textContent = '+ Add to Watchlist';
    const watchlist = JSON.parse(
        localStorage.getItem('myWatchlist')) || [];
    const alreadyAdded = watchlist.some(item => item.imdbID === movie.imdbID);
    if (alreadyAdded) {
        addButton.textContent = 'Already Added';
        addButton.disabled = true;
    }
    addButton.addEventListener('click', () => {
        addToWatchlist(movie, addButton);
    });
    // ASSEMBLE MOVIE DETAILS
    details.appendChild(title);
    details.appendChild(year);
    details.appendChild(genre);
    details.appendChild(rating);
    details.appendChild(description);
    details.appendChild(addButton);
    modal.appendChild(closeButton);
    modal.appendChild(poster);
    modal.appendChild(details);
    overlay.appendChild(modal);
    // CLOSE WHEN CLICK OUTSIDE POPUP
    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });
    document.body.appendChild(overlay);
}
// SEARCH MOVIE USING TMDB API
async function searchMovies(searchText) {
    if (searchText.trim() === '') {
        alert('Please enter a movie name first!');
        message.textContent = 'Please enter a movie title.';
        return;
    }
    message.textContent = 'Searching movies...';
    movieResults.innerHTML = '';
    document.getElementById('recommendationMessage').textContent = '';
    try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchText)}`;
        const results = await fetchMovies(url);
        allMovies = results.map(movie => formatMovie(movie));
        // CHECK MOVIE AVAILABILITY
        if (allMovies.length === 0) {
            alert('No movie found.');
            message.textContent = 'No movie found.';
            return;
        }
        displayMovies(allMovies);
        message.textContent = `Found ${allMovies.length} movies matching your search!\nClick clear button to refresh`;
    } catch (error) {
        message.textContent = 'Unable to retrieve movies from TMDB.';
        console.error(error);
    }
}
// LOAD POPULAR MOVIE AUTO
async function loadPopularMovies() {
    message.textContent = 'Loading popular movies...';
    movieResults.innerHTML = '';
    try {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
        const results = await fetchMovies(url);
        allMovies = results.map(movie => formatMovie(movie));
        displayMovies(allMovies);
        message.textContent =`Showing ${allMovies.length} popular movies`;
    } catch (error) {
        message.textContent = 'Unable to load popular movies.';
        console.error(error);
    }
}
// MOVIE SUGGESTION LOGIC
async function suggestMovies() {
    const selectedGenre = document.getElementById('recommendationGenre').value;
    const recommendationMessage = document.getElementById('recommendationMessage');
    movieResults.innerHTML = '';
    if (selectedGenre === '') {
        alert('Please select your preferred genre first');
        recommendationMessage.textContent = 'Please select your preferred genre first. Click clear button to refresh.';
        return;
    }
    // DETERMINE GENRE ID USING IF ELSE
    let genreID = 0;
    if (selectedGenre === 'Action') {
        genreID = 28;
    } else if (selectedGenre === 'Romance') {
        genreID = 10749;
    } else if (selectedGenre === 'Comedy') {
        genreID = 35;
    } else if (selectedGenre === 'Horror') {
        genreID = 27;
    } else if (selectedGenre === 'Thriller') {
        genreID = 53;
    } else if (selectedGenre === 'Sci-Fi') {
        genreID = 878;
    } else if (selectedGenre === 'Adventure') {
        genreID = 12;
    }
    try {
        recommendationMessage.textContent = `Finding ${selectedGenre} movies...`;
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreID}&sort_by=popularity.desc`;
        const results = await fetchMovies(url);
        const recommendedMovies = results.map(movie => formatMovie(movie));
        allMovies = recommendedMovies;
        if (recommendedMovies.length > 0) {
            recommendationMessage.textContent = `${selectedGenre} movies recommendation.\nClick clear button to refresh.`;
            displayMovies(recommendedMovies);
        } else {
            recommendationMessage.textContent =`Sorry, no suitable ${selectedGenre} movies found. Click clear button to refresh.`;
        }
    } catch (error) {
        recommendationMessage.textContent ='Unable to retrieve movie recommendations. Click clear button to refresh.';
        console.error(error);
    }
}
// ADD MOVIE TO WATCH LIST (CREATE)
function addToWatchlist(movie, button) {
    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
    const alreadyAdded = watchlist.some(item => item.imdbID === movie.imdbID);
    if (alreadyAdded) {
        alert('This movie is already in your watchlist!')
        message.textContent ='Movie already in your watchlist.';
        button.textContent = 'Already Added';
        button.disabled = true;
        return;
    }
    movie.status = 'Not Watched';
    watchlist.push(movie);
    localStorage.setItem('myWatchlist', JSON.stringify(watchlist));
    button.textContent = 'Added to Watchlist';
    button.disabled = true;
    alert('Movie successfully added to your watchlist')
    message.textContent =`${movie.Title} added successfully!`;
}
// SEARCH BUTTON
searchButton.addEventListener('click', () => {
    searchMovies(movieSearch.value);
});
// SEARCH USING ENTER KEY
movieSearch.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        searchMovies(movieSearch.value);
    }
});
// CLEAR SEARCH
clearButton.addEventListener('click', () => {
    movieSearch.value = '';
    document.getElementById('recommendationMessage').textContent = '';
    loadPopularMovies();
});
// RECOMMENDATION BUTTON EVENT
recommendButton.addEventListener('click', suggestMovies);
loadPopularMovies();
// CLEAR RECOMMENDATION
const clearRecommendationButton = document.getElementById('clearRecommendationButton');
clearRecommendationButton.addEventListener('click', () => {
    document.getElementById('recommendationGenre').value = '';
    document.getElementById('recommendationMessage').textContent = '';
    movieSearch.value = '';
    loadPopularMovies();
});