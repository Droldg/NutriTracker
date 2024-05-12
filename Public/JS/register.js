// Funktionen SignUp forhindrer standard formularen fra at indsende og håndterer brugerregistrering
function SignUp() {
    event.preventDefault(); // Forhindrer formens standard indsendelsesadfærd

    // Henter værdier fra formularfelterne
    let navn = document.getElementById("full-name").value;
    let email = document.getElementById("email").value;
    let phoneNumber = document.getElementById("phone-number").value;
    let age = document.getElementById("age").value;
    let gender = document.getElementById("gender").value;
    let weight = document.getElementById("weight").value;
    let height = document.getElementById("height").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    // Tjekker om de indtastede adgangskoder matcher
    if (confirmPassword != password) {
        alert("Passwords do not match");
        return false; // Stopper funktionen, hvis adgangskoderne ikke matcher
    }

    // Her samles brugerdata i et objekt
    const userData = {
        navn: navn,
        email: email,
        phoneNumber: phoneNumber,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        username: username,
        password: password
    };

    // Sender en forespørgsel til serveren for at tjekke, om brugeren allerede findes
    fetch('http://localhost:3000/api/checkExistingUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            phoneNumber: phoneNumber,
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);

        // Hvis brugernavnet, telefonnummeret eller emailen allerede findes i systemet, vises en fejlmeddelelse
        if (data.count > 0) {
            // Viser en fejlmeddelelse i en dedikeret fejlboks
            document.getElementById("fejlTekst").innerText = "Username, phone number, or email already exists.";
        } else {
            // Hvis brugeren ikke findes, oprettes der en ny bruger
            fetch('http://localhost:3000/api/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData) // Sender brugerdata til serveren
            })
            .then(response => { // Håndterer serverens svar
                if (!response.ok) {
                    throw new Error('Failed to register user.');
                }
                return response.text();
            })
            .then(data => { // Håndterer serverens svar
                alert(data); // Succesmeddelelse om at brugeren er registreret
            })
            .catch(error => { 
                console.error('Error registering user:', error);
                alert('Failed to register user. Please try again later.');
            });
        }
    })
    .catch(error => {
        console.error('There was an error processing your request:', error);
        alert('There was an error. Please try again later.');
    });

    // Venter 1 sekund før brugeren omdirigeres til login-siden, giver brugeren tid til at se succesmeddelelsen
    setTimeout(() => {
        window.location.href = '../HTML/Login.html';
    }, 1000);

    return false; // Returnerer false for at forhindre standardformular indsendelse og sideopdatering
}
