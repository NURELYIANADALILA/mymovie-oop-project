const TMDB_KEY = 'e546cf3340ebeb5fc1c56f1054e49fef';
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TMDB_KEY;
}

if (typeof window !== 'undefined') {
    window.TMDB_API_KEY = TMDB_KEY;
}