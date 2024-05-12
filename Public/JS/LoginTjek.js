// Dette script tjekker om brugeren allerede er logget ind når siden indlæses
document.addEventListener('DOMContentLoaded', () => {
    // Henter brugersession fra LocalStorage
    const storedData = localStorage.getItem('brugerSession');
    if (storedData) {
        // Parser den gemte data
        const parser = JSON.parse(storedData);
        const username = parser.brugernavn;
        

        // Tjekker om der er et gyldigt brugernavn
        if (username) {
            console.log('Bruger der er logget ind:', username);
        } else {
            // Hvis der ikke findes nogen gyldig session, omdirigeres til login siden
            console.log('Ingen data fundet i LocalStorage.');
            window.location.href = '../HTML/Login.html';
        }
    } else {
        // Hvis der ikke er nogen data i LocalStorage, logges dette og brugeren omdirigeres
        console.log('Ingen data fundet i LocalStorage.');
        window.location.href = '../HTML/Login.html';
    }
});
