const express = require('express');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const axios = require('axios');

const app = express();
const publicDirectory = path.join(__dirname, './public');

const db = mysql.createConnection({
    host: "caretaker-portal.c5888ae8yqbj.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "AnikaAWS123",
    database: "Caretakerportal"
})

db.connect((error) => {
    if (error) {
        console.log(error);
    }
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE', 'UPDATE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'anika',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,
    }
}));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    return res.render('index');
})

app.get('/register', (req, res) => {
    return res.render('register');
})

app.get('/login', (req, res) => {
    return res.render('login');
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            return res.redirect('login');
        }
    });
})

app.post('/register', (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;
    db.query('SELECT email FROM careteam WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: "Email already registered"
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: "Passwords do not match"
            })
        }

        db.query('INSERT INTO careteam SET ?', { name: name, email: email, password: passwordConfirm }, (error, result) => {
            if (error) {
                console.log(error);
            } else if (result) {
                return res.redirect('login')
            }
        });
    });
})

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    db.query('SELECT email FROM careteam WHERE name = ? and password = ?', [name, password], async (error, results) => {
        if (error) {
            console.log(error);
        }
        else if (results.length === 0) {
            return res.render('login', {
                message: "Invalid Credentials"
            })
        } else {
            req.session.user = { username: name };
            return res.redirect('profile');
        }
    });
})

app.get('/api/conditions', (req, res) => {
    const query = 'SELECT * FROM conditions';
    db.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.get('/api/medication', (req, res) => {
    const query = 'SELECT * FROM medication';
    db.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.get('/api/patients', (req, res) => {
    const query = 'SELECT * FROM patients';
    db.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.get('/api/careteam', (req, res) => {
    const query = 'SELECT * FROM careteam limit 1';
    db.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});


app.get('/patient', async (req, res) => {
    if (req.session.user) {
        try {
            const conditionsData = await axios.get('http://localhost:5000/api/conditions');
            const patientsData = await axios.get('http://localhost:5000/api/patients');
            const medicationData = await axios.get('http://localhost:5000/api/medication');
            const careTeamData = await axios.get('http://localhost:5000/api/careteam');
            return res.render('patient', {
                patientsData: patientsData.data,
                medicationData: medicationData.data,
                conditionsData: conditionsData.data,
                careTeamData: careTeamData.data,
            })
        } catch (error) {
            console.log(error);
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/profile', async (req, res) => {
    if (req.session.user) {
        try {
            const patientsData = await axios.get('http://localhost:5000/api/patients');
            const careTeamData = await axios.get('http://localhost:5000/api/careteam');
            return res.render('profile', {
                patientsData: patientsData.data,
                careTeamData: careTeamData.data,
            })
        } catch (error) {
            console.log(error);
        }
    } else {
        res.redirect('/login');
    }
});

app.listen(process.env.PORT || 5000);