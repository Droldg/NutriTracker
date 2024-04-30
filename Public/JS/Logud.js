document.addEventListener('DOMContentLoaded', function() {

  
   if (localStorage.getItem('brugerSession') === null) {
    window.location.href = '../HTML/Login.html';
   } else {

   }
});



let u = localStorage.getItem('brugerSession');
let parse1 = JSON.parse(u);
username = parse1.brugernavn;


function logUd(username) {
    // Hent data fra localStorage
    let userData = localStorage.getItem('brugerSession');

    // Tjek om der er gemt data i localStorage
    if (userData) {
        // Konverter data fra JSON-format til et JavaScript-objekt
        userData = JSON.parse(userData);

        // Tjek om brugernavnet matcher det angivne brugernavn
        if (userData.brugernavn === username) {
            // Slet data fra localStorage
            localStorage.removeItem('brugerSession');
            console.log('Brugerdata er blevet slettet fra localStorage.');
            window.location.href = '../HTML/Login.html';
        } else if (userData.brugernavn = null) {
            console.log('Ingen bruger med det angivne brugernavn blev fundet i localStorage.');
        }
    } else {
        console.log('Ingen brugerdata blev fundet i localStorage.');
    }

}



