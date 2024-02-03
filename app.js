const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './.env' });

const app = express();

const publicDirectory = path.join(__dirname, './public');

app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'hbs');

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, (
    () => { console.log("Server is running on port 5000....!"); }
));