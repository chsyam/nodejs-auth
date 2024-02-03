const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL is connected....!");
    }
})

exports.register = async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    db.query(`SELECT email FROM users WHERE email = '${email}'`, async (error, result) => {
        if (error) {
            console.log(error);
        } else if (result.length > 0) {
            return res.render('register', {
                message: "Email in already use"
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: "Password does not match"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query(`INSERT INTO users SET ?`, { name: name, email: email, password: hashedPassword }, (error, result) => {
            if (error) {
                console.log(error);
            } else if (result) {
                return res.render('login', {
                    message: "User registered successfully"
                })
            }
        });
    })
}