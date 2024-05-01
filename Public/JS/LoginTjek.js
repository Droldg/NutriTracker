document.addEventListener('DOMContentLoaded', () => {
    // Tjek om der findes et objekt med brugernavn i LocalStorage
    const storedData = localStorage.getItem('brugerSession');
    if (storedData) {
        const parser = JSON.parse(storedData);
        const username = parser.brugernavn;
        
        console.log(username);
        if (username) {
            // Der findes et brugernavn i LocalStorage
            console.log('Brugernavn fundet i LocalStorage:', username);
        } else {
            console.log('Ingen data fundet i LocalStorage.');
            window.location.href = '../HTML/Login.html';
        }
    } else {
        console.log('Ingen data fundet i LocalStorage.');
        window.location.href = '../HTML/Login.html';
    }
});