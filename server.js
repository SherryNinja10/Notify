const mysql = require('mysql2');
const express = require('express');
const app = express();
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'notifydb',
    password: process.env.PASSWORD,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

app.get("/", function (req, res) {
    let doc = fs.readFileSync("./app/html/index.html", "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(doc);
});

app.get("/login", function (req, res) {
    let doc = fs.readFileSync("./app/html/login.html", "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(doc);
});

app.post("/register", function (req, res) {
    const json = req.body;
    pool.query(
        `INSERT INTO users (username, email) VALUES (?, ?)`,
        [json.username, json.email],
        function (err) {
            if (err) throw err;
            res.setHeader("Content-Type", "application/json");
            res.json({ message: "User registered successfully" });
            res.send();
        }
    );
});

app.post("/loginUser", function (req, res) {
    const json = req.body;
    pool.query(
        `SELECT * FROM users WHERE username = ? AND email = ?`,
        [json.username, json.email],
        function (err, results) {
            if (err) throw err;
            if (results.length > 0) {
                console.log("User logged in successfully");
                res.setHeader("Content-Type", "application/json");
                res.json({ message: "User logged in successfully" });
                res.send();
            } else {
                console.log("Invalid username or email");
                res.status(500);
                res.setHeader("Content-Type", "application/json");
                res.json({ error: "Invalid username or email" });
            }
        }
    );
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

let port = 8000;
app.listen(port, function () {
    console.log('Server running at http://localhost:' + port);
});