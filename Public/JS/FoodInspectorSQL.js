// Venter til når DOM er fuldt indlæst, hvorefter funktionerne initialiseres.
document.addEventListener('DOMContentLoaded', () => {
    // Henter referencer til søgefelt og søgeknap.
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    // Funktion til dynamisk søgning og foreslag baseret på brugerinput.
    searchInput.addEventListener('input', async () => {
        const searchString = searchInput.value;
        try {
            // Udfører en API-anmodning med den indtastede søgestreng.
            const response = await fetch(`http://localhost:3000/api/searches/${searchString}`);
            if (response.ok) {
                const foodItems = await response.json();
                populateSuggestions(foodItems);
            } else {
                console.error('Failed to fetch food suggestions. Status:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch food suggestions:', error);
        }
    });

    // Funktion til at udfylde dataliste med foreslåede fødevarer baseret på søgning.
    function populateSuggestions(foodItems) {
        const suggestionsDatalist = document.getElementById('foodSuggestions');
        suggestionsDatalist.innerHTML = ''; // Tømmer eksisterende indhold.
        foodItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.FoodName; // Sætter værdi til fødevarenavn.
            suggestionsDatalist.appendChild(option); // Tilføjer fødevarenavn til datalisten.
        });
    }

    // Funktion til at vise navnet på det valgte fødevareelement.
    function visVare() { // Funktionen visVare() er en simpel funktion, der viser fødevarenavnet i brugergrænsefladen.
        const foodItemNameSpan = document.querySelector('.food-item-name');
        const navn = document.querySelector(".search-input").value;
        const mellemrum = '\u00A0'; // Unicode-tegn for mellemrum.
        foodItemNameSpan.textContent = mellemrum + navn;
    }

    // Asynkron funktion til at hente detaljeret herunder parametre for fødevarene baseret på fødevare-ID.
    async function fetchFoodItem(foodID) { // Funktionen fetchFoodItem() henter fødevare-ID fra API'en og returnerer det.
        try {
            const response = await fetch(`http://localhost:3000/api/parametre/${foodID}`);
            if (response.ok) {
                const foodItem = await response.json();
                return hentFoodID(foodItem);
            } else {
                console.error('Failed to fetch food suggestion. Status:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch food suggestion:', error);
        }
    }

    // Asynkron funktion til at hente fødevaredata fra API'en baseret på søgestrengen.
    async function fetchFoodData(searchString) {
        try {
            const response = await fetch(`http://localhost:3000/api/searches/${searchString}`);
            if (response.ok) {
                const foodItem = await response.json();
                return foodItem;
            } else {
                console.error('Failed to fetch food suggestion. Status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch food suggestion:', error);
            return null;
        }
    }

    // Nedenstående kode er en event listener for søgeknap og Enter-tasten, der initierer en søgning.
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Nedenstående async function er en håndtering af søgning og visning af fødevareinformation.
    async function handleSearch() {
        const searchString = searchInput.value;
        const foodItem = await fetchFoodData(searchString);
        if (foodItem) {
            const foodID = foodItem[0].FoodID;
            let kategorier = await fetchFoodItem(foodID);
            visVare();
            displayFoodItem(kategorier, foodID);
        }
    }

    // Funktion til at vise ernæringsinformation baseret på hentede data.
    async function displayFoodItem(kategorier, foodID) {
        displayNutritionalInfo(kategorier)
    }

    // Funktion til at returnere fødevare-ID fra hentede data.
    async function hentFoodID(foodItem) {
        let ID = foodItem;
        return ID;
    }

    // Funktion til at vise ernæringsinformation i brugergrænsefladen.
    async function displayNutritionalInfo(kategorier) {
        try {
            const displayNutrition = document.getElementById('displayNutrition');
            displayNutrition.innerHTML = '';
            let productID = document.getElementById("product-id");
            let searchString = searchInput.value;
            const foodItem = await fetchFoodData(searchString);
            let foodID = foodItem[0].FoodID;
            const mellemrum = '\u00A0';
            productID.innerHTML = mellemrum + foodID;

            // Udtrækker og formaterer ernæringsdata.
            const kcal = parseFloat(kategorier[0].ResVal).toFixed(2);
            const protein = parseFloat(kategorier[1].ResVal).toFixed(2);
            const fat = parseFloat(kategorier[3].ResVal).toFixed(2);
            const fibers = parseFloat(kategorier[2].ResVal).toFixed(2);

            // Opretter og tilføjer ernæringsdata til brugergrænsefladen som en liste. Dette bliver altså direkte indsat i FoodInspector.html.
            const itemDiv = document.createElement('div');
            displayNutrition.appendChild(itemDiv);
            itemDiv.classList.add('nutrition-info');
            itemDiv.innerHTML = `
                <h3>Nutrition pr. 100g:</h3>
                <p><strong>Energy (kcal): ${kcal}</strong> </p>
                <p><strong>Protein: ${protein}g</strong> </p>
                <p><strong>Fat: ${fat}g</strong> </p>
                <p><strong>Fibers: ${fibers}g</strong> </p>
            `;
        } catch (error) {
            console.error('Error displaying nutritional info:', error);
        }
    }
});
