const watchlistResults = document.getElementById('watchlistResults');
const watchlistMessage = document.getElementById('watchlistMessage');
// READ MOVIE FROM LOCAL STORAGE
function getWatchlist() {
    return JSON.parse(localStorage.getItem('myWatchlist')) || [];
}
// DISPLAY WATCHLIST MOVIES
function displayWatchlist() {
    const watchlist = getWatchlist();
    watchlistResults.innerHTML = '';
    watchlist.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const poster = document.createElement('img');
        if (movie.Poster && movie.Poster !== 'N/A') {
            poster.src = movie.Poster;
        }
        poster.alt = movie.Title;
        const title = document.createElement('h3');
        title.textContent = movie.Title;
        const year = document.createElement('p');
        year.textContent = `Year: ${movie.Year}`;
        const status = document.createElement('p');
        status.textContent = `Status: ${movie.status}`;
        // UPDATE STATUS BUTTON
        const updateButton = document.createElement('button');
        updateButton.textContent = movie.status === 'Watched' ? 'Update to not watched' : 'Update to watch';
        updateButton.addEventListener('click', () => {updateMovieStatus(index);});
        // DELETE BUTTON
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove from list';
        deleteButton.addEventListener('click', () => {deleteMovie(index);});
        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(year);
        card.appendChild(status);
        card.appendChild(updateButton);
        card.appendChild(deleteButton);
        watchlistResults.appendChild(card);
    });
    updateStatistics(watchlist);
    if (watchlist.length === 0) {
        watchlistMessage.textContent ='The watchlist is currently empty.';
    } else {
        watchlistMessage.textContent =`${watchlist.length} movies in the watchlist.`;
    }
}
// UPDATE MOVIE STATUS
function updateMovieStatus(index) {
    let watchlist = getWatchlist();
    const movie = watchlist[index];
    if (movie.status === 'Watched') {
        movie.status = 'Not Watched';
        alert('This movie moved back to unwatched list');
    } else {
        movie.status = 'Watched';
        alert('Congrats! You have successfully finished this movie!');
    }
    localStorage.setItem('myWatchlist',JSON.stringify(watchlist));
    displayWatchlist();
}
// DELETE MOVIE
function deleteMovie(index) {
    let watchlist = getWatchlist();
    const confirmDelete = confirm('Are you sure you want to delete this movie?');
    if (confirmDelete) {
        watchlist.splice(index, 1);
        localStorage.setItem('myWatchlist',JSON.stringify(watchlist));
        displayWatchlist();
        alert('Movie successfully removed from your watchlist!');
    }
}
// CALCULATION 
function updateStatistics(watchlist) {
    const total = watchlist.length; //CALCULATE TOTAL MOVIE IN WATCH LIST
    const watched = watchlist.filter(movie => movie.status === 'Watched').length; //CALCULATE WATCHED MOVIES IN WATCH LIST
    const notWatched = total - watched; //CALCULATE UNWATCH MOVIE IN WATCH LIST
    let completionRate = 0; //CALCULATE THE PERCENTAGE OF COMPLETION 
    if (total > 0) {
        completionRate = (watched / total) * 100;
    }
    //CALCULATION RESULT DISPLAY
    document.getElementById('totalMovies').textContent = total;
    document.getElementById('watchedMovies').textContent = watched;
    document.getElementById('unwatchedMovies').textContent = notWatched;
    document.getElementById('completionRate').textContent = completionRate.toFixed(1) + '%';
}
// LOAD WATCH LIST
displayWatchlist();