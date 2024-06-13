const apiKey = '0e8545e9721abba41cc893b9461ffbf3';

document.getElementById('searchButton').addEventListener('click', () => {
    searchMovies(document.getElementById('searchInput').value);
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies(e.target.value);
    }
});

document.getElementById('loginButton').addEventListener('click', () => {
    login();
});

document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});

document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});

function searchMovies(query) {
    if (!query) {
        alert('Por favor, digite algo no campo de busca.');
        return;
    }
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=pt-BR`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                displayMovieResults(data.results);
            } else {
                document.getElementById('movieDetails').innerHTML = 'Nenhum filme encontrado.';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filmes:', error);
            document.getElementById('movieDetails').innerHTML = 'Erro ao buscar filmes. Por favor, tente novamente mais tarde.';
        });
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
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`);
        const data = await response.json();

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
                    <button onclick="saveFavoriteMovie(${movieId})">Salvar como Favorito</button>
                    <button onclick="deleteFavoriteMovie(${movieId})">Remover dos Favoritos</button>
                </div>
            </div>
        `;

        await getMovieVideos(movieId); // Aguarda o carregamento dos vídeos do filme
        await getMovieRecommendations(movieId); // Aguarda o carregamento das recomendações
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
        document.getElementById('movieDetails').innerHTML = 'Erro ao buscar detalhes do filme. Por favor, tente novamente mais tarde.';
    }
}

async function getMovieRecommendations(movieId) {
    try {
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
                        <button onclick="getMovieDetails(${movie.id}); scrollToTop()">Ver Detalhes</button>
                        <button onclick="saveFavoriteMovie(${movie.id})">★</button>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('movieRecommendations').innerHTML = recommendationsHTML;
    } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        document.getElementById('movieRecommendations').innerHTML = 'Erro ao buscar recomendações. Por favor, tente novamente mais tarde.';
    }
}

async function getMovieVideos(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=pt-BR`);
        const data = await response.json();

        // Filtrar apenas os trailers
        const trailers = data.results.filter(video => video.type === 'Trailer');

        if (trailers.length > 0) {
            const trailerKey = trailers[0].key; // Pega o primeiro trailer
            const trailerHTML = `
                <div class="trailer">
                    <iframe width="100%" height="500" src="https://www.youtube.com/embed/${trailerKey}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
            document.getElementById('movieDetails').insertAdjacentHTML('beforeend', trailerHTML);
        } else {
            document.getElementById('movieDetails').insertAdjacentHTML('beforeend', '<p>Nenhum trailer disponível.</p>');
        }
    } catch (error) {
        console.error('Erro ao buscar vídeos do filme:', error);
        document.getElementById('movieDetails').insertAdjacentHTML('beforeend', '<p>Erro ao carregar trailer. Por favor, tente novamente mais tarde.</p>');
    }
}

function getDirector(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'Desconhecido';
}

function getCast(cast) {
    return cast.slice(0, 5).map(member => member.name).join(', ');
}

async function saveFavoriteMovie(movieId) {
    try {
        const movieData = await getMovieDetailsForFavorites(movieId); // Função para obter dados necessários para favoritos
        const response = await fetch('https://api.seuservidor.com/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });
        const data = await response.json();
        alert('Filme salvo como favorito!');
    } catch (error) {
        console.error('Erro ao salvar filme como favorito:', error);
        alert('Erro ao salvar filme como favorito. Por favor, tente novamente mais tarde.');
    }
}

async function deleteFavoriteMovie(movieId) {
    try {
        const response = await fetch(`https://api.seuservidor.com/favorites/${movieId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        alert('Filme removido dos favoritos!');
    } catch (error) {
        console.error('Erro ao remover filme dos favoritos:', error);
        alert('Erro ao remover filme dos favoritos. Por favor, tente novamente mais tarde.');
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, preencha usuário e senha para fazer login.');
        return;
    }

    // Simulação de login (não levará a lugar nenhum por enquanto)
    alert('Login realizado com sucesso!');
}

window.addEventListener('scroll', () => {
    const menu = document.querySelector('.menu');
    if (window.scrollY > 50) {
        menu.classList.add('scrolled');
    } else {
        menu.classList.remove('scrolled');
    }
});

// Função para rolar a página até o topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
