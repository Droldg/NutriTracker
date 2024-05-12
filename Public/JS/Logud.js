// Denne event listener sikrer, at hele indholdet på siden er indlæst før koden udføres.
document.addEventListener('DOMContentLoaded', function() {
    // Tjekker om 'brugerSession' er til stede i localStorage
    if (localStorage.getItem('brugerSession') === null) {
        // Hvis ingen brugersession findes, omdiriger brugeren til login-siden
        window.location.href = '../HTML/Login.html';
    } else {
        // Hvis der findes en session, ingen handling kræves, og brugeren kan fortsætte
    }
});

// Henter brugerSession fra localStorage og parser det til et JavaScript-objekt
let u = localStorage.getItem('brugerSession');
let parse1 = JSON.parse(u);
let username = parse1.brugernavn;

// Funktion til at logge en bruger ud
function logUd(username) {
    // Hent den gemte brugersession fra localStorage
    let userData = localStorage.getItem('brugerSession');

    // Tjek om brugerdata eksisterer
    if (userData) {
        // Parse brugerdata fra JSON-format til et JavaScript-objekt
        userData = JSON.parse(userData);

        // Sammenlign den gemte brugernavns data med det angivne brugernavn
        if (userData.brugernavn === username) {
            // Hvis de matcher, slet brugerens session fra localStorage
            localStorage.removeItem('brugerSession');
            console.log('Brugerdata er blevet slettet fra localStorage.');

            // Omdiriger til login-siden
            window.location.href = '../HTML/Login.html';
        } else {
            // Hvis brugernavnet ikke findes, log en besked
            console.log('Ingen bruger med det angivne brugernavn blev fundet i localStorage.');
        }
    } else {
        // Hvis ingen brugerdata findes i localStorage, log en fejlbesked
        console.log('Ingen brugerdata blev fundet i localStorage.');
    }
}
