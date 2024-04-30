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

    // Funktion til at beregne basalstofskiftet for kvinder
function calculateBasalMetabolismFemale(age, weight, height) {
    let basalMetabolism;
  
    if (age < 3) {
        basalMetabolism = (0.068 * weight) + (4.28 * height) - 1.73;
    } else if (age >= 4 && age <= 10) {
        basalMetabolism = (0.071 * weight) + (0.68 * height) + 1.55;
    } else if (age >= 11 && age <= 18) {
        basalMetabolism = (0.035 * weight) + (1.95 * height) + 0.84;
    } else if (age >= 19 && age <= 30) {
        basalMetabolism = (0.0615 * weight) + 2.08;
    } else if (age >= 31 && age <= 60) {
        basalMetabolism = (0.0364 * weight) + 3.47;
    } else if (age >= 61 && age <= 75) {
        basalMetabolism = (0.0386 * weight) + 2.88;
    } else {
        basalMetabolism = (0.041 * weight) + 2.61;
    }
  
    return basalMetabolism;
  }

  // Funktion til at beregne basalstofskiftet for mænd
function calculateBasalMetabolismMale(age, weight, height) {
    let basalMetabolism;
  
    if (age < 3) {
        basalMetabolism = (0.0007 * weight) + 6.35 - 2.58;
    } else if (age >= 4 && age <= 10) {
        basalMetabolism = (0.082 * weight) + (0.55 * height) + 1.74;
    } else if (age >= 11 && age <= 18) {
        basalMetabolism = (0.068 * weight) + (0.57 * height) + 2.16;
    } else if (age >= 19 && age <= 30) {
        basalMetabolism = (0.064 * weight) + 2.84;
    } else if (age >= 31 && age <= 60) {
        basalMetabolism = (0.0485 * weight) + 3.67;
    } else if (age >= 61 && age <= 75) {
        basalMetabolism = (0.0499 * weight) + 2.93;
    } else {
        basalMetabolism = (0.035 * weight) + 3.43;
    }
  
    return basalMetabolism;
  }
  
  let basalMetabolism;
  if (gender === "male") {
      basalMetabolism = calculateBasalMetabolismMale(age, weight, height);
  } else {
      basalMetabolism = calculateBasalMetabolismFemale(age, weight, height);
  }

  console.log('Basalstofskifte:', basalMetabolism.toFixed(2), 'MJ');




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
