document.addEventListener('DOMContentLoaded', () => {
    // Lyt efter klik på Slet Profil-knappen
    document.querySelector('.SletProfilKnap').addEventListener('click', () => {
        visBekraeftelse();
    });
});

function visBekraeftelse() {
    // Opdater indholdet af .SletProfil med bekræftelsesbeskeden
    document.querySelector('.SletProfil').innerHTML = `
        <div class="SletProfil">
            <h3>Er du sikker på, at du vil slette din profil?</h3>
            <button class="jaKnap" onclick="sletProfil()">Ja</button>
            <button class="nejKnap" onclick="annullerSletning()">Nej</button>
        </div>`;
}

function sletProfil() {
    // Hent brugernavn fra localStorage
    const parser = JSON.parse(localStorage.getItem('brugerSession'));;
    const brugernavn = parser.brugernavn;

    // Hvis brugernavnet findes i localStorage
    if (brugernavn) {
        localStorage.removeItem('brugerSession');
        // Opret fetch-anmodning til at slette profilen
        fetch('http://localhost:3000/sletProfil', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ brugernavn: brugernavn })
        })
        .then(response => {
            if (response.ok) {
                console.log('Profilen blev slettet succesfuldt.');
                window.location.href = '../HTML/Register.html';
            } else {
                console.error('Der opstod en fejl ved sletning af profilen.');
            }
        })
        .catch(error => {
            console.error('Der opstod en fejl:', error);
        });
    } else {
        console.error('Ingen brugernavn fundet i localStorage.');
    }
}

function annullerSletning() {
    // Gå tilbage til den oprindelige visning
    window.location.reload();
}
