const apiKey = 170998; // Den nødvendige apiKey, hvilket er mit Studienummer.


// Til at starte med skal vi gøre brug af en asynkron funktion til at søge efter madvarer baseret på en søgestreng.
async function searchFood(searchString) {

    try {
        // Her laver jeg en HTTP GET-anmodning til API'en (standardmetoden for 'fetch') med den angivne søgestreng.
        let response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${searchString}`, {
            headers: {
                "X-API-Key": `${apiKey}`,
            },
        });

        // I nedenstående kode tjekker jeg om anmodningen var succesfuld.
        if (response.ok) {
            let foodItems = await response.json(); // Jeg konverterer her svaret til JSON-format, som indeholder fødevareobjekterne.
            return foodItems;
        } else {
            // Jeg logger en fejlbesked med statuskoden, hvis anmodningen fejlede.
            console.error('Failed to fetch data. Status', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error); // Her fanger jeg og logger eventuelle fejl i anmodningen.
    }
}
// Her laver jeg endnu en asynkron funktionm som har til formål at hente en bestemt fødevare-ID og sortKey.
// Jeg har ikke kommenteret så meget under denne asynkron funktion, da meget af samme handling foregår ovenover.
async function getNutritionalData(foodID, sortKey) {
    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
            headers: { "X-API-Key": apiKey }
        });
        if (response.ok) {
            let data = await response.json();
            return data; // Returnerer data for den givne sortkey
        } else {
            console.error('Failed to fetch data. Status', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
// Denne funktion henter ernæringsdata for en bestemt fødevare-ID og opdaterer derefter brugergrænsefladen med disse data. 
// Den bruger Promise.all til at hente data parallelt for forskellige næringsstoffer (kalorier, protein, fedt, og fibre).
async function getAndDisplayNutrition(foodID) {
    try {
        // Henter ernæringsdata for forskellige næringsstoffer parallelt ved hjælp af Promise.all.
        const [kcalResponse, proteinResponse, fatResponse, fibersResponse] = await Promise.all([
            getNutritionalData(foodID, 1030),
            getNutritionalData(foodID, 1110),
            getNutritionalData(foodID, 1310),
            getNutritionalData(foodID, 1240)
        ]);

        // Her uddrager og konverterer jeg ernæringsværdierne fra responsen, eller sætter dem til 0 hvis de ikke findes.
        const kcal = kcalResponse[0] ? parseFloat(kcalResponse[0].resVal.replace(',', '.')) : 0;
        const protein = proteinResponse[0] ? parseFloat(proteinResponse[0].resVal.replace(',', '.')) : 0;
        const fat = fatResponse[0] ? parseFloat(fatResponse[0].resVal.replace(',', '.')) : 0;
        const fibers = fibersResponse[0] ? parseFloat(fibersResponse[0].resVal.replace(',', '.')) : 0;

        // Til sidst kalder jeg en anden funktion for at vise de hentede ernæringsværdier i brugergrænsefladen.
        displayNutritionalInfo({
            kcal,
            protein,
            fat,
            fibers
        });
    } catch (error) {
        console.error('An error occurred while fetching nutrition data:', error);
        // Dette logger fejlen til konsollen for fejlsøgning, hvis der dukker fejl op.

    }
}


// Denne funktion henter ernæringsdata, næringsstoffer og formaterer dem.
async function displayNutritionalInfo(foodID) {
    try {

        // Finder elementet i DOM, hvor ernæringsinformation skal vises.
        const displayNutrition = document.getElementById('displayNutrition');
        // Ryd tidligere resultater
        displayNutrition.innerHTML = '';

        // Her hentes ernæringsdata for hvert ernæringsstof baseret på foodID og den specifikke sortKey for kalorier, protein, fedt og fibre.
        const kcalData = await getNutritionalData(foodID, 1030);
        const proteinData = await getNutritionalData(foodID, 1110);
        const fatData = await getNutritionalData(foodID, 1310);
        const fibersData = await getNutritionalData(foodID, 1240);

        // Her gør jeg brug af parseFloat, hvortil jeg formaterer hvert ernæringsstofs værdi til en streng med to decimaler.
        const kcal = parseFloat(kcalData[0].resVal).toFixed(2);
        const protein = parseFloat(proteinData[0].resVal).toFixed(2);
        const fat = parseFloat(fatData[0].resVal).toFixed(2);
        const fibers = parseFloat(fibersData[0].resVal).toFixed(2);

        // Her returnerer jeg et objekt med de hentede og formaterede ernæringsdata.
        return { kcal, protein, fat, fibers };

    } catch (error) {
        console.error('Error displaying nutritional info:', error);
        return 0; // Returner 0 hvis der opstår en fejl
    }
}


// Her laves en asynkron funktion som har til formål, at søge efter en fødevare 
// og vise dens ernæringsinformation baseret på en søgestreng og antal gram.

async function searchAndDisplayFood(searchString, grams) {
    try {

        // Her fortages der en søgningen og gemmer resultatet i en variabel.
        const foodItems = await searchFood(searchString);

        // Her tjekkes der om hvorvidt der bliver fundet fødevareelementer, og om der vises ernæringsinformation for det første element.
        if (foodItems.length > 0) {
            const nutritionalInfo = await displayNutritionalInfo(foodItems[0].foodID);
            displayFoodItems(foodItems, grams, nutritionalInfo); // Opdateret til at sende ernæringsinfo som argument
        }

    } catch (error) {
        console.error('There was an error in the searchAndDisplayFood function:', error);
    }
}

// Funktion her bruges til at oprette og vise en liste over fødevareelementer baseret på søgeresultater og ernæringsinformation.
function displayFoodItems(foodItems, grams, nutritionalInfo) {
    const displayContainer = document.getElementById('displayContainer');

    // Her tjekkes der om fødevareelementet allerede findes i listen, for at undgå duplikater.

    if (!displayContainer.querySelector(`li[data-food-id="${foodItems[0].foodID}"]`)) {
        // Her er data-food-id attribut tilføjet til hver vores "li" element for netop at sikre,
        // at hver ingrediens kun bliver tilføjet en gang. 
        const listItem = document.createElement('li');
        listItem.setAttribute('data-food-id', foodItems[0].foodID); // Her tilføjer jeg et data attribut for at spore unikke ingredienser
        listItem.textContent = `${grams}g - ${foodItems[0].foodName} Product ID: ${foodItems[0].foodID}, Kalorier: ${nutritionalInfo.kcal} per 100g,
        Protein: ${nutritionalInfo.protein}g per 100g, Fat: ${nutritionalInfo.fat}g per 100g, Fiber: ${nutritionalInfo.fibers}g per 100g`;
        // I ovenstående kode får jeg indsat informationer til brugeren inde på MealCreator 2 siden. 
        displayContainer.appendChild(listItem); // .appendChild method sikrer at hver ingrediens, der bliver tilføjet til måltidet, vises i listen over ingredienser. Dette sker under displayContainer, ift. mit HTML.
    }
}

// saveMeal funktionen gemmer et nyt måltid baseret på brugerens input. 
function saveMeal() {
    const mealName = document.getElementById('mealNameInput').value; //Henter måltidets navn fra input
    const ingredients = extractIngredientsFromDisplay(); // Funktionen ekstraherer og opretter et array af ingredienser.
    // Her oprettes et nyt måltidsobjekt med det indsamlede data.
    const newMeal = {

        id: Date.now().toString(), // Brug af Date.now() med formål om at generere et unikt ID
        name: mealName,
        ingredients: ingredients, // Dette bør være et array eller en liste af objekter. 
        // Nedenudner implementers funktionerne omkring udregning af de forskellig ernæringer. 
        totalKcal: calculateTotalKcal(ingredients),
        totalProtein: calculateTotalProtein(ingredients),
        totalFat: calculateTotalFat(ingredients),
        totalFibers: calculateTotalFibers(ingredients),
        addedOn: new Date().toLocaleDateString(),
    };

    // Henter eksisterende måltider fra localStorage og tilføjer det nye måltid.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.push(newMeal);
    localStorage.setItem('meals', JSON.stringify(meals));  // Opdatere 'meals' i localStorage med den nye liste

    alert('Meal saved successfully!'); // Ved click på knap, får man en bekræftigelse. 
}

// Her tilføjer jeg en event listener til 'searchButton'.
document.getElementById('searchButton').addEventListener('click', () => {
    const searchString = searchInput.value;
    const grams = gramsInput.value;
    // Afslutningsvis kalder vi funktionen til at søge efter og vise fødevarer baseret på den indtastede søgestreng og gramværdi.
    searchAndDisplayFood(searchString, grams);
});

// Tilføjer en event listener til 'saveMealButton'.
document.getElementById('saveMealButton').addEventListener('click', saveMeal);

// Her laves en funktion til at ekstrahere ingrediensdata fra den viste liste af fødevarer.
function extractIngredientsFromDisplay() {

    // Konverterer vores DOM-elementer til et array og transformerer hvert element til et objekt med ingrediensdata.
    const items = document.querySelectorAll('#displayContainer li'); // Vælger alle listeelementer (li) inde i displayContainer.
    const itemsArray = []; // Her oprettes der et tomt array, for holde vores konverteret ingrediensdata. 

    // Her starter vi et for-loop for at iterere gennem hvert element i vores NodeList 'items'.
    for (let i = 0; i < items.length; i++) {
        const item = items[i];  // Her gemmer vi det aktuelle element i variablen 'item'.
        const textContent = item.textContent;  // Her uddrager vi tekstindholdet fra det aktuelle element.
        const [grams, rest] = textContent.split(' - ');  // Her splitter vi tekstindholdet ved ' - ' og gemmer de to dele i variabler 'grams' og 'rest'.
        const name = rest.split(', ')[0].trim(); // Her splitter vi resten af tekstindholdet ved ', ' og trimmer det for at fjerne overflødige mellemrum.


        // Funktion til at finde og parse næringsværdier
        const findNutrientValue = (nutrientName) => {

            // Jeg har oprettet dette udtryk Regex eller  (RegExp) for at finde en ernæringsværdi (et bestemt mønster) i 'textContent'.
            // Mønstret søger efter 'nutrientName' efterfulgt af ": " og en talværdi (med cifre, punktummer, kommaer).
            // Dette bruges specifikt til at ekstrahere specifikke næringsstofdata, fx for konvertering til numeriske værdier.
            const regex = new RegExp(`${nutrientName}: ([\\d.,]+)`);  // ([\\d.,]+)`); er et udtryk man bruger (RegExp) i JavaScript. 
            // Helt præcist matcher ([\\d.,]+)`); en eller flere sekvenser af tal, der potentielt indeholder kommaer eller punktummer. Fx vil det matche 123, 1.23, 1.234,56 osv.
            // Her anvender jeg regex på 'textContent' (dette forventes at være næringsdata som en streng) for at finde et match.
            const match = textContent.match(regex);
            // Afslutningsvis returnerer vi den fundne værdi som et tal (float), ellers 'null' hvis intet match findes.
            return match ? parseFloat(match[1].replace(',', '.')) : null;
        };

        // Her hentes værdier for hver næringsstof
        const nutrientValues = {
            name,
            grams: parseInt(grams, 10),
            kcalPer100g: findNutrientValue('Kalorier'),
            proteinPer100g: findNutrientValue('Protein'),
            fatPer100g: findNutrientValue('Fedt'),
            fibersPer100g: findNutrientValue('Fibre')
        };

        itemsArray.push(nutrientValues);

    };

    return itemsArray;

}

// Her er lavet en funktion, der kan beregne den samlede ernærings indtag ved en meal på forskellige ingredienser.
// Der er en væsentlige simpler måde at gøre det på, hvilket var sætte dem alle sammen, og lave en calculateTotal eller noget andet lignende. 
// Jeg har bare haft problemer med at implementerer dem derefter, og derfor har jeg valgt at gøre det simpelt.
// Derudover anvender disse funktioner reduce-metoden til at akkumulere en total værdi for hver næringsstof over alle ingredienser.
function calculateTotalKcal(ingredients) {
    return ingredients.reduce((totalKcal, ingredient) => {
        const kcalForIngredient = (ingredient.grams * ingredient.kcalPer100g) / 100;
        return totalKcal + kcalForIngredient;
    }, 0);
}

function calculateTotalProtein(ingredients) {
    return ingredients.reduce((totalProtein, ingredient) => {
        const proteinForIngredient = (ingredient.grams * ingredient.proteinPer100g) / 100;
        return totalProtein + proteinForIngredient;
    }, 0);
}

function calculateTotalFat(ingredients) {
    return ingredients.reduce((totalFat, ingredient) => {
        const fatForIngredient = (ingredient.grams * ingredient.fatPer100g) / 100;
        return totalFat + fatForIngredient;
    }, 0);
}

function calculateTotalFibers(ingredients) {
    return ingredients.reduce((totalFibers, ingredient) => {
        const fibersForIngredient = (ingredient.grams * ingredient.fibersPer100g) / 100;
        return totalFibers + fibersForIngredient;
    }, 0);
}




// DETTE ER NYT, Dette er søgeforslag



// Debounce funktion for at forhindre for hyppige API-kald
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  
  // Funktion til at foreslå ingredienser baseret på søgeforespørgslen
  async function suggestIngredients(searchQuery) {
    if (!searchQuery) {
      return;
    }
    try {
      const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${searchQuery}`, {
        headers: {
          "X-API-Key": `${apiKey}`,
        },
      });
      if (response.ok) {
        const foodItems = await response.json();
        populateSuggestions(foodItems);
      } else {
        console.error('Failed to fetch suggestions. Status', response.status);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }
  
  // Funktion til at opdatere datalisten med de foreslåede ingredienser
  function populateSuggestions(foodItems) {
    const suggestionsDatalist = document.getElementById('suggestionsDatalist');
    suggestionsDatalist.innerHTML = ''; // Fjern tidligere forslag
    foodItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.foodName;
      suggestionsDatalist.appendChild(option);
    });
  }

// Tilføj en 'input' event listener til søgeinputfeltet med debounce
const searchInputField = document.getElementById('searchInput');
searchInputField.addEventListener('input', debounce(() => suggestIngredients(searchInputField.value), 800));


// Til sidst tilføjer jeg event listeners til 'DOMContentLoaded' og til knapper på siden.
// Disse event listeners sikrer, at de rette funktioner kaldes, når brugeren interagerer med siden (søger efter fødevarer eller gemmer et måltid).
document.addEventListener('DOMContentLoaded', () => {

    const searchButton = document.getElementById('searchButton');    // Dette fjerner en tidligere event listener fra 'searchButton' og tilføjer en ny.
    if (searchButton) {
        searchButton.removeEventListener('click', handleSearchButtonClick); // Fjerner tidligere event listener hvis den eksisterer
        searchButton.addEventListener('click', handleSearchButtonClick); // Tilføjer en ny event listener
    }
});

// Her til sidst definerer jeg 'handleSearchButtonClick' funktionen, som kaldes, når 'searchButton' klikkes.
// Funktionen henter værdier fra søge- og gram-inputfelterne og kalder 'searchAndDisplayFood' med disse værdier.
function handleSearchButtonClick() {
    const searchString = document.getElementById('searchInput').value;
    const grams = document.getElementById('gramsInput').value;
    searchAndDisplayFood(searchString, grams);
}



// Til sidst tilføjer jeg event listeners til 'DOMContentLoaded' og til knapper på siden.
// Disse event listeners sikrer, at de rette funktioner kaldes, når brugeren interagerer med siden (søger efter fødevarer eller gemmer et måltid).
document.addEventListener('DOMContentLoaded', () => {

    const searchButton = document.getElementById('searchButton');    // Dette fjerner en tidligere event listener fra 'searchButton' og tilføjer en ny.
    if (searchButton) {
        searchButton.removeEventListener('click', handleSearchButtonClick); // Fjerner tidligere event listener hvis den eksisterer
        searchButton.addEventListener('click', handleSearchButtonClick); // Tilføjer en ny event listener
    }
});

// Her til sidst definerer jeg 'handleSearchButtonClick' funktionen, som kaldes, når 'searchButton' klikkes.
// Funktionen henter værdier fra søge- og gram-inputfelterne og kalder 'searchAndDisplayFood' med disse værdier.
function handleSearchButtonClick() {
    const searchString = document.getElementById('searchInput').value;
    const grams = document.getElementById('gramsInput').value;
    searchAndDisplayFood(searchString, grams);
}

