// Dette henter dagens dato som en streng. 


function getTodayDateString() {
    return new Date().toLocaleDateString();
}
// Nedenstående kode henter data for den aktuelle dag fra localStorage. 
function getTodaysData() {
    // Her henter jeg alle gemte måltider eller laves der et tomt array, hvis der ikke findes nogen.
    const allData = JSON.parse(localStorage.getItem('trackedMeals')) || [];
    // Derudover filtrerer jeg også data for kun at inkludere måltider fra i dag.
    return allData.filter(data => data.date === getTodayDateString());
}
//Formålet med nedenstående funktion er, at beregne totalerne for dagens data. Dvs. totale meals, protein, kcal og water.
function calculateTodaysTotals() {
    // Her bliver dagens data hentet
    const todaysData = getTodaysData();
    // Her reducerer jeg dagens data til et enkelt totalobjekt. 
    const totals = todaysData.reduce((acc, curr) => {
        acc.meals += 1; // Her tæller jeg et måltid for hver post.
        // Nedenunder lægger jeg kalorier, proteiner, og vand til og konverterer det til tal. 
        // || 0 bruges som fallback, hvis konvertering mislykkes. Dette betyder, at der komme til at så 0 istedet for "NaN", hvis der forekommer problemer.
        acc.kcal += Number(curr.calories) || 0;
        acc.protein += Number(curr.protein) || 0;
        acc.water += Number(curr.water) || 0;
        return acc; // Her returner jeg det akkumulerede resultat, altså vores totale. 
        // Her initialiserer jeg totals med 0-værdier, for at sikre, at der er en startværdi for hver næringskategori. 
        // Dvs. at selv hvis der ikke findes nogen data for den enkelte dag, vil jeg undgå JavaScript fejl ift. undefined eller null-værdier. 
        // Derudover hjælper dette også med, at sikre en korrekt opsamling af min data, da der vil være en gyldig numerisk værdi at lægge til. 
    }, { meals: 0, kcal: 0, protein: 0, water: 0 });
    return totals;
}

// Opdaterer Dashboardet med dagens totaler
function updateDashboard() {
    // Her henter jeg dagens totaler, hvilket gøres fra ovenstående kode.
    const { meals, kcal, protein, water } = calculateTodaysTotals();

    // Her opdaterer jeg vores DOM-elementer med vores beregnede værdier
    document.getElementById('meals-today').textContent = meals + ' Meals';
    document.getElementById('energy-today').textContent = kcal.toFixed(2) + ' kcal';
    document.getElementById('water-today').textContent = water.toFixed(2) + ' L';
    document.getElementById('protein-today').textContent = protein.toFixed(2) + ' g';
}

// Afslutningsvis kalder vi vores Event Listener, for at sikre at elementerne er indlæst.
document.addEventListener('DOMContentLoaded', updateDashboard);



