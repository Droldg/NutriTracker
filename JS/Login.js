document.addEventListener('DOMContentLoaded', function() {
    
    if (localStorage.getItem('brugerSession')) {
        // Brugersessionen findes i local storage
        const brugerSession = JSON.parse(localStorage.getItem('brugerSession'));
        const brugernavn = brugerSession.brugernavn;
        console.log('Brugernavn:', brugernavn);
      
           window.location.href = '../HTML/Dashboard.html';


    } else {
        // Der er ingen brugersession gemt i local storage
        console.log('Ingen brugersession fundet.');
    }
});


document.querySelector('.green-bg').addEventListener('click', async function() {
    event.preventDefault();
    // Hent værdier fra inputfelterne
    const username = document.querySelector('.username').value;
    const password = document.querySelector('.password').value;

    // fetch-anmodning til server
    const response = await fetch('http://localhost:3000/checkLogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    // Konverter svaret til JSON-format
    const data = await response.json();

    // Tjek om brugernavn og password matcher
    if (data.match) {
    // Brugernavn og password er korrekt
        console.log('Log ind succesfuldt!');
        
        let brugerSession = { brugernavn: username };

    // Gem brugerSession i local storage
    localStorage.setItem('brugerSession', JSON.stringify(brugerSession));




    } else {
        // Brugernavn og password matcher ikke
        alert('Forkert brugernavn eller password. Prøv igen.');
    }





    setTimeout(() => {
        window.location.href = '../HTML/Dashboard.html';
    }, 1000);
    return false;
});
