const apiKey = 170998; // Den nødvendige apiKey, hvilket er mit Studienummer.

// Dette er en asynkron funktion til at søge efter fødevarer ved hjælp af et API
async function searchFood(searchString) {

    try {
        let response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${searchString}`, {
            headers: {
                "X-API-Key": `${apiKey}`,
            },
        });
        // Tjekker om anmodningen lykkedes
        if (response.ok) {
            let foodItems = await response.json(); // Konverterer svaret til JSON
            return foodItems;
        } else {
            console.error('Failed to fetch data. Status', response.status);
        }
    } catch (error) { // Fanger og logger eventuelle fejl
        console.error('Error fetching data:', error);
    }
}

// Nedenstående asynkron funktion har til formål, at søge og vise fødevarer baseret på en søgestreng
async function searchAndDisplayFood(searchString) {
    try {
        const foodItems = await searchFood(searchString);  // Søger efter fødevarer og gemmer resultatet

        if (foodItems.length > 0) { // Tjekker om der er fundet nogen fødevarer
            displayFoodItems(foodItems);// Kalder displayNutritionalInfo for at vise ernæringsoplysninger for den første fødevare
            await displayNutritionalInfo(foodItems[0].foodID);
        }
    } catch (error) {
        console.error('There was an error in the searchAndDisplayFood function:', error);
    }
}

// Denne funktion er ny, og bruges til at bevarer fooditem og product id på siden, når man søger på en specifik fødevare.
function displayFoodItems(foodItem) {
  // Søger efter eksisterende '.food-item-name' span, opretter en ny hvis den ikke findes
  let itemNameSpan = document.querySelector('.food-item-name');
  // Søger efter eksisterende '.product-id' span, opretter en ny hvis den ikke findes
  let itemIdSpan = document.querySelector('.product-id');
  
  // Hvis '.food-item-name' span ikke findes, opretter vi det og tilføjer det til containeren
  if (!itemNameSpan) {
      itemNameSpan = document.createElement('span');
      itemNameSpan.classList.add('food-item-name');
      // Får fat i containeren hvor navnet skal vises og tilføjer det nye span til denne
      const nameContainer = document.querySelector('#displayContainer h2');
      nameContainer.appendChild(itemNameSpan);
  }
  
  // Hvis '.product-id' span ikke findes, opretter vi det og tilføjer det til containeren
  if (!itemIdSpan) {
      itemIdSpan = document.createElement('span');
      itemIdSpan.classList.add('product-id');
      // Får fat i containeren hvor produkt-id skal vises og tilføjer det nye span til denne
      const idContainer = document.querySelector('#displayContainer p');
      idContainer.appendChild(itemIdSpan);
  }
  
  // Opdaterer tekstindholdet i de spans med data fra det pågældende fødevareobjekt
  itemNameSpan.textContent = foodItem.foodName;
  itemIdSpan.textContent = foodItem.foodID;
}



// Denne asynkron funktion har til formål, at hente ernæringsdata for en specifik fødevare
async function getNutritionalData(foodID, sortKey) {
    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
            headers: { "X-API-Key": apiKey }
        });
        if (response.ok) {
            let data = await response.json();
            return data; // Returnerer data for den givne sortkey
        } else {
            console.error('Failed to fetch data. Status', response.status); // Logger en fejlmeddelelse, hvis anmodningen mislykkes

        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    console.log(data)
}





// Denne asynkron funktion har til formål, at vise ernæringsoplysninger for en bestemt fødevare

async function displayNutritionalInfo(foodID) {
    try {

        // Finder containeren, hvor ernæringsinformationen skal vises
        const displayNutrition = document.getElementById('displayNutrition');
        // Rydder containeren for tidligere resultater
        displayNutrition.innerHTML = '';

        // Henter ernæringsdata for forskellige næringsstoffer
        const kcalData = await getNutritionalData(foodID, 1030);
        const proteinData = await getNutritionalData(foodID, 1110);
        const fatData = await getNutritionalData(foodID, 1310);
        const fibersData = await getNutritionalData(foodID, 1240);



        // Konverterer de hentede data til tal og formaterer dem.
        // Årsagen til at vi har inddraget pareseFloat er, at jeg gerne vil have 2 decimaler som maksimum. 
        // ParseFloat konvertere dataen fra strenge til tal. Metoden toFixed(2) konverterer derefter tallet til en streng, som repræsenterer et afrundet tal med to decimaler. 
        const kcal = parseFloat(kcalData[0].resVal).toFixed(2);
        const protein = parseFloat(proteinData[0].resVal).toFixed(2);
        const fat = parseFloat(fatData[0].resVal).toFixed(2);
        const fibers = parseFloat(fibersData[0].resVal).toFixed(2);


        // Opretter et nyt HTML-element og tilføjer ernæringsoplysninger
        const itemDiv = document.createElement('div');
        displayNutrition.appendChild(itemDiv);
        itemDiv.classList.add('nutrition-info');
        // Her tilføjer jeg indhold til div'en som er ernæringsdata
        itemDiv.innerHTML = `
           <h3>Nutrition pr. 100g:</h3>
           <p><strong>Energy (kcal): ${kcal}</strong> </p>
           <p><strong>Protein: ${protein}g</strong> </p>
           <p><strong>Fat: ${fat}g</strong> </p>
           <p><strong>Fibers: ${fibers}g</strong> </p>
            `;


    } catch (error) {
        console.error('Error displaying nutritional info:', error);
    }
}





// Det her er nyt kode for at fremvise food item forslag ved søgning. 




// Debounce funktion for at forhindre for hyppige API-kald
function debounce(func, delay) {
    let inDebounce;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
  }
  
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
        console.error('Fejl ved indhentning af forslag. Status', response.status);
      }
    } catch (error) {
      console.error('Fejl ved indhentning af forslag:', error);
    }
  }
  
  // Funktion til at opdatere datalisten med de foreslåede ingredienser
  function populateSuggestions(foodItems) {
    const suggestionsDatalist = document.getElementById('foodSuggestions');
    suggestionsDatalist.innerHTML = ''; // Fjern tidligere forslag
    foodItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.foodName;
      suggestionsDatalist.appendChild(option);
    });
  }
  
  // Funktion til at hente og vise ernæringsoplysninger
  async function searchAndDisplayFood(searchString) {
    if (!searchString) {
      return;
    }
    try {
      const foodItems = await searchFood(searchString);
      if (foodItems && foodItems.length > 0) {
        displayFoodItems(foodItems[0]);
        await displayNutritionalInfo(foodItems[0].foodID);
      }
    } catch (error) {
      console.error('Der var en fejl i søge- og visningsfunktionen:', error);
    }
  }
  

// Event listeners for søgefunktionen
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
  
    searchButton.addEventListener('click', () => {
      const searchString = searchInput.value;
      searchAndDisplayFood(searchString);
    });
  
    searchInput.addEventListener('input', debounce(() => suggestIngredients(searchInput.value), 500));
  
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchAndDisplayFood(searchInput.value);
      }
    });
  });










