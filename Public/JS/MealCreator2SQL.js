// Når indholdet i DOM'en er fuldt indlæst, initialiseres funktionen.
document.addEventListener('DOMContentLoaded', () => {
    // Hent referencer til DOM-elementer, der bruges i scriptet.
    const searchInput = document.getElementById('searchInput');
    const gramsInput = document.getElementById('gramsInput');
    const addIngredientButton = document.getElementById('searchButton');
    const displayContainer = document.getElementById('displayContainer');
    const saveMealButton = document.getElementById('saveMealButton');
    const mealNameInput = document.getElementById('mealNameInput');
    const suggestionsDatalist = document.getElementById('suggestionsDatalist');

    // Opretter en tom liste til at gemme ingredienser i måltidet.
    let ingredients = [];

    // Hent brugernavn fra localStorage for at gemme måltider i databasen.
    const username = JSON.parse(localStorage.getItem('brugerSession')).brugernavn;

    // Debounce funktion til at forsinke API-kald efter brugerinput, for at reducere antallet af kald.
    function debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    }

    // Lytter til brugerinput for at søge efter fødevarer dynamisk.
    searchInput.addEventListener('input', debounce(async () => { // Bruger debounce funktionen til at forsinke API-kaldet.
        const searchString = searchInput.value.trim();
        if (searchString.length > 1) {
            try {
                const response = await fetch(`http://localhost:3000/api/searches/${encodeURIComponent(searchString)}`);
                if (response.ok) {
                    const foodItems = await response.json();
                    populateSuggestions(foodItems);
                } else {
                    console.error('Failed to fetch food suggestions. Status:', response.status);
                }
            } catch (error) {
                console.error('Failed to fetch food suggestions:', error);
            }
        }
    }, 300));

    // Opdaterer forslagslisten baseret på søgeresultater.
    function populateSuggestions(foodItems) {
        suggestionsDatalist.innerHTML = '';
        foodItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.FoodName;
            suggestionsDatalist.appendChild(option);
        });
    }

    // Funktion til at tilføje en ingrediens til listen over ingredienser i måltidet.
    addIngredientButton.addEventListener('click', async () => {
        const foodName = searchInput.value;
        const grams = gramsInput.value;

        // Validerer input for madnavn og gram.
        if (!foodName.trim()) {
            alert("Please enter a food item.");
            return;
        }

        if (!grams || grams <= 0) { // Tjekker om gram er et gyldigt tal.
            alert("The amount of grams must be more than zero.");
            return;
        }

        // Henter yderligere information om fødevaren fra serveren.
        try {
            const response = await fetch(`http://localhost:3000/api/searchFood?search=${foodName}`);
            const foods = await response.json();
            if (foods.length > 0) {
                const food = foods[0];
                const nutritionalInfo = await getNutritionalInfo(food.FoodID);
                const ingredient = {
                    foodID: food.FoodID,
                    foodName: food.FoodName,
                    grams: grams,
                    details: nutritionalInfo
                };
                ingredients.push(ingredient);
                updateIngredientsList();
            } else {
                alert("No foods found with that name.");
            }
        } catch (error) {
            console.error('Error fetching food data:', error);
            alert('Failed to fetch food data.');
        }
    });

    // Funktion til at hente ernæringsoplysninger baseret på fødevare-ID.
    async function getNutritionalInfo(foodID) {
        const sortKeys = [1030, 1110, 1310, 1240]; // Sort keys for relevant ernæringsoplysninger, altså kalorier, protein, fedt og fibre.
        const nutritionalInfo = {};

        for (const key of sortKeys) { // Itererer gennem hver sort key og henter ernæringsoplysninger for fødevaren.
            try {
                const response = await fetch(`http://localhost:3000/api/nutritionalData/${foodID}/${key}`); // Henter ernæringsoplysninger fra serveren.
                if (!response.ok) { // Håndterer fejl under hentning af ernæringsoplysninger.
                    console.error(`Failed to fetch nutritional data for sort key ${key}: Status ${response.status}`);
                    nutritionalInfo[key] = 'Data not available';
                    continue;
                }
                const data = await response.json(); // Konverterer data til JSON-format.
                if (data && data.ResVal !== null) { // Henter ernæringsværdien fra data og gemmer den i objektet.
                    const nutrientValue = parseFloat(data.ResVal.replace(',', '.'));
                    switch (key) {
                        case 1030:
                            nutritionalInfo.kcal = nutrientValue.toFixed(2);
                            break;
                        case 1110:
                            nutritionalInfo.protein = nutrientValue.toFixed(2);
                            break;
                        case 1310:
                            nutritionalInfo.fat = nutrientValue.toFixed(2);
                            break;
                        case 1240:
                            nutritionalInfo.fibers = nutrientValue.toFixed(2);
                            break;
                    }
                } else {
                    console.log(`No data found for sort key ${key}`);
                    nutritionalInfo[key] = 'Data not available';
                }
            } catch (error) {
                console.error(`Error fetching nutritional data for sort key ${key}:`, error);
                nutritionalInfo[key] = 'Error fetching data';
            }
        }

        return nutritionalInfo;
    }

    // Opdaterer visningen med en liste af ingredienser og deres ernæringsoplysninger.Her vil ingredienserne blive præsenteret i punktform på MealCreator2 siden. 
    function updateIngredientsList() {
        displayContainer.innerHTML = '';
        ingredients.forEach(ing => {
            const item = document.createElement('li');
            item.textContent = `${ing.foodName}, Product ID: ${ing.foodID} - ${ing.grams} grams (Calories: ${ing.details.kcal} per 100g, Protein: ${ing.details.protein} per 100g, Fat: ${ing.details.fat} per 100g, Fibers: ${ing.details.fibers} per 100g)`;
            displayContainer.appendChild(item);
        });
    }

    // Gemmer et nyt måltid baseret på indtastede ingredienser og måltidsnavn.
    saveMealButton.addEventListener('click', async () => {
        const mealName = mealNameInput.value;
        if (!mealName || ingredients.length === 0) {
            alert("Please provide a meal name and add some ingredients.");
            return;
        }

        // Sender data til serveren for at gemme det nye måltid.
        try {
            const response = await fetch('http://localhost:3000/api/saveMeal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    mealName,
                    ingredients
                })
            });

            if (response.ok) { // Håndterer svar fra serveren.
                alert('Meal saved successfully!');
                // Omdirigerer brugeren til en anden side efter succesfuld handling.
                window.location.href = 'MealCreator.html';
            } else if (response.status === 409) {
                const errorMessage = await response.text();
                alert(errorMessage);
            } else {
                throw new Error('Failed to save meal.');
            }
        } catch (error) {
            console.error('Error saving meal:', error);
            alert('Failed to save meal. Please try again.');
        }
    });
});
