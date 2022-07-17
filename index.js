const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeCardMode = document.querySelector('#js-change-card-mode')
const changeListMode = document.querySelector('#js-change-list-mode')
const movies = []
let filteredMovies = []
let currentPage = 1
let currentMode = 'card'

// 函式
function renderMovieList(data, mode) {
  let rawHTML = ''
  currentMode = (typeof mode !== 'undefined') ? mode : 'card'

  console.log(mode)

  if (currentMode === 'card') {
    data.forEach((item) => {
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="${item.title}"/>
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
    
  } else {

    rawHTML += `<ul class="list-group col-12 mb-3">`
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item">
          <div class="row">
            <div class="col-12 col-md-6">
              <h5 class="u-mt-0 u-mb-3">${item.title}</h5>
            </div>
            <div class="col-12 col-md-6 text-end">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </li>
      `
    })
    rawHTML += `</ul>`
  }
  

  dataPanel.innerHTML = rawHTML
}


function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }

  // JSON.parse => 把string轉成object或array
  // JSON.stringify => 把object或array轉成string
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // const movie = movies.find(isMovieIdMatched)
  const movie = movies.find(movie => movie.id === id)

  // Array.some(val) => 回傳true或false告知在array是否有找到傳進去的值
  if (list.some((movie => movie.id === id))) {
    return alert('已收藏')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
}

function getMoviesByPage(page) {
  // movies ? "movies" : "filteredMovies"
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // ...
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      console.log(response.data.results)
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

function renderPaginator(amount) {
  // 80 / 12 = 6 .. 8
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) // Math.ceil(6....) -> 7
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML+= `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function onSearchFormSubmit (event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase()
  

  if (!keyword.length) {
    filteredMovies = []
    for (const movie of movies) {
      filteredMovies.push(movie)
    }

  } else {
    filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  }

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movie with keyword: ${keyword}`)
  }

  currentPage = 1

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage), currentMode)
}


function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage), currentMode)
}

axios
  .get(INDEX_URL)
  .then((response) => {
    // const moviesData = response.data.results
    // moviesData.forEach((movieData) => {
    //   movies.push(movieData)
    // })

    // 展開運算子
    movies.push(... response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage), currentMode)
    
  })
  .catch((err) => console.log(err))

dataPanel.addEventListener('click', onPanelClicked)
searchForm.addEventListener('submit', onSearchFormSubmit)
paginator.addEventListener('click', onPaginatorClicked)
changeCardMode.addEventListener('click', () => {
  renderMovieList(getMoviesByPage(currentPage),'card')
})
changeListMode.addEventListener('click', () => {
  renderMovieList(getMoviesByPage(currentPage), 'list')
})

/**
 * localStorage只能儲存字串
 * 如果想把物件存進去，可使用JSON.stringify()轉成字串存入
 */
// localStorage.setItem('default_language', 'english')
// localStorage.getItem('default_language')
// localStorage.removeItem('default_language')