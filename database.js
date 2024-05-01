const mssql = require('mssql');
const config = require('./config');

const pool = new mssql.ConnectionPool(config);
pool.on('error', err => {
    console.error('SQL Pool Error:', err);
});

const poolPromise = pool.connect()
    .then(() => console.log('Du er nu forbindelse til databasen...'))
    .catch(err => {
        console.error('Der kan ikke oprettes forbindelse til databasen!:', err);
        process.exit(1); // Stop programmet, hvis databasen ikke kan forbindes
    });

module.exports = {
    pool,
    poolPromise
};
