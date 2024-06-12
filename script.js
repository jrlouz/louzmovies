const apiKey = '0e8545e9721abba41cc893b9461ffbf3';

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        alert('Por favor, digite algo no campo de busca.');
        return;
    }
    searchMovies(query);
});

async function searchMovies(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=pt-BR`);
    const data = await response.json();
    if (data.results.length > 0) {
        displayMovieResults(data.results);
    } else {
        document.getElementById('movieDetails').innerHTML = 'Nenhum filme encontrado.';
    }
}

function displayMovieResults(movies) {
    let resultsHTML = '<h3>Resultados da Pesquisa</h3>';
    movies.forEach(movie => {
        resultsHTML += `
            <div class="movie-result" data-id="${movie.id}">
                <h4>${movie.title}</h4>
                <p>${movie.release_date}</p>
            </div>
        `;
    });
    document.getElementById('movieDetails').innerHTML = resultsHTML;

    document.querySelectorAll('.movie-result').forEach(movie => {
        movie.addEventListener('click', (event) => {
            const movieId = event.currentTarget.getAttribute('data-id');
            getMovieDetails(movieId);
            getMovieRecommendations(movieId);
        });
    });

    // Adiciona evento de clique para voltar à tela inicial
    const logo = document.querySelector('.logo');
    const title = document.querySelector('h1');

    logo.addEventListener('click', () => {
        location.reload();
    });

    title.addEventListener('click', () => {
        location.reload();
    });
}

async function getMovieDetails(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`);
    const data = await response.json();

    // Obtendo informações sobre elenco e equipe
    const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=pt-BR`);
    const creditsData = await creditsResponse.json();

    document.getElementById('movieDetails').innerHTML = `
        <div class="movie">
            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
            <div>
                <h2>${data.title}</h2>
                <p><strong>Sinopse:</strong> ${data.overview}</p>
                <p><strong>Diretor:</strong> ${getDirector(creditsData.crew)}</p>
                <p><strong>Elenco:</strong> ${getCast(creditsData.cast)}</p>
                <p><strong>Avaliação:</strong> ${data.vote_average}</p>
            </div>
        </div>
    `;
}

async function getMovieRecommendations(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=pt-BR`);
    const data = await response.json();
    
    let recommendationsHTML = '<h3>Recomendações</h3>';
    data.results.forEach(movie => {
        recommendationsHTML += `
            <div class="movie">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div>
                    <h4>${movie.title}</h4>
                    <p>${movie.overview}</p>
                </div>
            </div>
        `;
    });
    
    document.getElementById('movieRecommendations').innerHTML = recommendationsHTML;
}

function getDirector(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'Desconhecido';
}

function getCast(cast) {
    return cast.slice(0, 5).map(member => member.name).join(', ');
}
