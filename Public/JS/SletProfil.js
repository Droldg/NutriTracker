// Lytter efter at hele DOM er indlæst, før den udfører koden indenfor.
document.addEventListener('DOMContentLoaded', () => { 
    // Finder og lytter til klik på knappen med klassen 'SletProfilKnap'.
    document.querySelector('.SletProfilKnap').addEventListener('click', () => {
        // Kalder funktionen visBekraeftelse når knappen klikkes.
        visBekraeftelse();
    });
});

function visBekraeftelse() { // Funktion til at vise bekræftelsesdialog for sletning af profil.
    // Opdaterer HTML-indholdet af elementet med klassen 'SletProfil'.
    document.querySelector('.SletProfil').innerHTML = `
        <div class="SletProfil">
            <h3>Er du sikker på, at du vil slette din profil?</h3>
            <button class="jaKnap" onclick="sletProfil()">Ja</button>
            <button class="nejKnap" onclick="annullerSletning()">Nej</button>
        </div>`;
}

function sletProfil() { // Funktion til at slette brugerprofilen.
    // Henter brugerdata fra localStorage, hvor session data er gemt.
    const parser = JSON.parse(localStorage.getItem('brugerSession'));
    const brugernavn = parser.brugernavn;

    // Tjekker om brugernavnet er tilgængeligt før sletning.
    if (brugernavn) {
        // Fjerner brugersession fra localStorage, hvilket "logger brugeren ud".
        localStorage.removeItem('brugerSession');

        // Sender en HTTP DELETE anmodning til serveren for at slette brugerprofilen.
        fetch('http://localhost:3000/api/sletProfil', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brugernavn: brugernavn })
        })
        .then(response => {
            if (!response.ok) {
                // Håndterer fejl hvis serveren ikke svarer med succes.
                throw new Error('Server fejl ved sletning af profil');
            }
            return response.json(); // Behandler svaret som JSON hvis alt gik godt.
        })
        .then(data => {
            console.log('Profilen blev slettet succesfuldt.');
            // Omdirigerer brugeren til registreringssiden, efter profil er slettet.
            window.location.href = '../HTML/Register.html';
        })
        .catch(error => {
            // Logger eventuelle fejl i konsollen.
            console.error('Der opstod en fejl:', error);
        });
    } else {
        // Logger en fejl, hvis der ikke findes et brugernavn i localStorage.
        console.error('Ingen brugernavn fundet i localStorage.');
    }
}

function annullerSletning() {
    // Genindlæser siden for at annullere sletning og vende tilbage til den oprindelige tilstand.
    window.location.reload();
}
