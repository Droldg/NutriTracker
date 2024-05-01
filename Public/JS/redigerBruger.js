


function opdater(event) {
    event.preventDefault();

    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        document.getElementById('fejlTekst').textContent = "Passwords do not match.";
        return;
    }

    // Hent brugernavn fra localStorage
    const parser = JSON.parse(localStorage.getItem('brugerSession'));;
    const username = parser.brugernavn;
    console.log(username)

    // Slet fejltekst
    document.getElementById('fejlTekst').textContent = "";

    // Dataobjekt
    const userData = {
        username: username,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        password: password
    };

    fetchAndUpdate(userData);
    return false;
}

function fetchAndUpdate(userData) {
    fetch('http://localhost:3000/redigerBruger', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Log server response
        // Håndter svar fra serveren her
    })
    .catch(error => {
        console.error('Kan ikke opdatere data:', error);
        // Håndter fejl
    });
}

document.getElementById('knap').addEventListener('click', opdater);
