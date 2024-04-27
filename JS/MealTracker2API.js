// Denne funktion hjælper os med at finde et måltid i localStorage, baseret på det givne navn.
function findMealByName(mealName) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];  // Måltiderne som bliver hentet fra localStorage bliver .parse om til et array, og ellers bliver der brugt et tomt array som fallback. 
    return meals.find(meal => meal.name === mealName);  // Her bruger vi .find method (Array.find til netop, at finde et måltid med det specfikke navn. 
}

// Hjælpefunktion til at beregne kalorier baseret på gram
function calculateCaloriesForMeal(meal, grams) {
    if (!meal) return 0; // Tjekker om måltidet findes, hvis ikke returnerer den 0.
    return (meal.totalKcal / 100) * grams; // Beregner og returnerer antallet af kalorierer taget gram i betragtning. 
}

// Hjælpefunktion til at gemme den Meal vi prøver at tracke informationer på.
function saveTrackedMeal(mealName, waterIntake, mealType, grams) {
    const meal = findMealByName(mealName); // Finder måltid baseret på navn. 
    if (!meal) {
        alert('The meal was not found. Check the name and try again.');
        return; // Hvis måltidet ikke findes, får vi en alert, som fortæller os, at den specfikke meal ikke var fundet. 
    }

    // Denne sektion af kode, beregner vores samlede næringsindhold, og det bliver igen taget i betragtning af det indtastede gram.
    const calories = calculateCaloriesForMeal(meal, grams);
    const protein = (meal.totalProtein / 100) * grams;
    const fat = (meal.totalFat / 100) * grams;
    const fibers = (meal.totalFibers / 100) * grams;

    // Nedenstående kode opretter et objekt med sporet måltidsinformationer. 
    const trackedMeal = {
        id: Date.now().toString(), // Denne kode generer et unikt id baseret på nuværende tid. Det gør, at vær meal får deres eget unikke id. 
        name: mealName,
        type: mealType,
        grams: grams,
        calories: calories.toFixed(2), // Formatteret til to decimaler, dette gøres for kalorier, protein, fedt og fibre. 
        protein: protein.toFixed(2),
        fat: fat.toFixed(2),
        fibers: fibers.toFixed(2),
        water: waterIntake,
        date: new Date().toLocaleDateString()
    };


    console.log('Tracked Meal:', trackedMeal); // Koden her bliver tilføjet, da jeg gerne vil have vist vores objekt i konsollen.

    // Denne kode henter vores nuværende liste over sporede måltider. Hertil tilføjer den også det nye og gemmer listen igen. 
    let trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
    trackedMeals.push(trackedMeal);
    localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

    // Giver feedback til brugeren, at måltidet er blevet gemt.
    alert('The Meal is now getting tracked');
}

// Her tilføjer vi en event listener til dokumentet, der kører når vores HTML side er indlæst.
document.addEventListener('DOMContentLoaded', () => {
    // Formålet med koden her, er, at tilføje en event handler til "track Meal" hændelsen.
    const mealTrackerForm = document.getElementById('mealTrackerForm');
    mealTrackerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Forhindrer formen i at genindlæse siden.

        // Koden her indsamler vores værdier fra formularfelterne.
        const mealName = document.getElementById('mealNameInput').value;
        const waterIntake = document.getElementById('waterInput').value;
        const mealType = document.getElementById('mealTypeInput').value;
        const grams = parseFloat(document.getElementById('gramsInput').value);

        // Afslutningsvis kalder vi vores funktion til at gemme vores tracked meal med vores indsamlede værdier. 
        saveTrackedMeal(mealName, waterIntake, mealType, grams);
    });
});

