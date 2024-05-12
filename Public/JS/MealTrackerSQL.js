// Kode udføres, når hele DOM-indholdet er fuldt indlæst.
document.addEventListener('DOMContentLoaded', function () {
    // Henter brugernavn fra browserens localStorage.
    const username = JSON.parse(localStorage.getItem('brugerSession')).brugernavn;
    // Finder HTML-elementet, hvor måltider skal vises.
    const mealsListContainer = document.getElementById('mealsList');

    // Tilføjelse af eventlistener til plus-knappen for at logge vandforbrug.
    document.querySelector('.plus-button1').addEventListener('click', function () {
        let liters = prompt("How much water have you consumed in liters?");
        if (liters) {
            liters = normalizeDecimalInput(liters);
            if (!isNaN(liters) && liters > 0) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        const { latitude, longitude } = position.coords;
                        trackWaterIntake(username, liters, latitude, longitude);
                    }, function (error) {
                        console.error('Geolocation error:', error);
                        trackWaterIntake(username, liters); // Logger vandforbrug uden geolokation.
                    });
                } else {
                    alert("Geolocation is not supported by this browser.");
                    trackWaterIntake(username, liters);
                }
            } else {
                alert("Please enter a valid number of liters.");
            }
        }
    });

    // Funktion til at normalisere decimalinput, konverterer komma til punktum. Dette giver brugeren mulighed for at indtaste decimaltal med komma eller punktum.
    function normalizeDecimalInput(input) { 
        return parseFloat(input.replace(',', '.'));
    }

    // Funktion til at logge vandforbrug i systemet med mulighed for geolokation.
    function trackWaterIntake(username, liters, latitude = null, longitude = null) {
        const now = new Date();
        now.setTime(now.getTime() + (2 * 60 * 60 * 1000)); // Justering for tidszone, da SQL-serveren er 2 timer bagud.

        // Sammensætter dataobjekt for vandindtag.
        const data = {
            username: username,
            mealName: "Water",
            mealType: "Hydration",
            totalGrams: 0,
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalFibers: 0,
            waterConsumed: liters,
            creationDate: now.toISOString(),
            locationLatitude: latitude,
            locationLongitude: longitude
        };

        // Sender data til serveren via POST request.
        fetch('http://localhost:3000/api/addTrackedMeal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Water logged successfully');
                    location.reload(); // Genindlæser siden for at opdatere data.
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Failed to track water:', error);
                alert('Error logging water: ' + error.message);
            });
    }

    // Henter og viser måltider fra databasen baseret på brugernavn.
    fetch(`http://localhost:3000/api/getTrackedMeals/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(meals => { // Viser måltiderne i brugergrænsefladen.
            meals.forEach((meal) => { // Itererer gennem hvert måltid og opretter en række i tabellen.
                const row = document.createElement('div');
                row.className = 'table-row';
                row.innerHTML = `
                    <div class="row-item">${meal.MealName}</div>
                    <div class="row-item">${meal.MealType}</div>
                    <div class="row-item">
                        ${meal.TotalGrams || 0}g & 
                        ${meal.TotalCalories ? meal.TotalCalories.toFixed(2) : '0'} Kcal & 
                        ${meal.TotalProtein ? meal.TotalProtein.toFixed(2) : '0'}g Protein & 
                        ${meal.TotalFat ? meal.TotalFat.toFixed(2) : '0'}g Fat & 
                        ${meal.TotalFibers ? meal.TotalFibers.toFixed(2) : '0'}g Fiber
                    </div>
                    <div class="row-item">${meal.WaterConsumed || '0'} L</div>
                    <div class="row-item">${new Date(meal.CreationDate).toLocaleDateString()}</div>
                    <div class="row-item">
                        <button class="edit-button" data-tracker-id="${meal.TrackerID}" data-is-water="${meal.TotalGrams === 0 ? 'true' : 'false'}"><img src="../PNG/Rediger Knap.PNG" alt="Edit"></button>
                        <button class="delete-button" data-tracker-id="${meal.TrackerID}"><img src="../PNG/Delete Knap.PNG" alt="Delete"></button>
                    </div>
                `;
                mealsListContainer.appendChild(row);

                // Tilføjelse af funktionalitet til slet-knap.
                row.querySelector('.delete-button').addEventListener('click', function () { // Sletter måltidet fra systemet og brugergrænsefladen.
                    deleteMeal(this.dataset.trackerId, row);
                });

                // Tilføjelse af funktionalitet til rediger-knap.
                row.querySelector('.edit-button').addEventListener('click', function () { // Åbner en prompt til redigering af måltid.
                    const isWater = this.dataset.isWater === 'true'; // Tjekker om det er vandforbrug.
                    let promptMessage = isWater ? "Enter new liters of water" : "Enter new grams for " + meal.MealName;
                    let newMeasurement = prompt(promptMessage); // Prompt til at indtaste ny måling.
                    if (newMeasurement) {
                        newMeasurement = normalizeDecimalInput(newMeasurement); // Normaliserer input til decimaltal.
                        if (!isNaN(newMeasurement)) { // Tjekker om input er et gyldigt tal.
                            if (isWater) { 
                                editMeal(meal.TrackerID, null, newMeasurement, true);
                            } else {
                                editMeal(meal.TrackerID, newMeasurement, meal.TotalGrams, false);
                            }
                        } else {
                            alert("Please enter a valid number.");
                        }
                    }
                });
            });
        })
        .catch(error => console.error('Error loading tracked meals:', error));
});

// Funktion til at opdatere måltid eller vandforbrug i systemet.
function editMeal(trackerID, newGrams, newLiters, isWater) {
    const data = {
        grams: parseFloat(newGrams),
        liters: parseFloat(newLiters),
        isWater: isWater
    };

    // Sender opdaterede data til serveren.
    fetch(`http://localhost:3000/api/editTrackedMeal/${trackerID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Meal updated successfully');
                location.reload(); // Genindlæser siden for at vise opdaterede data.
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error updating meal:', error);
            alert('Error updating meal: ' + error.message);
        });
}

// Funktion til at slette et måltid fra systemet og brugergrænsefladen.
function deleteMeal(trackerId, rowElement) {
    fetch(`http://localhost:3000/api/deleteTrackedMeal/${trackerId}`, { method: 'DELETE' }) // Udfører en DELETE-anmodning til serveren.
        .then(response => { // Viser en succesmeddelelse hvis sletningen lykkes, og genindlæser måltider for at opdatere visningen.
            if (!response.ok) {
                throw new Error('Failed to delete meal');
            }
            rowElement.remove();  // Fjerner rækken fra brugergrænsefladen.
            alert('Meal deleted successfully');
        })
        .catch(error => {
            console.error('Error deleting meal:', error);
            alert('Error deleting meal: ' + error.message);
        });
}
