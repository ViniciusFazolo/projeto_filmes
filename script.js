const apiKey = '54fb8db4'
const btnSubmit = document.querySelector(".submit")
const btnBackNext = document.querySelector(".btnBackNext")
const btnPreviousPage = document.querySelector(".previousPage")
const list = document.querySelector(".list")
const loading = document.querySelector(".loading")

//Variáveis de controle
let nPage = 1
let movieName
let isLoading = false; 
let tomatometer;
let imdb
// funções 
const getMovies = async (movieName) => {
  const promise = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${movieName}&page=${nPage}`)
  return promise.json()
}

const getSelectedMovie = async (itemClicked) => {
  const promise = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&t=${itemClicked}`)
  return promise.json()
}

const selectedMovieTemplateHTML = async (jsonSelectedMovie) => {
  const response = await jsonSelectedMovie;

  if (response.Ratings.length == 1) {
      imdb = response.Ratings[0].Value
      tomatometer = ""

  }else if(response.Ratings.length > 1) {
    imdb = response.Ratings[0].Value
    tomatometer = response.Ratings[0].Value
  }
  else{
    imdb = ""
    tomatometer = ""
  }

  
  const moviesTemplate = ({
    Runtime, Year, Rated, Title, Ratings, Plot, Writer, Genre, Director, Poster
  }) => 
    `
    <div class="info">
    <p class="back">&#x2B05</p>
    <div class="minAnoIdade">
        <span>${Runtime}</span>
        <span>&#x2022<span>
        <span>${Year}</span>
        <span>&#x2022<span>
        <span class="yearOld">${Rated}</span>
      </div>
      <h1 class="title">${Title}</h1>
      <div class="scores">
        <div class="imdb">
        <span>IMDb</span>
          <p>${imdb}</p>
          </div>
          <div class="tomatometer">
          <div><img src="../img/logo_rotten_tomatoes.5d990b86.svg"></div>
          <p>${tomatometer}</p>
          </div>
      </div>
      <div class="sinopse">
        <h2>Plot</h2>
        <p>${Plot}</p>
      </div>
      <div class="writers">
        <div class="cast">
          <h2>Cast</h2>
          <p>${Writer.split(',').join('<br>')}</p>
          </div>
          <div class="genre">
          <h2>Genre</h2>
          <p>${Genre.split(',').join('<br>')}</p>
        </div>
        <div class="director">
          <h2>Director</h2>
          <p>${Director.split(',').join('<br>')}</p>
        </div>
        </div>
        </div>  
    <div class="movieImage"> 
      <div class="image">
        <img src="${Poster}" alt="Movie Poster">
        </div>    
      </div>
      `;

    const template = moviesTemplate(response);

  return template;
};


const addSelectedMovieIntoDOM = () => {
  const containerSelectedMovie = document.querySelector(".containerSelectedMovie")
  const containerMovies = document.querySelector(".containerMovies")
  

  list.addEventListener("click", async (e) => { 
    const bannerTitle = e.target.closest(".bannerTitle");
    const image = e.target.closest(".img");
    setTimeout(()=>{
      loading.style.display = "none"
    }, 500)
    loading.style.display = "flex"
  
    let itemClicked;
    if (bannerTitle !== null) {
      itemClicked = bannerTitle.querySelector(".tituloDoFilme").textContent;
    } else if (image !== null) {
      itemClicked = image.parentElement.querySelector(".tituloDoFilme").textContent;
    } else {
      return;
    }
 
    jsonSelectedMovie = await getSelectedMovie(itemClicked)
    const HTMLTemplateSpecificMovie = await selectedMovieTemplateHTML(jsonSelectedMovie)  
    containerMovies.style.display = "none"
    containerSelectedMovie.style.display = "flex"
    containerSelectedMovie.innerHTML = HTMLTemplateSpecificMovie

    const tomatometerScore = document.querySelector(".scores .tomatometer")
    const imdbScore = document.querySelector(".scores .imdb")
    const score = document.querySelector(".scores")
    if(tomatometer === "" && imdb === ""){
      score.style.display = "none"
    }
    else{
      tomatometerScore.style.display = "none"
    }
    
    const btnReturnToMovieList = document.querySelector(".back")
    btnReturnToMovieList.addEventListener("click",() => {
        containerSelectedMovie.style.display = "none"
        containerMovies.style.display = "block"
      })
  })
}

const nextPage = async () => {
  if (isLoading) return; // Retorna se já estiver carregando
  
  isLoading = true; // Define o estado de carregamento como true
  nPage++;
  if(nPage > 1){
    btnPreviousPage.style.display = "block"
    btnBackNext.style.justifyContent = "space-between"
  }
  else{
    btnBackNext.style.justifyContent = "flex-end"
  }
  
  await addMoviesIntoDOM(movieName); // Aguarda a execução completa da função addMoviesIntoDOM
  
  isLoading = false; // Define o estado de carregamento como false
}

const previousPage = async () => {
  if (isLoading) return; // Retorna se já estiver carregando
  
  isLoading = true; // Define o estado de carregamento como true
  nPage--;
  if(nPage <= 1){
    nPage = 1
    btnPreviousPage.style.display = "none"
    btnBackNext.style.justifyContent = "flex-end"
  }

  await addMoviesIntoDOM(movieName); // Aguarda a execução completa da função addMoviesIntoDOM
  
  isLoading = false; // Define o estado de carregamento como false
}

const addMoviesIntoDOM = async (movieName) => {
  const btnNextPage = document.querySelector(".nextPage")
  
  const response = await getMovies(movieName)
  const movieSearch = response.Search
  
  if(movieSearch == undefined){
    nPage = 1
    list.innerHTML = `
      <h3>Filme não encontrado, tente novamente</h3>
      `
      list.style.justifyContent = "center";
      btnNextPage.style.display = "none"
      btnPreviousPage.style.display = "none"
      return
  } 
  
  list.innerHTML = ""
  const moviesTemplate = movieSearch.map(({ Poster, Title, Year,
  }) => `
  <div class="item">
  <div class="img">
    <img src="${Poster}">
    </div>
    <div class="bannerTitle">
      <h2 class="tituloDoFilme">${Title}</h2>
      <h2 id="h2Year">${Year}</h2>
      </div>
    </div>
    `).join("");
  list.innerHTML += moviesTemplate; 
  
  btnNextPage.style.display = "block"
  btnNextPage.addEventListener("click", ()=>{
    nextPage()
  })
  btnPreviousPage.addEventListener("click", ()=>{
    previousPage()
  })
  
  addSelectedMovieIntoDOM()
}

  // eventos
btnSubmit.addEventListener("click", event=>{
  event.preventDefault()

  btnPreviousPage.style.display = "none"
  btnBackNext.style.justifyContent = "flex-end"
  const input = document.querySelector("#search")
  nPage = 1
  movieName = input.value
  addMoviesIntoDOM(movieName)

})


