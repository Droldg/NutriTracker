// Funktion der håndterer opdatering af brugerdata
function opdater(event) {
    event.preventDefault(); // Stopper formens standardindsendelse

    // Her hentes input værdierne fra formularfelterne
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Kontrollerer at adgangskoderne matcher
    if (password !== confirmPassword) {
        document.getElementById('fejlTekst').textContent = "Passwords do not match.";
        return; // Afslutter funktionen hvis adgangskoderne ikke matcher
    }

    // Henter brugernavn fra localStorage
    const storedSession = localStorage.getItem('brugerSession');
    const parser = JSON.parse(storedSession);
    const username = parser.brugernavn;

    // Sletter tidligere fejltekster
    document.getElementById('fejlTekst').textContent = "";

    // Samler brugerdata i et objekt
    const userData = { 
        username: username,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        password: password
    };

    // Kalder fetch funktionen med de opdaterede data
    fetchAndUpdate(userData); 
    return false; // Returnerer false for at forhindre formen i at indsende data
}

// Funktion til at sende opdateret brugerdata til serveren via API
function fetchAndUpdate(userData) {
    fetch('http://localhost:3000/api/redigerBruger', {
        method: 'PUT', // Bruger PUT metoden til at opdatere data
        headers: {
            'Content-Type': 'application/json' // Sætter content-type til JSON
        },
        body: JSON.stringify(userData) // Sender brugerdata som en JSON string
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok'); // Håndterer ikke-OK svaret fra serveren
        }
        return response.json(); // Parser svaret til JSON
    })
    .then(data => {
        // Her håndterer vi succesfuld opdatering
        console.log(data.message); // Log serverens respons
        alert('Update successful: ' + data.message); // Displays a confirmation to the user
    })
    .catch(error => {
        // Håndterer eventuelle fejl under fetch
        console.error('Kan ikke opdatere data:', error);
        alert('Fejl ved opdatering af data: ' + error.message); // Viser en fejlbesked til brugeren
    });
}

// Tilføjer en event listener til opdateringsknappen
document.getElementById('knap').addEventListener('click', opdater);
