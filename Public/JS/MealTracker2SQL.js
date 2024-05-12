// Lytter til DOMContentLoaded-hændelsen for at sikre, at HTML-indholdet er fuldt indlæst, før scriptet udføres.
document.addEventListener('DOMContentLoaded', function () {
    // Henter brugernavn fra localStorage ved at kalde getUsername funktionen. Funktionen er defineret nedenfor.
    const username = getUsername();
    // Får adgang til dropdown menuen for måltider via dens DOM-id.
    const mealDropdown = document.getElementById('mealNameDropdown');
    // Får adgang til input feltet for ingredienssøgning.
    const ingredientSearchInput = document.getElementById('ingredientSearch');
    // Får adgang til datalisten, der viser forslag til ingredienser.
    const suggestionsDatalist = document.getElementById('ingredientSuggestions');
    // Indlæser måltidsdata fra serveren baseret på brugernavnet.
    loadMealData(username);

    // Tilføjer en event listener til 'trackMealForm' for at håndtere indsendelse af formen.
    document.getElementById('trackMealForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Forhindrer standardformularindsendelse for at undgå sidegenindlæsning.
        trackMeal(); // Kalder trackMeal funktionen for at behandle måltidsdata.
    });

    // Funktion til at hente brugernavn fra localStoragem, hvilket forudsætter at brugerdata er gemt i JSON-format.
    function getUsername() {
        return JSON.parse(localStorage.getItem('brugerSession')).brugernavn;
    }

    //  Funktion til at hente måltidsdata fra serveren baseret på brugernavnet.
    function loadMealData(username) {
        fetch(`http://localhost:3000/api/getMeals/${username}`)
            .then(response => response.json()) // Parser serverens svar som JSON.
            .then(data => populateMealDropdown(data)) // Opdaterer dropdown menuen med data fra serveren.
            .catch(error => console.error('Failed to load meals', error)); // Logger eventuelle fejl ved indlæsning af måltider.
    }

    // Opdaterer dropdown menuen med måltidsdata hentet fra serveren.
    function populateMealDropdown(meals) {
        meals.forEach(meal => {
            const option = new Option(meal.MealName, meal.MealName); // Opretter en ny option for hvert måltid.
            // Gemmer ernæringsoplysninger som data-attributter i hvert option-element.
            option.dataset.CaloriesPer100g = meal.CaloriesPer100g;
            option.dataset.ProteinPer100g = meal.ProteinPer100g;
            option.dataset.FatPer100g = meal.FatPer100g;
            option.dataset.FibersPer100g = meal.FibersPer100g;
            mealDropdown.add(option); // Tilføjer option til dropdown menuen.
        });
    }

    // Debounce-funktion for at begrænse, hvor ofte en funktion kan køre. Bruges her til input event handling.
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments; // Gemmer kontekst og argumenter for at kunne bruge dem senere.
            clearTimeout(timeout); // Annullerer den forrige timeout.
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args); // Udfører funktionen, når ventetiden er overstået, hvis ikke 'immediate' er sand.
            }, wait);
            if (immediate && !timeout) func.apply(context, args); // Udfører funktionen med det samme, hvis 'immediate' er sand og der ikke allerede er en timeout.
        };
    }

    // Event handler til input i ingredienssøgefeltet, anvender debounce for at forbedre præstationen ved hyppige indtastninger.
     // Derudover udføres fetch ikke på et endpoint fra MealTrackerRoute.js men fra MealCreatorRoute.js. 
    // Her genbruger vi altså endpointet fra MealCreatorRoute.js., som vi har brugt i MealCreator2SQL.js.
    ingredientSearchInput.addEventListener('input', debounce(async (event) => {
        const searchTerm = event.target.value.trim(); // Fjerner whitespace fra start og slut af søgetermen.
        if (searchTerm.length > 1) { // Fortsætter kun hvis søgetermen har mere end ét tegn.
            try {
                // Foretager en asynkron forespørgsel til serveren for at finde ingredienser baseret på søgetermen.
                const response = await fetch(`http://localhost:3000/api/searches/${encodeURIComponent(searchTerm)}`);
                if (response.ok) { // Tjekker om serverens svar er OK.
                    const foodItems = await response.json(); // Parser svaret som JSON.
                    updateSuggestions(foodItems); // Opdaterer datalisten med de modtagne forslag.
                } else {
                    console.error('Failed to fetch food suggestions. Status:', response.status); // Logger en fejl hvis svaret ikke er OK.
                }
            } catch (error) {
                console.error('Failed to fetch food suggestions:', error); // Logger fejl ved netværksanmodningen.
            }
        } else {
            suggestionsDatalist.innerHTML = ''; // Tømmer forslagsdatalisten, hvis der ikke er en gyldig søgeterm.
        }
    }, 300));

    // Opdaterer datalisten med nye forslag baseret på søgeinput.
    function updateSuggestions(foodItems) { // Modtager en liste over fødevareforslag.
        suggestionsDatalist.innerHTML = ''; // Tømmer tidligere forslag.
        foodItems.forEach(item => { // Itererer over hvert forslag.
            const option = document.createElement('option'); // Opretter et nyt option-element for hver forslag.
            option.value = item.FoodName; // Sætter værdien af option til navnet på fødevaren.
            option.dataset.foodId = item.FoodID; // Gemmer fødevarens ID som en data-attribut.
            suggestionsDatalist.appendChild(option); // Tilføjer det nye option-element til datalisten.
        });
    }

    // Event handler for 'trackIngredient' knappen, der håndterer tilføjelse af en ingrediens til et måltid.
    document.getElementById('trackIngredient').addEventListener('click', () => {
        // Finder det valgte option baseret på værdien i ingredienssøgefeltet.
        const selectedOption = document.querySelector('#ingredientSuggestions option[value="' + ingredientSearchInput.value + '"]');
        if (selectedOption && selectedOption.dataset.foodId) { // Tjekker om der er valgt en gyldig ingrediens.
            const foodID = selectedOption.dataset.foodId; // Henter fødevarens ID.
            const grams = parseFloat(normalizeDecimalInput(document.getElementById('ingredientGramsInput').value)); // Normaliserer (altså gør det muligt at bruge både "," og "." som decimaldeler) og parser gram input.
            const mealType = document.getElementById('ingredientMealTypeInput').value; // Henter måltidstypen fra inputfeltet.
            trackIngredientWithNutrition(foodID, grams, mealType); // Kalder funktionen til at spore ingrediensen med ernæringsoplysninger.
        } else {
            alert('Please select a valid ingredient from the list'); // Viser en advarsel, hvis ingen gyldig ingrediens er valgt.
        }
    });

    // Funktion til at spore et måltid med det valgte måltid og mængde.
    function trackMeal() {
        const selectedOption = mealDropdown.selectedOptions[0]; // Henter det valgte måltid fra dropdown.
        const grams = parseFloat(normalizeDecimalInput(document.getElementById('gramsInput').value)); // Normaliserer og parser gram input.
        const waterInput = parseFloat(normalizeDecimalInput(document.getElementById('waterInput').value)) || 0; // Henter og parser vand input, standardværdi er 0.

        // Kontrollerer, om gram er større end 0 for at sikre gyldigt input.
        if (grams <= 0) {
            alert("Please enter a positive number of grams for the meal."); // Viser en fejlmeddelelse, hvis input er ugyldigt.
            return; // Afslutter funktionen tidligt, hvis gram ikke er gyldigt.
        }

        // Henter geolokation og bruger den sammen med måltidsdata til at oprette et sporingsobjekt.
        getGeolocation(location => {
            const mealData = {
                username: username,
                mealName: selectedOption.text,
                mealType: document.getElementById('mealTypeInput').value,
                totalGrams: grams,
                totalCalories: selectedOption.dataset.CaloriesPer100g * (grams / 100),
                totalProtein: selectedOption.dataset.ProteinPer100g * (grams / 100),
                totalFat: selectedOption.dataset.FatPer100g * (grams / 100),
                totalFibers: selectedOption.dataset.FibersPer100g * (grams / 100),
                waterConsumed: waterInput,
                locationLatitude: location.latitude,
                locationLongitude: location.longitude,
                creationDate: new Date().toISOString()
            };
            submitMealData(mealData); // Sender måltidsdata til serveren.
        });
    }

    // Asynkron funktion til at hente ernæringsoplysninger for en bestemt fødevare-ID.
    async function getNutritionalInfo(foodID) {
        const sortKeys = [1030, 1110, 1310, 1240]; // Definerer nøgler for at anmode om specifikke ernæringsoplysninger.
        const nutritionalInfo = {}; // Opretter et tomt objekt til at gemme ernæringsoplysninger.

        for (const key of sortKeys) {
            try {
                // Udfører en asynkron forespørgsel for hver ernæringsnøgle. Dette er en for-loop, der kører for hver nøgle.
                // Derudover udføres fetch ikke på et endpoint fra MealTrackerRoute.js men fra MealCreatorRoute.js. 
                // Her genbruger vi altså endpointet fra MealCreatorRoute.js., som vi har brugt i MealCreator2SQL.js.
                const response = await fetch(`http://localhost:3000/api/nutritionalData/${foodID}/${key}`);
                if (!response.ok) { // Tjekker om svaret fra serveren er OK.
                    console.error(`Failed to fetch nutritional data for sort key ${key}: Status ${response.status}`);
                    nutritionalInfo[key] = 'Data not available'; // Gemmer en fejlmeddelelse, hvis data ikke kunne hentes.
                    continue; // Fortsætter til næste nøgle.
                }
                const data = await response.json(); // Parser svaret som JSON.
                if (data && data.ResVal !== null) { // Tjekker om der er modtaget gyldige data.
                    const nutrientValue = parseFloat(data.ResVal.replace(',', '.')); // Konverterer data til flydende tal og erstatter komma med punktum.
                    // Gemmer ernæringsoplysninger baseret på nøglen.
                    switch (key) {
                        case 1030:
                            nutritionalInfo.kcal = nutrientValue.toFixed(2); // Kalorier.
                            break;
                        case 1110:
                            nutritionalInfo.protein = nutrientValue.toFixed(2); // Protein.
                            break;
                        case 1310:
                            nutritionalInfo.fat = nutrientValue.toFixed(2); // Fedt.
                            break;
                        case 1240:
                            nutritionalInfo.fibers = nutrientValue.toFixed(2); // Fibre.
                            break;
                    }
                } else {
                    console.log(`No data found for sort key ${key}`); // Logger, hvis der ikke findes data for nøglen.
                    nutritionalInfo[key] = 'Data not available'; // Gemmer en fejlmeddelelse.
                }
            } catch (error) {
                console.error(`Error fetching nutritional data for sort key ${key}:`, error); // Logger eventuelle fejl ved anmodningen.
                nutritionalInfo[key] = 'Error fetching data'; // Gemmer en fejlmeddelelse.
            }
        }

        return nutritionalInfo; // Returnerer et objekt med ernæringsoplysningerne.
    }

    // Funktion til normalisering af decimal input, erstatter komma med punktum for at sikre korrekt parsing.
    function normalizeDecimalInput(input) {
        return input.replace(',', '.');
    }

    // Funktion til at spore en ingrediens med ernæringsoplysninger og geolokation.
    function trackIngredientWithNutrition(foodID, grams, mealType) {

        // Tjekker, om gram er gyldigt (større end 0).
        if (grams <= 0) {
            alert("Please enter a positive number of grams for the ingredient."); // Viser en fejlmeddelelse, hvis input er ugyldigt.
            return; // Afslutter funktionen tidligt.
        }

        // Henter ernæringsoplysninger og bruger dem sammen med geolokation til at oprette et sporingsobjekt for ingrediensen.
        getNutritionalInfo(foodID).then(nutritionalInfo => {
            getGeolocation(location => {
                const ingredientData = {
                    username: getUsername(), // Henter brugernavn igen, da det kan være blevet ændret siden sidste hentning.
                    mealName: document.getElementById('ingredientSearch').value, // Navnet på ingrediensen.
                    mealType: mealType, // Typen af måltid, som brugeren har defineret (f.eks. morgenmad, frokost, aftensmad).
                    totalGrams: grams, // Totalvægten af ingrediensen.
                    totalCalories: nutritionalInfo.kcal * (grams / 100), // Total kalorier beregnet fra ernæringsoplysninger.
                    totalProtein: nutritionalInfo.protein * (grams / 100), // Total protein.
                    totalFat: nutritionalInfo.fat * (grams / 100), // Total fedt.
                    totalFibers: nutritionalInfo.fibers * (grams / 100), // Total fibre.
                    waterConsumed: 0, // Vandforbrug, standardværdi er 0.
                    locationLatitude: location.latitude, // Geolokations breddegrad.
                    locationLongitude: location.longitude, // Geolokations længdegrad.
                    creationDate: new Date().toISOString() // Dato og tid for oprettelsen af sporingsdata.
                };
                submitMealData(ingredientData); // Sender ingrediensens data til serveren.
            });
        }).catch(error => {
            console.error('Error fetching nutritional data:', error); // Logger eventuelle fejl ved hentning af ernæringsdata.
            alert('Failed to fetch nutritional data'); // Viser en fejlmeddelelse.
        });
    }
    

    // Funktion til at sende måltidsdata til serveren via POST-anmodning.
    function submitMealData(mealData) {
        console.log("Submitting meal data:", mealData); // Logger data, der sendes.
        fetch('http://localhost:3000/api/addTrackedMeal', {
            method: 'POST', // Specificerer HTTP-metoden POST.
            headers: { 'Content-Type': 'application/json' }, // Specificerer indholdstypen som JSON.
            body: JSON.stringify(mealData) // Omdanner måltidsdata til en JSON-streng.
        })
        .then(response => response.json()) // Parser svaret som JSON.
        .then(data => {
            if (data.status === 'success') {
                alert('Meal tracked successfully'); // Viser en bekræftelsesbesked, hvis sporingsdata er modtaget korrekt.
            } else {
                throw new Error(data.message); // Udløser en fejl, hvis serveren returnerer en fejlmeddelelse.
            }
        })
        .catch(error => {
            console.error('Failed to track meal:', error); // Logger eventuelle fejl ved indsendelse af data.
            alert('Failed to track meal due to network error'); // Viser en fejlmeddelelse.
        });
    }

    // Funktion til at hente brugerens geolokation ved hjælp af browserens geolokations API.
    function getGeolocation(callback) { 
        navigator.geolocation.getCurrentPosition( // Anmoder om brugerens aktuelle geolokation.
            position => callback(position.coords), // Kalder callback-funktionen med positionens koordinater.
            error => { 
                console.error('Geolocation error:', error); // Logger eventuelle fejl ved hentning af geolokation.
                callback({ latitude: null, longitude: null }); // Kalder callback med null-værdier, hvis der opstår en fejl.
            }
        );
    }
});
