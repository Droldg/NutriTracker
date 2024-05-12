// Nedenstående kode indlæser nødvendige moduler
const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const config = require('./config');

// Her oprettes der en forbindelsespool til SQL Server
// Konfigurationen hentes fra 'config' filen som indeholder databasens credentials og indstillinger
const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

// Her bruger vi morgan middleware til at logge HTTP-anmodninger til konsollen for bedre debugging og overvågning
app.use(morgan('dev'));

// Her aktivtere vi CORS (Cross-Origin Resource Sharing) for at tillade anmodninger fra forskellige domæner
app.use(cors());

// Her benytter vi Express' indbyggede middleware til at parse JSON-anmodninger
// Dette gør det nemt at håndtere JSON data sendt fra klienten til serveren
app.use(express.json());

// Her importér vi og bruger ruterne for forskellige features i applikationen
// Hver route fil håndterer specifikke endpoints relateret til sin funktionalitet

const MealTrackerRoute = require('./Routes/MealTrackerRoute');
app.use('/api', MealTrackerRoute);

const userRoutes = require('./Routes/userRoute');
app.use('/api', userRoutes);

const activityTrackerRoutes = require('./Routes/ActivityTrackerRoute');
app.use('/api', activityTrackerRoutes);

const FoodInspectorRoute = require('./Routes/FoodInspectorRoute');
app.use('/api', FoodInspectorRoute);

const MealCreatorRoute = require('./Routes/MealCreatorRoute');
app.use('/api', MealCreatorRoute);

const DailyNutriRoute = require('./Routes/DailyNutriRoute');
app.use('/api', DailyNutriRoute);

// Nedenunder er opsætning af serveren til at lytte på port 3000
// 'listen' funktionen starter serveren og gør den tilgængelig via den specificerede port
// Hertil logges en besked til konsollen som bekræftelse på, at serveren kører
app.listen(3000, () => {
    console.log('Serveren kører på port 3000');
});
