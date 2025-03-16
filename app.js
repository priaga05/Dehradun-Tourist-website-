const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvParser = require('csv-parser');
const app = express();
const port = 3000;
var person='';
var proceed='';
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});
app.post('/', (req, res) => {
    var proceed='';
    const { howtoproceed } = req.body;
    proceed = howtoproceed;
    if(proceed == 'Register'){
        res.redirect('/register');
    } 
    else{
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/sucessfullyregistered', (req, res) => {
    res.render('sucessfullyregistered');
});

app.post('/sucessfullyregistered', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.post('/login', (req, res) => {
    var loginSuccessful = false;
    var firstName = '';

    fs.createReadStream('userdetails.csv')
        .pipe(csvParser())
        .on('data', (row) => {
            if(row.username === req.body.username && row.password === req.body.password){
                loginSuccessful = true;
                firstName = row.firstname;
            }
        })
        .on('end', () => {
            if (loginSuccessful) {
                res.render('home', { person: firstName });           
            } else {
                res.send('Invalid username or password.');
            }
        });
});

app.post('/register', (req, res) => {
    const { firstname, lastname, username, password, confirmpassword, email } = req.body;

    if (!firstname || !lastname || !username || !password || !email) {
        res.status(400).send('Please provide all of the aforementioned information.');
        return;
    }

    var usernameExists = false;
    var emailAlreadyRegistered = false;
    fs.createReadStream('userdetails.csv')
        .pipe(csvParser())
        .on('data', (row) => {
            if(row.username == username) {
                usernameExists = true;
            }
            if(row.email == email){
                emailAlreadyRegistered = true;
            }
            if(confirmpassword!=password){
                res.status(400).send('Password does not match.')
            }
        })
        .on('end', () => {
            if (usernameExists){
                res.status(400).send('Username already exists.');
            } 
            else if(emailAlreadyRegistered){
                res.status(400).send('This email is already registered with us.');
            }
            else {
                const newUser = `${firstname},${lastname},${username},${password},${email}\n`;
                fs.appendFile('userdetails.csv', newUser, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal server error.');
                    } else {
                        res.redirect('/sucessfullyregistered');
                    }
                });
            }
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});