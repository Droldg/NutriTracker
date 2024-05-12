
// Funktion til at hente brugeroplysninger fra backend
async function fetchUserInformation() {
    try {
        // Henter brugernavnet fra localStorage
        const brugerSession = JSON.parse(localStorage.getItem('brugerSession'));
        const username = brugerSession.brugernavn

        // Kontroller om brugernavnet findes i localStorage
        if (!username) {
            throw new Error('Username not found in localStorage');
        }

        // Udfører en HTTP GET-request til serveren for at hente brugeroplysninger
        const response = await fetch(`http://localhost:3000/api/getUserInformation/${username}`);
        
        // Tjekker om serverens respons er ok (HTTP status code 200)
        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        // Konverterer svaret fra serveren til JSON-format
        const userData = await response.json();

         // Returnerer brugerdata som et JavaScript-objekt
        return userData;
    } catch (error) {
        // Logger fejlen i konsollen og kaster fejlen videre
        console.error('Error fetching user information:', error);
        throw error;
    }
}

//Fetch funktion til backend server, som henter alder og køn for brugernavn i Local Storage
async function fetchGender() {
    try {
        // Henter brugernavnet fra localStorage
        const brugerSession = JSON.parse(localStorage.getItem('brugerSession'));
        const username = brugerSession.brugernavn;

        // Kontrollerer, at brugernavnet findes i localStorage
        if (!username) {
            throw new Error('Username not found in localStorage');
        }

        // Udfører en forespørgsel til serveren for at hente køn og alder
        const response = await fetch(`http://localhost:3000/api/getUserAge/${username}`);

        // Tjekker responsens status for at sikre, at informationen blev hentet korrekt
        if (!response.ok) {
            throw new Error('Failed to fetch gender');
        }

        // Konverterer responsen til JSON-format
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching gender:', error);
        throw error;
    }
}


// Funktion til at behandle og indsætte data på dags-view
async function dataBehandling() {
    let userData = await fetchUserInformation();

    // Starter med et tomt array, som dataen pakkes ind i og dermed nemmere indsættes
    let dailyData = [];

    // Nedenstående gennemgår aktivitetsdata
    userData.activityData.forEach(activity => {
        let date = new Date(activity.ActivityDate).toLocaleDateString();
        let existingItem = dailyData.find(item => item.Tid === date);

        if (existingItem) { // Hvis der allerede er data for den pågældende dato, opdateres det
            existingItem.KcalForbraendt += activity.CaloriesBurned;
        } else {
            let dailyItem = { 
                Tid: date,
                KcalIndtaget: 0,
                LiterIndtaget: 0,
                KcalForbraendt: activity.CaloriesBurned,
                OverUnderskud: 0
            };
            dailyData.push(dailyItem);
        }
    });

    // Nedenstående kode gennemgår måltider
    userData.meals.forEach(meal => {
        let date = new Date(meal.CreationDate).toLocaleDateString();
        let existingItem = dailyData.find(item => item.Tid === date);

        if (existingItem) {
            existingItem.KcalIndtaget += meal.TotalCalories;
        } else {
            let dailyItem = { 
                Tid: date,
                KcalIndtaget: meal.TotalCalories,
                LiterIndtaget: 0,
                KcalForbraendt: 0,
                OverUnderskud: 0
            };
            dailyData.push(dailyItem);
        }
    });

    // Sorterer dataene efter dato, så de nyeste kommer først
    dailyData.sort((a, b) => {
        const dateA = new Date(a.Tid);
        const dateB = new Date(b.Tid);
        return dateA - dateB;
    });

    // Returnerer det forarbejdede og sorterede data som et array af objekter
    return dailyData;
}

// Funktion til at hente data fra backend og vise det i brugergrænsefladen, altså i tabellen på html-siden
dataBehandling().then(items => {
    // Kald displayItems-funktionen med det returnerede dataobjekt
    displayItems(items);
});


// Hjælpefunktion til at beregne anbefalet dagligt indtag af kalorier ud fra Køn og alder
function beregnKalorier(gender, alder) {
    let kalorier = 0;
    if (alder >= 19 && alder <= 30) {
        if (gender === 'Female') {
            kalorier = 2200;
        } else if (gender === 'Male') {
            kalorier = 2800;
        }
    } else if (alder >= 31 && alder <= 60) {
        if (gender === 'Female') {
            kalorier = 2150;
        } else if (gender === 'Male') {
            kalorier = 2700;
        }
    } else if (alder > 60) {
        if (gender === 'Female') {
            kalorier = 2000;
        } else if (gender === 'Male') {
            kalorier = 2450;
        }
    }
    
    // Returnerer den beregnede værdi af dagligt kalorieindtag
    return kalorier;
}

// Funktion til at beregne over- eller underskud af kalorier
async function overUnderSkud() {

    let a = await fetchUserInformation();
    //console.log(a)
    let b = await fetchGender();
    let gender = b.Gender
    let age = b.Age
    const kalorier = beregnKalorier(gender, age);
    return kalorier
}

/////////////////24TIMERSVISNING///////////////////

// Funktion til at behandle data for 24-timers-visning
async function processData(jsonData) {
    // Objekt til at holde data for hver time
    let hourlyData = {};

    // Gennemgå aktivitetsdata
    jsonData.activityData.forEach(activity => { // For hver aktivitet i aktivitetsdata
        let date = new Date(activity.ActivityDate);
        let hour = date.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = {
                Hour: hour,
                ActivityCaloriesBurned: 0,
                MealTotalCalories: 0,
                TrackerWaterConsumed: 0
            };
        }
        hourlyData[hour].ActivityCaloriesBurned += activity.CaloriesBurned;
    });

    // Nedenstående kode gennemgår måltider data.
    jsonData.meals.forEach(meal => {
        let date = new Date(meal.CreationDate);
        let hour = date.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = {
                Hour: hour,
                ActivityCaloriesBurned: 0,
                MealTotalCalories: 0,
                TrackerWaterConsumed: 0
            };
        }
        hourlyData[hour].MealTotalCalories += meal.TotalCalories;
    });

    // Nedenstående kode gennemgår tracker data.
    jsonData.trackerData.forEach(tracker => {
        let date = new Date(tracker.CreationDate);
        let hour = date.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = {
                Hour: hour,
                ActivityCaloriesBurned: 0,
                MealTotalCalories: 0,
                TrackerWaterConsumed: 0
            };
        }
        hourlyData[hour].TrackerWaterConsumed += tracker.WaterConsumed || 0;
    });

    // Konverter hourlyData til et array
    let hourlyDataArray = Object.values(hourlyData);

    return hourlyDataArray;
}



//Indsætter table header for 24-timers-view
async function insertTableHeader24HoursView() {
   

    const header = document.querySelector('.table-header');
    header.innerHTML = `
    <div class="header-item">Time</div>
    <div class="header-item">Kcal indtaget(+)</div>
    <div class="header-item">Liter indtaget</div>
    <div class="header-item">Kcal forbrændt(-)</div>
    <div class="header-item">Over-/Underskud <br> for dagen</div>
    `;
}

async function displayItems24HoursView(dailyData, norm) {
    dailyData.sort((a, b) => a.Hour - b.Hour);

    const overblik = document.querySelector('#overblik');
    overblik.innerHTML = '';

    dailyData.forEach(item => {
        const formattedHour = `${item.Hour}:00`;
        const overUnder1 = norm - item.ActivityCaloriesBurned + item.MealTotalCalories;
        
        const overUnder = overUnder1.toFixed(0);

        // Beregn balance
        const literBalance = item.TrackerWaterConsumed ; 
        const kcalForbraendtBalance = item.ActivityCaloriesBurned;

        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="row-item">${formattedHour}</div>
            <div class="row-item">${item.MealTotalCalories}</div>
            <div class="row-item">${literBalance}</div>
            <div class="row-item">${kcalForbraendtBalance}</div>
            <div class="row-item">${overUnder}</div>
        `;
        overblik.appendChild(row);
    });
}


//////////////////////////////////////////////////// 

// Async Funktion til at vise data for en hel dag, sorteret efter tidspunkt
async function displayItems(items) {
    // Sorterer data i faldende rækkefølge baseret på dato
    items.sort((b, a) => {
        const dateA = new Date(a.Tid);
        const dateB = new Date(b.Tid);
        return dateA - dateB;
    });
    // Fjerner eksisterende indhold i HTML-elementet med id 'overblik'
    let norm = await overUnderSkud();
    const overblik = document.querySelector('#overblik');
    overblik.innerHTML = '';
    
    // Looper igennem hvert item og opretter HTML-elementer til visning af data
    items.forEach((item, index) => {
        const date = new Date(item.Tid);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} `;

        
        let overUnder1 = norm - item.KcalIndtaget + item.KcalForbraendt ; // Beregner over- eller underskud af kalorier
        let overUnder = overUnder1.toFixed(0) // Afrunder til nærmeste heltal

        const row = document.createElement('div'); // Opretter et div-element til hver række i tabellen
        row.className = 'table-row'; 
        row.innerHTML = 
           `<div class="row-item">${formattedDate}</div>
            <div class="row-item">${item.KcalIndtaget}</div>
            <div class="row-item">${item.KcalForbraendt}</div>
            <div class="row-item">${overUnder}</div>`;

        overblik.appendChild(row);
    });
}

// Funktion til at indsætte tabelheader i HTML
async function inserTableHeader() {  // Indsætter tabelheader i HTML
    const header = document.querySelector('.table-header'); 
    header.innerHTML = `
    <div class="header-item">Dato</div>
    <div class="header-item">Kcal indtaget(+)</div>
    <div class="header-item">Kcal forbrændt(-)</div>
    <div class="header-item">Over-/Underskud <br> for dagen</div>
    `;
}


// Tilføjer en event listener til en slider-komponent, der håndterer ændringer mellem forskellige visninger
async function addSliderEventListener() { 
   
    document.addEventListener('DOMContentLoaded', async function() {
        const checkbox = document.querySelector('input[type="checkbox"]');
        
        if (checkbox) { 
            checkbox.addEventListener('change', async function(event) {
                if (event.target.checked) {
                    console.log('24-timers-view');
                    const userData = await fetchUserInformation();
                    let norm = await overUnderSkud();
                    let items = await processData(userData);
                    displayItems24HoursView(items, norm)
                    insertTableHeader24HoursView()


                } else {
                    //Når slideren er på "Dags-view"
                    console.log('Dags-view');
                    //Kalder funktionen Databehandling som behandler og indsætter dataen i tabellen
                    dataBehandling().then(items => {

                        inserTableHeader()
                        displayItems(items);
                    });
                }
            });
        } else {
            console.error('Kunne ikke finde checkbox-elementet');
        }
    });
}


// Nedenstående kode laver et kald til funktionen, der tilføjer event listener til slideren
document.addEventListener('DOMContentLoaded', addSliderEventListener());


