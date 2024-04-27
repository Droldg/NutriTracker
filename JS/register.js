function SignUp() {
    event.preventDefault();
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

    if (confirmPassword != password) {
        alert("Passwords do not match");
        return false; // Stop funktionen hvis adgangskoderne ikke matcher
    }

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





    fetch('http://localhost:3000/checkExistingUser', {
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
        // Log svaret fra serveren
        console.log("Server Response:", data);

        // Tjek om brugernavn, telefonnummer eller e-mail allerede eksisterer
        if (data.count > 0) {
            // Vis en besked om at brugeren allerede eksisterer
            //alert('Username, phone number, or email already exists.');

            document.getElementById("fejlTekst").innerText = "Username, phone number, or email already exists.";



        } else {
            // Hvis ikke informationerne er det samme, sender det et registerUser kald til express
            fetch('http://localhost:3000/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to register user.');
                }
                return response.text();
            })
            .then(data => {
                // Håndter succesfuld registrering
                alert(data); // Vis en besked om succes
                // Ekstra handlinger efter behov (f.eks. omdirigering)
            })
            .catch(error => {
                console.error('Error registering user:', error);
                alert('Failed to register user. Please try again later.');
            });


        }
    })
    .catch(error => {
        console.error('There was an error processing your request:', error);
        // Vis en fejlbesked til brugeren, hvis der opstår en fejl
        alert('There was an error. Please try again later.');
    });

    setTimeout(() => {
        window.location.href = '../HTML/Login.html';
    }, 1000);
    //Venter 1 sekund og går til login siden.

    return false;
    //Funktionen returnerer false, for at siden ikke genindlæses, hvilket er en default funktion, når man trykker på "submit"/SignUp
}
