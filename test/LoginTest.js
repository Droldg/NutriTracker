const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app'); // Sørg for, at denne sti peger på din app.js fil

chai.use(chaiHttp);

let server;

before(function(done) {
    // Start serveren og vent 1,5 sekunder
    server = app.listen(3001, function() {
        setTimeout(done, 1500); // Vent 3 sekunder, derefter kald done() for at fortsætte med testen
    });
});

after(function() {
    server.close();
});

describe('Login Functionalitet', function() {
    // Test for succesfuldt login
    it('skal logge ind succesfuldt med korrekte legitimationsoplysninger', function(done) {
        chai.request(app)
            .post('/api/checkLogin')
            .send({ username: 'Droldg', password: 'daniel123' })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    // Test for mislykket login
    it('skal afvise login med forkerte legitimationsoplysninger', function(done) {
        chai.request(app)
            .post('/api/checkLogin')
            .send({ username: 'user', password: 'wrongPassword' })
            .end(function(err, res) {
                expect(res).to.have.status(200); // Forventer statuskode 200 (OK)
            
                done();
            });
    });
    // Test for mislykket login med forkert brugernavn og password
    it('skal afvise login med forkert brugernavn og password', function(done) {
        chai.request(app)
            .post('/api/checkLogin')
            .send({ username: 'wrongUsername', password: 'wrongPassword' })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('match').that.is.false;
                done();
            });
    });

    // Test for mislykket login med korrekt brugernavn og forkert password
    it('skal afvise login med korrekt brugernavn og forkert password', function(done) {
        chai.request(app)
            .post('/api/checkLogin')
            .send({ username: 'Droldg', password: 'wrongPassword' })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('match').that.is.false;
                done();
            });
    });

    // Test for adgang til appen uden at være logget ind (forventer status 401 Unauthorized)
    it('skal afvise adgang til appen uden at være logget ind', function(done) {
        chai.request(app)
            .get('/api/app')
            .end(function(err, res) {
                expect(res).to.have.status(404);
                done();
            });
    });

    // Test for eksisterende session og omdirigering
    // module.exports = {  } // Du skal fjerne dette, da det ikke er nødvendigt inden for en describe-blok
});
