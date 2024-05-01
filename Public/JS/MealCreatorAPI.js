function loadMeals() {
    // Her loader vi vores meals, hvor vi gør brug af JSON. Her gør vi også brug af .parse method, da vores string skal konverteres til et object. Kort sagt, vi henter vi de gemte måltider fra localStorage
    const meals = JSON.parse(localStorage.getItem('meals')) || []; // Henter måltider eller tom liste, hvis ikke fundet.
    const mealsListContainer = document.querySelector('#meals-list-container'); // Ny selector for den dedikerede container
    mealsListContainer.innerHTML = ''; // Dette tømmer containeren før genindlæsning af måltider


    // Her gør jeg brug af .forEach loop for hvert måltid i listen og opretter en række for hvert måltid.
    meals.forEach((meal, index) => {
        // Opret HTML elementer for hvert måltid og tilføj dem til mealsContainer
        const row = document.createElement('div');
        row.className = 'table-row';
        row.dataset.mealId = meal.id; // Dette sørger for at hver måltid har et unikt ID

        row.innerHTML = `
            <div class="row-item">#${index + 1}</div>
            <div class="row-item">${meal.name}</div>
            <div class="row-item">${meal.totalKcal} kcal, ${meal.totalProtein}g, ${meal.totalFat}g, ${meal.totalFibers}g </div>
            <div class="row-item">${meal.addedOn}</div>
            <div class="row-item">${meal.ingredients.length}</div>
            
            <div class="row-item">
            <button class="delete-button" data-meal-id="${meal.id}"><img src="../PNG/Delete Knap.PNG" alt="Delete"></button>
            </div>
        `; // Ovenstående informationer bliver lagt direkte ind i vores HTML. 

        mealsListContainer.appendChild(row); // Dette tilføjer vores nye række til containeren. 

        // Her bliver der tilføjet et click-event til sletteknappen, som kalder deleteMeal-funktionen.
        const deleteButton = row.querySelector('.delete-button');
        deleteButton.addEventListener('click', function () {
            deleteMeal(this.dataset.mealId);
        });
    });
}

function deleteMeal(mealId) {

    console.log('mealId is', mealId); // Dette logger ID'et på det måltid, der skal slettes.

    // Dette henter den aktuelle liste af måltider, og filtrer for at fjerne det valgte måltid. 
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals = meals.filter(meal => {
        console.log('Current meal id is', meal.id); // Dette logger hver måltids ID og tjekker for undefined ID'er.

        if (meal.id === undefined) {
            console.error('Undefined id for meal:', meal);
        }
        return meal.id !== undefined && meal.id.toString() !== mealId.toString();
    });

    // Gemmer localStorage med det nye array af måltider
    localStorage.setItem('meals', JSON.stringify(meals));


    // Nedenstående kode finder og fjerner det slettede måltids element fra DOM.
    const mealElement = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (mealElement) {
        mealElement.closest('.table-row').remove();
    }
}

// Afslutningsvis loader måltidslisten, når dokumentet er klar.
document.addEventListener('DOMContentLoaded', loadMeals);

