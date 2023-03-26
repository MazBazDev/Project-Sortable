let search = "";
let currentPage = 1;
let itemsPerPage = 20;
let searchType = "inc";
let searchField = "name";
let selectedHero = null;

const table = document.querySelector("tbody");
const paginationDiv = document.getElementById("pagination");
// Event listeners
const filters = document.querySelectorAll("[data-sort-by]");

const searchBar = document.querySelector("#search");

searchBar.addEventListener("input", (envent) => {
	search = searchBar.value.toLowerCase();
	loadDatas();
});

const field = document.getElementById("fields");

field.addEventListener("change", () => {
	searchField = field.value;
	loadDatas();
});

const inputType = document.getElementById("inputType");

inputType.addEventListener("change", () => {
	searchType = inputType.value;
	loadDatas();
});

const select = document.querySelector("#pageSize");

select.addEventListener("change", function () {
	const itemsPerPageType = {
		10: 10,
		20: 20,
		50: 50,
		100: 100,
		all: -1,
	};

	const value = select.value;

	itemsPerPage = value in itemsPerPageType ? itemsPerPageType[value] : 20;

	loadDatas();
});

const urlParams = new URLSearchParams(window.location.search);

// Vérifie si l'URL contient un paramètre "search"
if (urlParams.has("search")) {
	search = urlParams.get("search");
	searchBar.value = search;
}

if (urlParams.has("currentPage")) {
	currentPage = parseInt(urlParams.get("currentPage"));
}

if (urlParams.has("itemsPerPage")) {
	let param = urlParams.get("itemsPerPage")
	itemsPerPage = param == "all" ? -1: Number.parseInt(param);
	select.value = param == "all" ? "all": Number.parseInt(param);
}
if (urlParams.has("searchType")) {
	searchType = urlParams.get("searchType");
	inputType.value = searchType;
}	

if (urlParams.has("searchField")) {
	searchField = urlParams.get("searchField");
	field.value = searchField
}

if (urlParams.has("selectedHero")) {
	selectedHero = parseInt(urlParams.get("selectedHero"));
}

const updateUrl = () => {
	urlParams.set('search', search);
	urlParams.set('currentPage', currentPage);
	urlParams.set('itemsPerPage', itemsPerPage == -1 ? "all" : itemsPerPage);
	urlParams.set('searchType', searchType);
	urlParams.set('searchField', searchField);
	urlParams.set('selectedHero', selectedHero);
	const newUrl = window.location.pathname + '?' + urlParams.toString();
	window.history.pushState({ path: newUrl }, '', newUrl);
}

filters.forEach((element) => {
	if (urlParams.has(element.getAttribute("data-sort-by"))) {
		let param = urlParams.get(element.getAttribute("data-sort-by")).split("-");
		element.setAttribute("data-sort", param[0]);
		element.setAttribute("data-status", param[1]);
	}

	element.addEventListener("click", () => {
		if (element.getAttribute("data-sort") == "true") {
			if (element.getAttribute("data-status") == "ascending") {
				element.setAttribute("data-status", "descending");
			} else {
				element.setAttribute("data-status", "ascending");
			}
		} else {
			filters.forEach((other) => {
				if (other !== element) {

					other.setAttribute("data-sort", false);
					element.setAttribute("data-status", "ascending");
					urlParams.set(other.getAttribute("data-sort-by"), other.getAttribute("data-sort")+"-"+ other.getAttribute("data-status"));

				}
			});
			element.setAttribute("data-sort", true);
			element.setAttribute("data-status", "descending");
		}
		urlParams.set(element.getAttribute("data-sort-by"), element.getAttribute("data-sort")+"-"+ element.getAttribute("data-status"));
		updateUrl()

		loadDatas();
	});
});

function changePage(page) {
	currentPage = page;
	loadDatas();
}

const displayDatas = (heros) => {
	updateUrl()

	heros = Sort(heros);

	table.innerHTML = "";

	if (itemsPerPage == -1) {
		itemsPerPage = heros.length;
	}
	// Détermine l'index du premier et du dernier élément à afficher sur la page
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	// Génère les boutons de pagination
	const pageCount = Math.ceil(heros.length / itemsPerPage);
	const pageButtons = [];

	// Ajoute le bouton "previous" s'il y a une page précédente
	if (currentPage > 1) {
		pageButtons.push(
			`<button onclick="changePage(${currentPage - 1})">Previous</button>`
		);
	}

	for (let i = 1; i <= pageCount; i++) {
		pageButtons.push(
			`<button ${
				i === currentPage ? "disabled" : ""
			} onclick="changePage(${i})">${i}</button>`
		);
	}

	// Ajoute le bouton "next" s'il y a une page suivante
	if (currentPage < pageCount) {
		pageButtons.push(
			`<button onclick="changePage(${currentPage + 1})">Next</button>`
		);
	}

	// Affiche les boutons de pagination
	paginationDiv.innerHTML = pageButtons.join("");

	heros.slice(startIndex, endIndex).forEach((element) => {
		addLine(
			element.images.xs,
			element.name,
			element.biography.fullName,
			element.powerstats,
			element.appearance.race,
			element.appearance.gender,
			element.appearance.height,
			element.appearance.weight,
			element.biography.placeOfBirth,
			element.biography.alignment,
			element
		);

		if (selectedHero && element.id == selectedHero) {
			setModalDatas(element)
		}
	});
};

const loadDatas = () => {
	fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
		.then((response) => response.json()) // parse the response from JSON
		.then(displayDatas);
};

function addLine(...params) {
	var nouvelleLigne = table.insertRow(-1);
	for (let index = 0; index < params.length - 1; index++) {
		const param = params[index];
		if (typeof param === "object" && param !== null) {
			let objectValue = "";
			for (const key in param) {
				let value = "";

				if (isNaN(Number.parseInt(key))) {
					value = capitalizeFirstLetter(key) + ":";
				}

				objectValue += `${value} ${param[key]} <br>`;
			}
			nouvelleLigne.insertCell(index).innerHTML = objectValue;
		} else {
			if (index == 0) {
				nouvelleLigne.insertCell(index).innerHTML = `<img src="${param}">`;
			} else {
				nouvelleLigne.insertCell(index).innerHTML = param;
			}
		}
	}


	nouvelleLigne.insertCell(-1).innerHTML = `<a class="button" href="#popup" data-id="${params[params.length - 1].id}"><i class="bi bi-eye"></i></a>`;

	document.querySelector(`[data-id="${params[params.length - 1].id}"]`)
		.addEventListener("click", () => {
			setModalDatas(params[params.length - 1]);
		});
}

function Sort(heros) {
	const filter = document.querySelector("[data-sort='true']");
	if (filter != null) {
		const status = filter.getAttribute("data-status");
		switch (filter.getAttribute("data-sort-by")) {
			case "name":
				heros.sort(
					status == "ascending" ? compareByName : (a, b) => compareByName(b, a)
				);
				break;
			case "fullName":
				let [good, bad] = FilterFullName(heros);
				good.sort(compareByFullName);

				if (status != "ascending") {
					good.reverse();
				}

				heros = good.concat(bad);

				break;
			case "powerstats":
				heros.sort(
					(a, b) => convertPower(a.powerstats) - convertPower(b.powerstats)
				);

				if (status != "ascending") {
					heros.reverse();
				}
				break;
			case "race":
				let [goodRace, badRace] = FilterRace(heros);
				goodRace.sort(compareByRace);

				if (status != "ascending") {
					goodRace.reverse();
				}

				heros = goodRace.concat(badRace);

				break;
			case "gender":
				let [goodPower, badpower] = FilterGender(heros);

				goodPower.sort(compareByGender);

				if (status != "ascending") {
					goodPower.reverse();
				}
				heros = goodPower.concat(badpower);

				break;
			case "height":
				heros.sort(
					(a, b) =>
						convertHeigth(a.appearance.height[1]) -
						convertHeigth(b.appearance.height[1])
				);

				if (status != "ascending") {
					heros.reverse();
				}
				break;
			case "weight":
				heros.sort(
					(a, b) =>
						convertWeight(a.appearance.weight[1]) -
						convertWeight(b.appearance.weight[1])
				);

				if (status != "ascending") {
					heros.reverse();
				}

				break;
			case "placeOfBirth":
				let [goodPlace, badPlace] = FilterPlaceOfBirth(heros);
				goodPlace.sort(comparePlaceOfBirth);

				if (status != "ascending") {
					goodPlace.reverse();
				}

				heros = goodPlace.concat(badPlace);
				break;
			case "alignment":
				let [goodAlignment, badAlignment] = FilterAlignment(heros);

				goodAlignment.sort(compareByAlignment);

				if (status != "ascending") {
					goodAlignment.reverse();
				}
				heros = goodAlignment.concat(badAlignment);

				break;
		}
	} else {
		heros.sort(compareByName);
	}

	if (search.length > 0) {
		heros = filterheros(heros);
	}

	return heros;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function compareByName(a, b) {
	return a.name.localeCompare(b.name, { sensitivity: "base" });
}

function compareByFullName(a, b) {
	return a.biography.fullName.localeCompare(b.biography.fullName, {
		sensitivity: "base",
	});
}

function FilterFullName(heros) {
	const hasFullName = (hero) => hero.biography.fullName.length > 0;
	return [
		heros.filter(hasFullName),
		heros.filter((hero) => !hasFullName(hero)),
	];
}

function compareByGender(a, b) {
	const genderOrder = { Male: 0, Female: 1 };
	return genderOrder[a.appearance.gender] - genderOrder[b.appearance.gender];
}
function FilterGender(heros) {
	const hasGender = (hero) => hero.appearance.gender.length > 0;
	return [heros.filter(hasGender), heros.filter((hero) => !hasGender(hero))];
}

function compareByRace(a, b) {
	return a.appearance.race.localeCompare(b.appearance.race, {
		sensitivity: "base",
	});
}

function FilterRace(heros) {
	const hasRace = (hero) => hero.appearance.race;
	return [heros.filter(hasRace), heros.filter((hero) => !hasRace(hero))];
}

function comparePlaceOfBirth(a, b) {
	return a.biography.placeOfBirth.localeCompare(b.biography.placeOfBirth, {
		sensitivity: "base",
	});
}
function FilterPlaceOfBirth(heros) {
	const HasPlaceOfBirth = (hero) => hero.biography.placeOfBirth.length > 1;
	return [
		heros.filter(HasPlaceOfBirth),
		heros.filter((hero) => !HasPlaceOfBirth(hero)),
	];
}

function compareByAlignment(a, b) {
	const genderOrder = { good: 0, neutral: 1, bad: 2 };
	return (
		genderOrder[a.biography.alignment] - genderOrder[b.biography.alignment]
	);
}
function FilterAlignment(heros) {
	const hasAlign = (hero) => hero.biography.alignment.length > 1;
	return [heros.filter(hasAlign), heros.filter((hero) => !hasAlign(hero))];
}

function convertHeigth(height) {
	if (!height) {
		return -1;
	}

	let [int, string] = height.split(" ");
	int = Number.parseInt(int);

	if (string == "meters") {
		int = int * 100;
	}

	return int;
}

function convertWeight(weight) {
	if (!weight) {
		return -1;
	}

	let [int, string] = weight.replace(",", "").split(" ");

	int = Number.parseInt(int);

	if (string == "tons") {
		int = int * 1000;
	}

	return int;
}

function convertPower(hero) {
	return Object.values(hero).reduce((total, value) => total + value);
}

function filterheros(heros) {
	return heros.filter((hero) => {
		const value = getValueFromField(hero, searchField);
		if (value === null) {
			return false;
		}

		switch (searchType) {
			case "inc":
				return value.toLowerCase().includes(search);
			case "exc":
				return !value.toLowerCase().includes(search);
			case "fuz":
				return (
					value.toLowerCase().includes(search) ||
					value.toLowerCase().includes(getFuzzySearchString(search))
				);
			case "eq":
				return value === search || value === Number.parseInt(search);
			case "neq":
				return !(value === search || value === Number.parseInt(search));
			case "gt":
				return value > Number.parseInt(search);
			case "ls":
				return value < Number.parseInt(search);
			default:
				return false;
		}
	});
}

function getValueFromField(hero, field) {
	let value = null;

	if (field === "name") {
		value = hero.name.toLowerCase();
	} else if (field === "fullName") {
		value = hero.biography.fullName.toLowerCase();
	} else if (field === "power") {
		value = Object.values(hero.powerstats).reduce((total, num) => total + num, 0);
	} else if (field === "race") {
		value = hero.appearance.race;
	} else if (field === "gender") {
		value = hero.appearance.gender;
	} else if (field === "height") {
		value = Number.parseInt(hero.appearance.height[1]);
	} else if (field === "weight") {
		value = Number.parseInt(hero.appearance.weight[1]);
	} else if (field === "placeOfBirth") {
		value = hero.biography.placeOfBirth;
	} else if (field === "alignment") {
		value = hero.biography.alignment;
	}

	return value;
}

function getFuzzySearchString(searchString) {
	return searchString
		.split("")
		.map((char) => char + ".*")
		.join("");
}
function setModalDatas(hero) {
	selectedHero = hero.id
	updateUrl()

	const contentDiv = document.querySelector(".content");
	contentDiv.innerHTML = "";

	const centerDiv = document.createElement("div");
	centerDiv.classList.add("center");

	const image = document.createElement("img");
	image.src = hero.images.md;
	centerDiv.appendChild(image);

	contentDiv.appendChild(centerDiv);

	const details = document.createElement("ul");
	contentDiv.appendChild(details);

	for (const [key, value] of Object.entries(hero)) {
		if (typeof value === "object" && key !== "images") {
			const sublist = document.createElement("ul");
			for (const [subKey, subValue] of Object.entries(value)) {
				const listItem = document.createElement("li");
				listItem.textContent = `${subKey}: ${subValue}`;
				sublist.appendChild(listItem);
			}
			const listItem = document.createElement("li");
			listItem.textContent = key;
			listItem.appendChild(sublist);
			details.appendChild(listItem);
		} else if (key !== "images") {
			const listItem = document.createElement("li");
			listItem.textContent = `${key}: ${value}`;
			details.appendChild(listItem);
		}
	}
}

loadDatas();