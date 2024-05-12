// Funktion til indlæsning af måltider fra serveren baseret på brugerens navn.
function loadMeals() {
    // Henter brugernavn fra localStorage og antager at det er gemt som JSON.
    const username = JSON.parse(localStorage.getItem('brugerSession')).brugernavn;
    // Asynkront API-kald til serveren for at hente alle måltider tilhørende brugeren.
    fetch(`http://localhost:3000/api/getAllMeals/${username}`) 
        .then(response => {
            if (!response.ok) { // Tjekker om HTTP-anmodningen var succesfuld.
                throw new Error('Failed to fetch meals'); // Kaster en fejl hvis anmodningen fejler.
            }
            return response.json(); // Returnerer svaret som JSON hvis alt gik godt.
        })
        .then(meals => {
            displayMeals(meals); // Kalder funktionen der viser måltiderne i brugergrænsefladen.
        })
        .catch(error => {
            console.error('Error loading meals:', error); // Logger en fejlmeddelelse hvis der opstår en fejl under hentningen.
        });
}

// Funktion til at vise måltider i brugergrænsefladen.
function displayMeals(meals) {
    const mealsListContainer = document.querySelector('#meals-list-container'); // Finder containeren til måltider.
    mealsListContainer.innerHTML = ''; // Nulstiller containeren for at fjerne tidligere måltider.

    meals.forEach((meal, index) => {
        const date = new Date(meal.CreationDate); // Opretter en datoobjekt fra creation date.
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; // Formatterer datoen til en læsbar string.

        // Opretter en række til hvert måltid med relevant information.
        const row = document.createElement('div');
        row.className = 'table-row'; // Tilføjer en klasse til rækken for styling.
        row.innerHTML = `
            <div class="row-item">#${index + 1}</div>
            <div class="row-item">${meal.MealName}</div>
            <div class="row-item">${meal.CaloriesPer100g} kcal, ${meal.ProteinPer100g}g, ${meal.FatPer100g}g, ${meal.FibersPer100g}g</div>
            <div class="row-item">${meal.TotalCalories} kcal, ${meal.TotalProtein}g, ${meal.TotalFat}g, ${meal.TotalFibers}g</div>
            <div class="row-item">${formattedDate}</div>
            <div class="row-item">${meal.IngredientsCount}</div>
            <div class="row-item">
                <button class="details-button" data-meal-name="${meal.MealName}">
                    <img src="../PNG/View Knap.PNG" alt="Details" />
                </button>
                <button class="delete-button" data-meal-name="${meal.MealName}">
                    <img src="../PNG/Delete Knap.PNG" alt="Delete" />
                </button>
            </div>
        `;
        mealsListContainer.appendChild(row); // Tilføjer rækken til containeren.

        // Tilføjer event listeners til knapper for visning af ernæring (details-button) og sletning.
        const detailsButton = row.querySelector('.details-button');
        detailsButton.addEventListener('click', function () {
            fetchMealIngredients(this.dataset.mealName); // Henter og viser ingredienser for det valgte måltid.
        });

        const deleteButton = row.querySelector('.delete-button');
        deleteButton.addEventListener('click', function () {
            deleteMeal(this.dataset.mealName); // Sletter det valgte måltid.
        });
    });
}

// Funktion til at hente ingredienser for et specifikt måltid.
function fetchMealIngredients(mealName) {
    fetch(`http://localhost:3000/api/getMealIngredients/${mealName}`) // API-kald for at hente ingredienser baseret på måltidets navn.
        .then(response => response.json()) // Parser svaret som JSON.
        .then(ingredients => {
            displayIngredients(ingredients, mealName); // Viser ingredienserne i en dialogboks.
        })
        .catch(error => console.error('Failed to fetch ingredients:', error)); // Logger en fejl hvis hentningen fejler.
}

// Funktion til at vise ingredienserne i en alert-boks.
function displayIngredients(ingredients, mealName) {
    let ingredientsText = `Ingredients for ${mealName}:\n`; // Starter teksten for alerten.
    ingredients.forEach(ingredient => {
        ingredientsText += `- ${ingredient.IngredientName}: ${ingredient.Grams} grams\n`; // Tilføjer hver ingrediens til teksten.
    });

    alert(ingredientsText); // Viser ingredienserne i en alert. På den måde får brugeren et hurtigt kig i ingredienserne.
}

// Funktion til at slette et måltid.
function deleteMeal(mealName) {
    const username = JSON.parse(localStorage.getItem('brugerSession')).brugernavn; // Henter brugernavn fra lokal lagring.
    fetch(`http://localhost:3000/api/deleteMeal/${username}/${mealName}`, { method: 'DELETE' }) // Udfører en DELETE-anmodning til serveren.
        .then(response => {
            if (response.ok) {
                alert('Meal deleted successfully!'); // Viser en succesmeddelelse hvis sletningen lykkes.
                loadMeals(); // Genindlæser måltider for at opdatere visningen.
            } else {
                throw new Error('Failed to delete meal'); // Kaster en fejl hvis serveren returnerer en fejlstatus.
            }
        })
        .catch(error => {
            console.error('Error deleting meal:', error); // Logger en fejl hvis der er netværksproblemer eller lignende.
            alert('Error deleting meal: ' + error.message); // Viser en fejlmeddelelse.
        });
}

// Når dokumentet er fuldt indlæst, kalder denne event listener loadMeals funktionen.
document.addEventListener('DOMContentLoaded', loadMeals);
