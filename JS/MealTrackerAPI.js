// Til at starte med, tilføjer vi en event listener, der kører 'loadTrackedMeals' funktionen, hvilket vil ske når DOM'en er fuldt indlæst. 
document.addEventListener('DOMContentLoaded', () => {
    loadTrackedMeals();
});

// Nedenstående kode er en funktion der bruges til at indlæse og vise vores sporede måltider fra localStorage, som vi gennemgik i MealTrackerAPI2.js filen. 
function loadTrackedMeals() {
    const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || []; // Dette henter de sporede måltider fra localStorage, og ellers starter vi med et tomt array. 
    const mealsListContainer = document.getElementById('mealsList'); // Her bliver der refereret til HTML-elementet, hvor måltiderne skal vises. 
    mealsListContainer.innerHTML = ''; // Dette fjerner eksisterende indhold i containeren. 


    // Løber igennem hvert sporet måltid og opretter en visuel repræsentation.
    // Vores .forEach loop løber igennem hvert sporet måltid og opretter derudover en visuel visning. Det nedenstående bliver altså tilføjet indtil html dokumentet, som dermed bliver fremvist visuelt på min side.
    trackedMeals.forEach((meal, index) => {
        const row = document.createElement('div'); // Her bliver der oprettet et nyt div-element for hvert måltid. 
        row.className = 'table-row'; // Dette sætter klassen for hver ny række, hvilket gøres for styling. 
        // Den nedenstående del af koden, indsætter direkte i HTML, hvoraf vores måltidets data bliver indsat. 
        row.innerHTML = `
        <div class="row-item">${meal.name}</div>
        <div class="row-item">${meal.type}</div>
        <div class="row-item">
            ${meal.grams}g & 
            ${meal.calories} kcal & 
            ${meal.protein || 0}g protein & 
            ${meal.fat || 0}g fedt & 
            ${meal.fibers || 0}g fibre
        </div>
        <div class="row-item">${meal.water} L</div>
        <div class="row-item">${meal.date}</div>
            <div class="row-item">
                <button class="delete-button" data-meal-index="${index}"><img src="../PNG/Delete Knap.PNG" alt="Delete"></button>
            </div>
        `;

        mealsListContainer.appendChild(row); // Denne kode til sidst, tilføjer den nye række til vores container-element. 
    });


    addDeleteEventListeners(); // Afslutningsvis, tilføjer vi vores slette knap, som gøre det muligt for brugeren at slette en tracked meal. 
}

// Den nedenstående funktion tilføjer altså event listeners til alle sletteknapper. 
function addDeleteEventListeners() {
    document.querySelectorAll('.delete-button').forEach(button => {    // Nedenstående bliver alle sletteknapper i dokumentet fundet ved brug af .forEach loop, hvortil der bliver tilføjet en "click" event listener. 
        button.addEventListener('click', function () {
            const mealIndex = parseInt(this.dataset.mealIndex, 10);    // Her bliver index for det måltid hentet, som skal slettes fra data-attributten.
            deleteTrackedMeal(mealIndex);       // Afslutningsvis kalder vi funktionen til at slette måltidet. 
        });
    });
}

// Her tilføjer vi en funktion, skal skal tilføje vandindtagelse til de sporede måltider. 
function addWaterTracking() {
    let waterIntake = prompt("How much water have you drunk in liters?", "0.5"); // Bruger prompt til at få input fra brugeren.
    if (waterIntake) {

        // Nedenunder erstatter komma med punktum for at kunne parse strengen til et korrekt tal. 
        waterIntake = waterIntake.replace(',', '.');

        // Nedenunder bliver der valideret om hvorvidt det er et gyldigt tal efter erstatning.
        const waterVolume = parseFloat(waterIntake);
        if (isNaN(waterVolume)) {
            alert("Please enter a valid number for the amount of water.");
            return;
        }

        // Nedenunder har jeg gjort det muligt for brugeren, at kunne indtaste vandindtag, uden at skulle spise noget. 
        // Også derfor er gram og calories på 0.
        const waterMeal = {
            id: Date.now().toString(), // Et unikt ID til indgangen
            name: "Water",
            type: "Hydration",
            grams: 0,
            calories: 0,
            water: waterVolume, // Konverter input til et tal
            date: new Date().toLocaleDateString() // Dagens dato
        };

        // Her nedenunder bliver den nuværende liste over sporede måltider hentet, hvortil der bliver tilføjet det nye "vandmåltid".
        let trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        trackedMeals.push(waterMeal);
        // Til sidst bliver den opdateret gemt tilbage i localStorage. 
        localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));
        loadTrackedMeals(); // Her opdateres listen med måltider på siden. 
    }
}


// Denne funktion bruges til at formatere vandvolumen med komma som decimaltegn. 
function displayWaterVolume(volume) {
    return volume.toString().replace('.', ',');
} // Årsagen til at der så stor fokus på vand er, at jeg gerne vil gøre det muligt for brugeren, at taste med komma ind i vores prompt, hvorefter resultatet komme ud med punktum, fx 1.2 L, 1.7 L osv.


// Denne funktion gør det muligt for brugeren at slette et sporet måltid. 
function deleteTrackedMeal(mealIndex) {
    let trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || []; // Her bliver den nuværende liste af sporede måltider hentet. 
    trackedMeals.splice(mealIndex, 1); // Fjerner det specfikke måltid fra listen baseret på index. 
    localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals)); // Dette gemmer den opdaterede liste tilbage i localStorage.
    loadTrackedMeals(); // Genindlæser de sporede måltider for at opdatere visningen
}
