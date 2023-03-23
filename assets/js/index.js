// This function is called only after the data has been fetched, and parsed.
const loadData = (heroes) => {
	heroes.slice(0, 10).forEach((element) => {
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
            element.biography.alignment
		);
	});
};

// Request the file with fetch, the data will downloaded to your browser cache.
fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
	.then((response) => response.json()) // parse the response from JSON
	.then(loadData); // .then will call the `loadData` function with the JSON value.

function addLine(...params) {
    const table = document.querySelector("table");

	var nouvelleLigne = table.insertRow(-1);

	for (let index = 0; index < params.length; index++) {
		const param = params[index];
		if (typeof param === "object" && param !== null) {
			let objectValue = "";
			for (const key in param) {
                let value = "";

                if (isNaN(Number.parseInt(key))) {
                    value = capitalizeFirstLetter(key) + ":"
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
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
