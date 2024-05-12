// Event handler der sikrer, at hele DOM'en er indlæst før scriptet eksekveres.
document.addEventListener('DOMContentLoaded', async () => {
// Hent DOM-elementer til interaktion.
    const categorySelect = document.getElementById('activity-options');
    const activitySelect = document.getElementById('specific-activity-options');
    const hoursInput = document.getElementById('activity-duration-hours');
    const minutesInput = document.getElementById('activity-duration-minutes');
    const calculateButton = document.getElementById('calculate-calories');
    const caloriesBurnedDisplay = document.getElementById('calories-burned');
    const basalMetabolismDisplay = document.getElementById('basal-metabolism');
    const userDetailsDisplay = document.getElementById('user-weight-height');

    // Asynkron funktion til at hente brugerdetaljer fra serveren baseret på brugersession.
    async function fetchUserDetails() {
        const userSession = JSON.parse(localStorage.getItem('brugerSession')); // Henter brugersession fra localStorage.
        const username = userSession ? userSession.brugernavn : null; 

        if (!username) { // Hvis ingen bruger er logget ind, returneres en besked i konsollen.
            console.log('No user logged in');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/userDetails/${username}`); // Henter brugerdetaljer fra serveren.
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }
    // Henter og viser brugerdetaljer.
    const userDetails = await fetchUserDetails();
    if (userDetails) {
        const { Age, Weight, Height, Gender } = userDetails;
        const basalMetabolism = Gender.toLowerCase() === 'male' ? 
            calculateBasalMetabolismMale(Age, Weight, Height) : 
            calculateBasalMetabolismFemale(Age, Weight, Height);

        document.getElementById('basal-metabolism').textContent = `${basalMetabolism.toFixed(2)} MJ`;
        document.getElementById('user-weight-height').textContent = `Weight: ${Weight} kg, Height: ${Height} cm`;
    }

    // Henter kategorier af aktiviteter fra serveren og opdater dropdown-menuen.
    if (!categorySelect) return;

    try {
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        if (!categoriesResponse.ok) {
            throw new Error(`HTTP error! Status: ${categoriesResponse.status}`);
        }
        const categories = await categoriesResponse.json();
        categories.forEach(category => {
            const option = new Option(category.Kategori, category.Kategori);
            categorySelect.add(option);
        });
    } catch (error) {
        console.error('Failed to fetch categories:', error.message);
    }

    // Opdatere aktivitetsvalg når en kategori vælges.
    categorySelect.addEventListener('change', async (event) => {
        try {
            const category = event.target.value;
            const activitiesResponse = await fetch(`http://localhost:3000/api/activities/${category}`);
            if (!activitiesResponse.ok) {
                throw new Error(`HTTP error! Status: ${activitiesResponse.status}`);
            }
            const activities = await activitiesResponse.json(); // Henter aktiviteter fra serveren baseret på valgt kategori.
            activitySelect.innerHTML = '';
            activitySelect.appendChild(new Option("Select Specific Activity", ""));
            activities.forEach(activity => {
                const option = new Option(activity.AktivitetsNavn, activity.AktivitetsNavn); // Tilføjer aktiviteter til dropdown-menuen.
                option.dataset.kcalPerTime = activity.KcalPerTime;
                activitySelect.add(option);
            });
        } catch (error) {
            console.error('Failed to fetch activities:', error.message);
        }
    });
    
    // Nedenstående kode udregner kalorieforbrug baseret på valgte aktiviteter og tid.
    calculateButton.addEventListener('click', () => {
        // Tjek om inputfelterne er tomme og sæt dem til 0 hvis ja
        const hours = hoursInput.value.trim() === '' ? 0 : parseFloat(hoursInput.value) || 0;
        const minutes = minutesInput.value.trim() === '' ? 0 : parseFloat(minutesInput.value) || 0;
    
        // Udregning af den samlede tid i timer
        const totalTimeInHours = hours + (minutes / 60);
    
        const selectedActivity = activitySelect.options[activitySelect.selectedIndex]; // Henter den valgte aktivitet fra dropdown-menuen.
        if (selectedActivity && selectedActivity.dataset.kcalPerTime) { // Tjekker om aktiviteten er valgt og har en kalorieværdi.
            const kcalPerHour = parseFloat(selectedActivity.dataset.kcalPerTime); // Henter kalorieværdien for aktiviteten.
            const totalCaloriesBurned = kcalPerHour * totalTimeInHours; // Udregner det samlede kalorieforbrug.
            caloriesBurnedDisplay.textContent = `${totalCaloriesBurned.toFixed(2)} kcal`; // Opdaterer teksten for kalorieforbrug.
    
            // Nedenstående kode opdaterer teksten for tidsangivelse baseret på værdierne
            const hoursText = hours === 1 ? 'hour' : 'hours'; 
            const minutesText = minutes === 0 ? 'minutes' : (minutes === 1 ? 'minute' : 'minutes');
            document.getElementById('total-time-spent').textContent = `Duration: ${hours} ${hoursText} and ${minutes} ${minutesText}`;
        }
        /** parseInt bruges til at konvertere inputværdierne til heltal. Dette sikrer, 
        at sammenligningen med 1 fungerer korrekt uden potentielle fejl forårsaget af strenge sammenligninger.
        hoursText og minutesText variabler er defineret for at håndtere flertalsformen 
        baseret på antallet af timer eller minutter. Hvis antallet er 1, bruges entalsformen 
        ("hour" eller "minute"); hvis det er mere end 1, bruges flertalsformen ("hours" eller "minutes"). */
    });


    // Tilføj funktionalitet til at spore aktivitet med POST-request til server.
    const trackActivityButton = document.getElementById('track-activity'); // Henter knappen til at spore aktivitet.
    trackActivityButton.addEventListener('click', async () => { // Event listener til at spore aktivitet.
        const userSession = JSON.parse(localStorage.getItem('brugerSession')); // Henter brugersession fra localStorage.
        const username = userSession.brugernavn; 
        const activityName = activitySelect.value; // Henter aktivitetsnavn fra dropdown-menuen.
        const kcalPerHour = parseFloat(activitySelect.options[activitySelect.selectedIndex].dataset.kcalPerTime); // Henter kalorieværdien for aktiviteten.
        const duration = parseFloat(hoursInput.value) + parseFloat(minutesInput.value) / 60; // Udregner den samlede tid i timer.
        const caloriesBurned = kcalPerHour * duration; // Udregner det samlede kalorieforbrug.
    
        // Her tilføjer jeg 2 timer til den nuværende dato, da tidszonen SQL tager udgangspunkt er anderledes til vores. Vi er 2 timer foran. 
        let activityDate = new Date(); // Henter den nuværende dato.
        activityDate.setHours(activityDate.getHours() + 2); // Tilføjer 2 timer til den nuværende tid.
        activityDate = activityDate.toISOString(); // Konverterer datoen til en ISO-string.

        // Her sendes data til serveren for at gemme aktiviteten.
        try {
            const response = await fetch('http://localhost:3000/api/trackActivity', { // Sender data til serveren.
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ // Konverterer data til JSON-format.
                    username: username,
                    activityName: activityName,
                    caloriesBurned: caloriesBurned,
                    duration: duration,
                    activityDate: activityDate
                })
            });
    
            if (response.ok) {
                alert('Activity saved!');
            } else {
                const responseData = await response.json();
                throw new Error(responseData.message);
            }
        } catch (error) {
            console.error('Fejl ved at gemme aktivitet:', error);
            alert('Fejl ved at gemme aktivitet.');
        }
    });
    
});


// Nedenstående er funktionerne for beregning af basalstofskiftet for henholdsvis kvinder og mænd.
// Funktion til at beregne basalstofskiftet for kvinder
function calculateBasalMetabolismFemale(age, weight, height) {
    let basalMetabolism;

    if (age < 3) {
        basalMetabolism = (0.068 * weight) + (4.28 * height) - 1.73;
    } else if (age >= 4 && age <= 10) {
        basalMetabolism = (0.071 * weight) + (0.68 * height) + 1.55;
    } else if (age >= 11 && age <= 18) {
        basalMetabolism = (0.035 * weight) + (1.95 * height) + 0.84;
    } else if (age >= 19 && age <= 30) {
        basalMetabolism = (0.0615 * weight) + 2.08;
    } else if (age >= 31 && age <= 60) {
        basalMetabolism = (0.0364 * weight) + 3.47;
    } else if (age >= 61 && age <= 75) {
        basalMetabolism = (0.0386 * weight) + 2.88;
    } else {
        basalMetabolism = (0.041 * weight) + 2.61;
    }

    return basalMetabolism;
}

// Funktion til at beregne basalstofskiftet for mænd
function calculateBasalMetabolismMale(age, weight, height) {
    let basalMetabolism;

    if (age < 3) {
        basalMetabolism = (0.0007 * weight) + 6.35 - 2.58;
    } else if (age >= 4 && age <= 10) {
        basalMetabolism = (0.082 * weight) + (0.55 * height) + 1.74;
    } else if (age >= 11 && age <= 18) {
        basalMetabolism = (0.068 * weight) + (0.57 * height) + 2.16;
    } else if (age >= 19 && age <= 30) {
        basalMetabolism = (0.064 * weight) + 2.84;
    } else if (age >= 31 && age <= 60) {
        basalMetabolism = (0.0485 * weight) + 3.67;
    } else if (age >= 61 && age <= 75) {
        basalMetabolism = (0.0499 * weight) + 2.93;
    } else {
        basalMetabolism = (0.035 * weight) + 3.43;
    }

    return basalMetabolism;
}
