/*
 * Author: Melinda Sowole
 * Date: 11/12/2023
 * Description: (excessive, make shorter)
 * 		Miniproject created as part of the
 * 		Javascript 1 course at Grit Academy Fall23.
 *
 * 		Application uses REST Countries API to let users search
 * 		for countries using name or language.
 *
 * 		Required functionalities:
 * 		- Display country info:
 * 			- official name, subregion, capital, population, flag
 * 		- Fetch only specified fields from API
 * 		- Sort results in descending order based on population
 * 		- Basic error handling
 *
 */

// Initialization
updateSearchInputLabelText();

// Event Listeners
const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);

const lightButton = document.querySelector(".toggle-light-mode");
lightButton.addEventListener("click", toggleLightMode);

const radios = document.querySelectorAll("input[type='radio']");
radios.forEach((radio) => {
	radio.addEventListener("click", updateSearchInputLabelText);
});

// Functions
function updateSearchInputLabelText() {
	const labelString = document.querySelector(
		`label[for='${getCheckedRadioDOM().id}']`
	).textContent;

	const inputLabel = document.querySelector(".search-label");
	inputLabel.textContent = `Search by ${labelString} :`;
}

function handleSubmit(event) {
	event.preventDefault();
	clearResults();

	getCountries()
		.then((countries) => {
			setResultMessage(
				`${countries.length} result${countries.length > 1 ? "s" : ""}:`
			);

			displayCountries(sortArrayDesc(countries, "population"));
		})
		.catch(displayErrorMessage);
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
	const searchInput = document.querySelector("#search");
	return searchInput.value;
}

function getCheckedRadioDOM() {
	return document.querySelector(":checked");
}

// - API search url functions, returns full API url
function getCountriesSearchURL() {
	const endpoint = getCheckedRadioDOM().value;
	const query = getInputString();

	const baseURL = `https://restcountries.com/v3.1/${endpoint}/${query}`;
	const fields =
		"?fields=name,capital,languages,subregion,population,flags,capitalInfo,demonyms";

	return baseURL + fields;
}

function getWeatherSearchURL([lat, long]) {
	const APIKey = `&appid=23504d3733698e142ae5804cbaacd5d2`;
	const baseURL = `https://api.openweathermap.org/data/2.5/weather?`;

	console.log(baseURL + `lat=${lat}&lon=${long}` + APIKey);

	return baseURL + `lat=${lat}&lon=${long}` + APIKey;
}

function getPictureSearchURL(place) {
	const APIKey = `key=41126575-5a60f8132b12eefacd83f4585`;
	const baseURL = `https://pixabay.com/api/?`;

	const defualtQueries =
		"&image_type=photo&orientation=horizontal&safesearch=true&order=popular&per_page=3";

	return baseURL + APIKey + defualtQueries + `&q=${place}`;
}

// - Communication functions, DOM manipulation
function setResultMessage(message) {
	document.querySelector(".result-message").textContent = message;
}

function displayErrorMessage(err) {
	let message =
		err.status == 404
			? "No results"
			: "There was an error, please try again later!";

	setResultMessage(message);
}

function unsetResultMessage() {
	document.querySelector(".result-message").textContent = "";
}

function displayCountries(countries) {
	const resultsContainer = document.querySelector(".search-result");
	countries.forEach((country) => {
		resultsContainer.append(getCountryDOM(country, true));
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

	// only add eventlistener when specified
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

function clearResults() {
	document.querySelector(".search-result").innerHTML = "";
}

// toggles between dark and light mode
function toggleLightMode() {
	const darkMode = document.querySelector(".dark-mode");

	if (darkMode) {
		//turn off dark mode
		document.body.classList.remove("dark-mode");
		lightButton.textContent = "dark mode";
	} else {
		document.body.classList.add("dark-mode");
		lightButton.textContent = "light mode";
	}
}
