const mysql = require('mysql2');
const express = require('express');
const app = express();
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
dotenv.config();

const secret_key = process.env.SECRET_KEY;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));

const pool = mysql.createPool({
    host: roundhouse.proxy.rlwy.net,
    user: root,
    database: railway,
    password: AwvSmTbYEGpplUbSBJfqaREeGsiTmriT,
    port: 16802,
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

app.get("/main", (req, res, next) => {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        next();
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
}, function (req, res) {
    let doc = fs.readFileSync("./app/html/main.html", "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(doc);
});

app.post("/register", function (req, res) {
    const json = req.body;
    const hashedPassword = bcrypt.hashSync(json.privatecode, 10);
    pool.query(
        `INSERT INTO users (username, email, privatecode) VALUES (?, ?, ?)`,
        [json.username, json.email, hashedPassword],
        function (err) {
            if (err) throw err;
            res.setHeader("Content-Type", "application/json");
            res.json({ message: "User registered successfully" });
        }
    );
});

app.post("/loginUser", function (req, res) {
    const json = req.body;
    pool.query(
        `SELECT * FROM users WHERE email = ?`,
        [json.email],
        async function (err, results) {
            if (err) throw err;
            console.log(results);
            if (results.length > 0) {
                const user = results[0];
                const match = await bcrypt.compare(json.privatecode, user.privatecode);
                if (match) {
                    console.log("User logged in successfully");
                    const token = JWT.sign({ email: user.email }, secret_key, { expiresIn: '1h' });
                    console.log(token);
                    res.cookie("jwt", token, { httpOnly: true, secure: true });
                    res.setHeader("Content-Type", "application/json");
                    res.json({ message: "User logged in successfully" });
                } else {
                    console.log("Invalid email or password");
                    res.status(500);
                    res.setHeader("Content-Type", "application/json");
                    res.json({ error: "Invalid email or password" });
                }
            } else {
                console.log("Invalid email or password");
                res.status(500);
                res.setHeader("Content-Type", "application/json");
                res.json({ error: "Invalid email or password" });
            }
        }
    );
});

app.get("/username", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        pool.query(
            `SELECT username FROM users WHERE email = ?`,
            [decoded.email],
            function (err, results) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json(results);
            }
        );
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
});

app.post("/editUsername", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        const json = req.body
        pool.query(
            `UPDATE users SET username = ? WHERE email = ?`,
            [json.newUsername, decoded.email],
            function (err) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json({ message: "Username updated successfully" });
            }
        );
    }
});

app.get("/notes", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        pool.query(
            `SELECT * FROM note WHERE userID = (SELECT userID FROM users WHERE email = ?)`,
            [decoded.email],
            function (err, results) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json(results);
            }
        );
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
});

app.post("/addNote", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        const json = req.body
        pool.query(
            `INSERT INTO note (note, userID) VALUES (?, (SELECT userID FROM users WHERE email = ?))`,
            [json.note, decoded.email],
            function (err) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json({ message: "Note added successfully" });
            }
        )
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
});

app.post("/editNote", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        const json = req.body
        pool.query(
            `UPDATE note SET note = ? WHERE userID = (SELECT userID FROM users WHERE email = ?) AND noteID = ?`,
            [json.newNote, decoded.email, json.noteID],
            function (err) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json({ message: "Note updated successfully" });
            }
        )
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
});

app.delete("/deleteNote/:noteID", function (req, res) {
    const token = req.cookies.jwt;
    if (token && JWT.verify(token, secret_key)) {
        const decoded = JWT.decode(token);
        pool.query(
            `DELETE FROM note WHERE userID = (SELECT userID FROM users WHERE email = ?) AND noteID = ?`,
            [decoded.email, req.params.noteID],
            function (err) {
                if (err) throw err;
                res.setHeader("Content-Type", "application/json");
                res.json({ message: "Note deleted successfully" });
            }
        )
    } else {
        console.log("User not logged in");
        res.redirect("/login");
    }
});

app.post("/logout", function (req, res) {
    res.clearCookie("jwt");
    console.log("User logged out successfully");
    res.setHeader("Content-Type", "application/json");
    res.json({ message: "User logged out successfully" });
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

let port = 8000;
app.listen(port, function () {
    console.log('Server running at http://localhost:' + port);
});