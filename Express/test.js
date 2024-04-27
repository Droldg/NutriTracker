const axios = require('axios');

// URL til din server
const serverUrl = 'http://localhost:3000'; // Erstat med din server URL

// Funktion til at foretage en HTTP-anmodning til serveren
async function makeRequest() {
  try {
    // Udfør en GET-anmodning til serverens endpoint
    const response = await axios.get(`${serverUrl}/query`);

    // Udskriv svaret fra serveren
    console.log('Svar fra serveren:', response.data);
  } catch (error) {
    // Håndter eventuelle fejl
    console.error('Fejl under anmodning:', error.message);
  }
}

// Kald funktionen til at foretage anmodningen
makeRequest();