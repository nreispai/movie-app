// API Key
const API_KEY = "f41d6da4527abd7b45eca52cb2213fd0";
// Register your key at https://www.themoviedb.org/settings/api and enter above
// Only use this for very small projects. You should store your key and make requests from a server

// Contains global properties
const global = {
  currentPage: window.location.pathname, // Current page's pathname
};

// Fetches data from TMDB API
async function fetchAPIData(endpoint) {
  const API_URL = "https://api.themoviedb.org/3"; // Base URL

  // Show spinner
  showSpinner();

  // Fetch data from API
  const response = await fetch(
    `${API_URL}/${endpoint}?api_key=${API_KEY}&language=en-US`
  );
  // Parse response as JSON
  const data = await response.json();
  console.log(response.status);

  // Hide spinner
  setTimeout(() => {
    hideSpinner();
  }, 300);

  return data;
}

// Show spinner function
function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

// Hide spinner function
function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

// Highlights the active navigation link based on the current page
function highlightActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active"); // Add active class to the current page link
    }
  });
}

// Initializes the script based on the current page
function init() {
  // Decide which function to run based on the current page
  switch (global.currentPage) {
    case "/":
      displayMedia("movie");
      displaySlidder();
      break;
    case "./shows.html":
      displayMedia("tv");
      break;
    case "./movie-details.html":
      showDetails("movie");
      break;
    case "./tv-details.html":
      showDetails("tv");
      break;
  }
  // Highlight the current page link
  highlightActiveLink();
}

// Call the init function after the script is loaded
init();

// Fetches and displays top-rated media
async function displayMedia(type) {
  const popularMedia = await fetchAPIData(`${type}/top_rated`);
  const mediaGrid = document.querySelector(`#popular-${type}s`);

  popularMedia.results.forEach((media) => {
    const title = type === "movie" ? media.title : media.name;
    const date = type === "movie" ? media.release_date : media.first_air_date;

    const cardMedia = document.createElement("div");
    cardMedia.setAttribute("data-set", media.id);
    cardMedia.className = "card";
    cardMedia.innerHTML = constructCardMedia(
      `/movie-app/${type}-details.html?id=${media.id}`,
      media.poster_path,
      title,
      date
    );

    mediaGrid.appendChild(cardMedia);
  });
}

// Constructs the innerHTML for a media card
function constructCardMedia(detailsUrl, posterPath, title, releaseDate) {
  return `<a href="${detailsUrl}">
  ${
    posterPath
      ? `<img
                  src="https://image.tmdb.org/t/p/w500/${posterPath}"
                  class="card-img-top"
                  alt="${title}"
                />`
      : `<img
                  src="/movie-app/images/no-image.jpg"
                  class="card-img-top"
                  alt="${title}"
                />`
  }
              </a>
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">
                  <small class="text-muted">Release: ${releaseDate}</small>
                </p>
              </div>`;
}

// Fetches and constructs media details
async function showDetails(type) {
  let params = new URL(document.location).searchParams;
  let id = params.get("id");

  const details = await fetchAPIData(`${type}/${id}`);
  console.log(details);

  let companies = "";
  details.production_companies.forEach((company) => {
    companies = `${company.name}, ` + companies;
  });
  companies = companies.substring(0, companies.length - 2);

  const additionalDetails =
    type === "movie"
      ? {
          budget: details.budget,
          revenue: details.revenue,
          runtime: details.runtime,
        }
      : {
          number_of_episodes: details.number_of_episodes,
          last_episode_to_air: details.last_episode_to_air.name,
        };

  const genre = details.genres[0].name;

  const title = type === "movie" ? details.title : details.name;
  const date = type === "movie" ? details.release_date : details.first_air_date;

  constructDetails(
    type,
    details.poster_path,
    title,
    date,
    details.overview,
    details.vote_average,
    additionalDetails,
    details.status,
    companies,
    genre,
    details.homepage,
    details.backdrop_path
  );
}

// Constructs and appends the details of a media
function constructDetails(
  type,
  imgSrc,
  title,
  releasedData,
  overview,
  vote_average,
  additionalDetails,
  status,
  companies,
  genre,
  homepage,
  backdrop_path
) {
  const section = document.querySelector("section");
  const div = document.createElement("div");
  div.className = `${type}-details`;

  div.innerHTML = constructHTMLDetails(
    imgSrc,
    title,
    releasedData,
    overview,
    vote_average,
    additionalDetails,
    status,
    companies,
    genre,
    homepage
  );

  section.appendChild(div);
  console.log(document.querySelector(".movie-details"));
  displayBackgroundImage(type, backdrop_path);
}

// Constructs the innerHTML for the details of a media
function constructHTMLDetails(
  imgSrc,
  title,
  releasedData,
  overview,
  vote_average,
  additionalDetails,
  status,
  companies,
  genre,
  homepage
) {
  let additionalInfo = "";
  for (const [key, value] of Object.entries(additionalDetails)) {
    let formattedValue;
    if (key === "budget" || key === "revenue") {
      formattedValue = USDollar.format(value);
    } else {
      formattedValue = value;
    }
    additionalInfo += `<li><span class="text-secondary">${key}:</span> ${formattedValue}</li>`;
  }

  return `<div class="details-top">
      <div>
        <img
          src="https://image.tmdb.org/t/p/w500/${imgSrc}"
          class="card-img-top"
          alt="${title}"
        />
      </div>
      <div>
        <h2>${title}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${vote_average} / 10
        </p>
        <p class="text-muted">Release Date: ${releasedData}</p>
        <p>${overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          <li>${genre}</li>
        </ul>
        <a href="${homepage}" target="_blank" class="btn">Visit Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
      <h2>${title} Info</h2>
      <ul>
        ${additionalInfo}
        <li><span class="text-secondary">Status:</span> ${status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">${companies}</div>
    </div>`;
}

// Display backdrop on details page
function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");

  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backgroundPath})`;
  console.log(`url(https://image.tmdb.org/t/p/original${backgroundPath})`);
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector(".movie-details").appendChild(overlayDiv);
  } else {
    document.querySelector(".tv-details").appendChild(overlayDiv);
  }
}

// Display slidder movies
async function displaySlidder() {
  const obj = await fetchAPIData("movie/now_playing");
  obj.results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `<a href="movie-details.html?id=${result.id}">
    <img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title}" />
  </a>
  <h4 class="swiper-rating">
    <i class="fas fa-star text-secondary"></i> ${result.vote_average} / 10
  </h4>`;
    document.querySelector(".swiper-wrapper").appendChild(div);
    initSwiper();
  });
}

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

// Utility for formatting USD values
let USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});
