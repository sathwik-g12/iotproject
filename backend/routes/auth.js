// backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();
const SECRET = "supersecret"; // you can put in .env later

// LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ message: "Invalid username" });

  const check = bcrypt.compareSync(password, user.password);
  if (!check) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "5h" }
  );

  res.json({ token });
});

// GET CURRENT USER
router.get("/user", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = db.prepare("SELECT id, username, email FROM users WHERE id = ?").get(decoded.id);
    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
