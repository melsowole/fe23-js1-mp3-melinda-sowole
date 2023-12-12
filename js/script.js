/*
 * Author: Melinda Sowole
 * Date: 11/12/2023
 * Description:
 * 		This was a graded Miniproject created as part of the
 * 		Javascript 1 course at Grit Academy Fall23.
 * 		The goal was using the REST Countries API to create
 * 		and application in which users can search for countries
 * 		using either country name or language as a search query.
 * 		Required functionalities included:
 * 		- Display country info:
 * 			- official name, subregion, capital, population, flag
 * 		- Fetch only specified fields from API
 * 		- Sort results in descending order based on population
 * 		- Error handling:
 * 			- Display server and network errors
 * 			- Display result errors (e.g. 404)
 *
 */

// DOM Elements
const formDOM = document.querySelector("form");
const searchInputLabelDOM = document.querySelector(".search-label");
const searchInputDOM = document.querySelector("#search");
const radiosDOM = document.querySelectorAll("input[type='radio']");
const lightButtonDOM = document.querySelector(".toggle-light-mode");
const searchResultDOM = document.querySelector(".search-result");
const resultMessageDOM = document.querySelector(".result-message");

// API URLs and Keys
const countriesBaseURL = `https://restcountries.com/v3.1/`;
const countriesFields =
	"name,capital,languages,subregion,population,flags,capitalInfo,demonyms";
//call example: `${countriesBaseURL}["name"||"lang"]/[QUERY]?fields=${countriedFields}`

const weatherAPIKey = `23504d3733698e142ae5804cbaacd5d2`;
const weatherBaseURL = `https://api.openweathermap.org/data/2.5/weather?`;
// call example: `${weatherBaseURL}lat=${latitude}&lon=${longitude}${weatherAPIKey}`

const pixabayAPIKey = `41126575-5a60f8132b12eefacd83f4585`;
const pixabayBaseURL = `https://pixabay.com/api/?`;

// Initialization
updateSearchInputLabelText();

// Event Listeners
radiosDOM.forEach((radioDOM) => {
	radioDOM.addEventListener("click", updateSearchInputLabelText);
});

formDOM.addEventListener("submit", (event) => {
	event.preventDefault();

	getCountries()
		.then((countries) => {
			setResultMessage(
				`${countries.length} result${countries.length > 1 ? "s" : ""}:`
			);

			displayCountries(sortArrayDesc(countries, "population"));
		})
		.catch(displayErrorMessage);
});

lightButtonDOM.addEventListener("click", toggleLightMode);

// Functions
function updateSearchInputLabelText() {
	const labelString = document.querySelector(
		`label[for='${getCheckedRadioDOM().id}']`
	).textContent;

	searchInputLabelDOM.textContent = `Search by ${labelString} :`;
}

// - API fetches
// -- weatherAPI
async function displayCurrentWeather([lat, long], parent) {
	const response = await fetch(getWeatherSearchURL([lat, long]));
	const data = await response.json();

	console.log(data);

	const description = data.weather[0].description;
	const tempC = kelvinToCelsius(data.main.temp);

	let text = `${data.weather[0].description} and ${tempC}°C!`;
	text = text[0].toUpperCase() + text.slice(1);

	parent.append(text);
}

// -- pixabay
async function getImageObj(query) {
	const response = await fetch(getPictureSearchURL(query));
	const data = await response.json();

	return data.hits[0];
}

function displayCountryModal(country) {
	const modalDOM = createElement("div");
	modalDOM.classList.add("modal");
	document.body.append(modalDOM);

	console.log(country);

	const cardDOM = getCountryDOM(country);
	modalDOM.append(cardDOM);

	const closeButtonDOM = createElement("button");
	closeButtonDOM.textContent = "Close";
	cardDOM.prepend(closeButtonDOM);

	const countryNameDOM = cardDOM.querySelector(".country-name");
	countryNameDOM.textContent = country.name.official;

	const capitalImageDOM = createElement("img");
	countryNameDOM.before(capitalImageDOM);
	setCapitalImageUrl(country.capital, capitalImageDOM);

	// Alt names section
	const altNamesSectionDOM = createElement("section");
	cardDOM.append(altNamesSectionDOM);
	const altNamesTitleDOM = createElement("h4");
	altNamesSectionDOM.append(altNamesTitleDOM);
	altNamesTitleDOM.textContent = `"${country.name.common}" to the ${country.demonyms.eng.f}`;

	for (const lang in country.name.nativeName) {
		if (lang == "eng") {
			// if only language is english, remove section
			altNamesSectionDOM.remove();
			continue;
		}

		const nameAlt = createElement("p");
		const language = country.languages[lang];
		const nativeLangAlt = country.name.nativeName[lang].official;
		nameAlt.textContent = `${nativeLangAlt} (${language})`;
		altNamesSectionDOM.append(nameAlt);
	}

	// Weather Section
	const weatherSectionDOM = createElement("section");
	cardDOM.append(weatherSectionDOM);
	const weatherTitleDOM = createElement("h4");
	weatherSectionDOM.append(weatherTitleDOM);
	weatherTitleDOM.textContent = `Current Weather in ${country.capital}, ${country.name.common}`;
	displayCurrentWeather(country.capitalInfo.latlng, weatherSectionDOM);

	// deactivate scroll
	document.body.classList.add("no-scroll");

	// Event listeners ---
	modalDOM.addEventListener("click", closeModal);
	closeButtonDOM.addEventListener("click", closeModal);

	// prevent modal from closing when clicking card
	cardDOM.addEventListener("click", (e) => e.stopPropagation());

	// Functions ---
	function closeModal() {
		modalDOM.remove();
		document.body.classList.remove("no-scroll");
	}
}

// -- restCountries
async function getCountries() {
	console.log("searching...");
	searchResultDOM.innerHTML = "";

	const response = await fetch(getCountriesSearchURL());

	if (response.ok) {
		const countries = await response.json();
		return countries;
	} else {
		throw response;
	}
}

// - Helper Functions
function createElement(type, className) {
	const elementDOM = document.createElement(type);
	if (className) elementDOM.classList.add(className);
	return elementDOM;
}

function kelvinToCelsius(K) {
	return (K - 273.15).toFixed(2);
}

function sortArrayDesc(array, key) {
	return array.sort((x, y) => x[key] < y[key]);
}

// -- Get info
function getInputString() {
	return searchInputDOM.value;
}

function getCheckedRadioDOM() {
	return document.querySelector(":checked");
}

// - API search url functions, returns full API url
function getCountriesSearchURL() {
	const endpoint = getCheckedRadioDOM().value;
	const query = getInputString();
	return `${countriesBaseURL}${endpoint}/${query}?fields=${countriesFields}`;
}

function getWeatherSearchURL([lat, long]) {
	return `${weatherBaseURL}&lat=${lat}&lon=${long}&appid=${weatherAPIKey}`;
}

function getPictureSearchURL(place) {
	const defualtQueries =
		"&image_type=photo&orientation=horizontal&safesearch=true&order=popular&per_page=3";
	return `${pixabayBaseURL}key=${pixabayAPIKey}${defualtQueries}&q=${place}`;
}

// - Communication functions, DOM manipulation
function setResultMessage(message) {
	resultMessageDOM.textContent = message;
}

function displayErrorMessage(err) {
	let message =
		err.status == 404
			? "No results"
			: "There was an error, please try again later!";

	setResultMessage(message);
}

function unsetResultMessage() {
	resultMessageDOM.textContent = "";
}

function displayCountries(countries) {
	countries.forEach((country) => {
		searchResultDOM.append(getCountryDOM(country, true));
	});
}

function getCountryDOM(country, click) {
	const countryDOM = createElement("article");

	const flagDOM = createElement("img");
	flagDOM.src = country.flags.png;

	const nameDOM = createElement("h3", "country-name");
	nameDOM.textContent = country.name.common;

	countryDOM.append(flagDOM, nameDOM);

	const keys = ["capital", "subregion", "population"];

	keys.forEach((key) => {
		const elementDOM = createElement("p");

		const keyCapitalized = key[0].toUpperCase() + key.slice(1);

		elementDOM.textContent = keyCapitalized + " : " + country[key];
		countryDOM.append(elementDOM);
	});

	// only add eventlistened when specified
	if (click) {
		countryDOM.addEventListener("click", () => {
			displayCountryModal(country);
		});
	}

	return countryDOM;
}

async function setCapitalImageUrl(capitalName, imgDOM) {
	const imgObj = await getImageObj(capitalName);

	if (imgObj) {
		imgDOM.src = imgObj.webformatURL;
	} else {
		imgDOM.remove();
	}
}

// toggles between dark and light mode
function toggleLightMode() {
	const darkMode = document.querySelector(".dark-mode");

	if (darkMode) {
		//turn off dark mode
		document.body.classList.remove("dark-mode");
		lightButtonDOM.textContent = "dark mode";
	} else {
		document.body.classList.add("dark-mode");
		lightButtonDOM.textContent = "light mode";
	}
}
