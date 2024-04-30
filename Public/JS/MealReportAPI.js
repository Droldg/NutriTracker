// Denne funktion bruges til at hente alle sporede måltider fra localStorage.
function getAllTrackedMeals() {
    return JSON.parse(localStorage.getItem('trackedMeals')) || []; // Hvis der ikke findes nogen sporede måltider, bliver et tomt array retuneret. 
}

// Denne funktion bruges til at beregne samlet ernæring og vandindtag for en given dato
function calculateDailyNutritionAndHydration(date) {
    const trackedMeals = getAllTrackedMeals().filter(meal => meal.date === date);  // Her bliver de sporede måltider filtreret for at finde dem, der matcher den givne dato.

    // Nedenunder gør vi brug af .reduce method, for at reducerer de filtrerede måltider til et enkelt objekt, der indeholder de samlede ernæringsværdier.
    return trackedMeals.reduce((totals, meal) => {
        // Her tjekker vi hver enæringsværdi for at sikrer os, at der et tale om et tal. Ellers bliver værdien sat til 0.
        totals.kcal += Number(meal.calories) || 0;
        totals.protein += Number(meal.protein) || 0;
        totals.fat += Number(meal.fat) || 0;
        totals.fibers += Number(meal.fibers) || 0;
        totals.water += Number(meal.water) || 0;
        return totals;
    }, { kcal: 0, protein: 0, fat: 0, fibers: 0, water: 0 });
}


// Dette er en hjælpefunktion til at få unikke datoer fra de sporede måltider.
function getUniqueDatesFromTrackedMeals() {
    // Her henter vi alle datoerne fra de sporede måltider.
    const trackedMeals = getAllTrackedMeals();
    const dates = trackedMeals.map(meal => meal.date);
    // Her bruges et Set til at sikre, at hver dato kun er repræsenteret én gang.
    // Mere specifikt er et Set en samling, hvor hvert element kun kan forekomme én gang, hvilket sikrer unikke værdier.
    return [...new Set(dates)];
}

// Dette er en funktion, som viser Nutri Report i brugergrænsefladen.
function displayNutriReport() {
    const reportContainer = document.getElementById('nutri-report-container');
    reportContainer.innerHTML = ''; // Dette rydder nuværende indhold for at undgå duplikationer. 
    const uniqueDates = getUniqueDatesFromTrackedMeals(); // Koden her henter de unikke datoer fra de sporede måltider. 

    uniqueDates.forEach(date => {
        // Her bliver den daglige ernæring og hydrering beregnet baseret på måltider for hver unik dato. For at kigge på hver enkel unik dato, har et .forEach loop været relevant at bruge. 
        const { kcal, protein, fat, fibers, water } = calculateDailyNutritionAndHydration(date);
        const mealsCount = getAllTrackedMeals().filter(meal => meal.date === date).length;  // Her findes antallet af måltider for datoen.

        // Her oprettes en ny række til rapporten og tilføjer den beregnede ernæringsinformation.

        const reportRow = document.createElement('div');
        reportRow.classList.add('table-row');
        reportRow.innerHTML = `
            <div class="row-item">${date}</div>
            <div class="row-item">${mealsCount} Meals</div>
            <div class="row-item">${water.toFixed(1)} L Water</div>
            <div class="row-item">${kcal.toFixed(2)} kcal</div>
            <div class="row-item">${protein.toFixed(2)} g Protein</div>
            <div class="row-item">${fat.toFixed(2)} g Fat </div>
            <div class="row-item">${fibers.toFixed(2)} g Fiber</div>
        `;

        reportContainer.appendChild(reportRow);  // Koden her tilføjer den nye række til containeren i DOM'en.
    });
}
// Når DOM'en er klar, kalder denne event listener 'displayNutriReport' for at vise rapporten.
document.addEventListener('DOMContentLoaded', displayNutriReport);

