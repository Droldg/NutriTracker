// Denne DOM bruges til login-funktionaliteten
document.addEventListener('DOMContentLoaded', function() {
    // Tjekker om der allerede er gemt en brugersession (altså username) i localStorage
    if (localStorage.getItem('brugerSession')) {
        // Hvis der findes en session, parse den gemte data og omdiriger til DailyNutri
        const brugerSession = JSON.parse(localStorage.getItem('brugerSession'));
        const brugernavn = brugerSession.brugernavn;
        console.log('Brugernavn:', brugernavn);
        window.location.href = '../HTML/DailyNutri.html';
    } else {
        // Hvis der ikke findes en session, log dette i konsollen
        console.log('Ingen brugersession fundet.');
    }
});

// Håndterer klik på login-knappen
document.querySelector('.green-bg').addEventListener('click', async function() {
    event.preventDefault(); // Forhindrer standardformularindsendelsen
    // Henter brugernavn og adgangskode fra inputfelterne
    const username = document.querySelector('.username').value;
    const password = document.querySelector('.password').value;

    // Sender en POST-anmodning til serveren for at tjekke gyldigheden af login-oplysningerne
    const response = await fetch('http://localhost:3000/api/checkLogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    // Parser svaret fra serveren som JSON
    const data = await response.json();

    // Tjekker om brugernavn og password matcher det i databasen
    if (data.match) {
        // Hvis match er sandt, logges brugeren ind
        console.log('Log ind succesfuldt!');
        let brugerSession = { brugernavn: username };
        // Gemmer brugerens session i local storage
        localStorage.setItem('brugerSession', JSON.stringify(brugerSession));
        // Omdiriger til DailyNutri efter 1 sekund
        setTimeout(() => {
            window.location.href = '../HTML/DailyNutri.html';
        }, 1000);
        return false;
    } else {
        // Hvis brugernavn og password ikke matcher, vises en fejlmeddelelse
        alert('Forkert brugernavn eller password. Prøv igen.');
    }
});
