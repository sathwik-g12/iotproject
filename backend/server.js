require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");

// ROUTES
const auth = require("./routes/auth");
const zones = require("./routes/zones");
const motors = require("./routes/motors");
const sensors = require("./routes/sensors");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// API ROUTES
app.use("/api/auth", auth);
app.use("/api/zones", zones);
app.use("/api/motors", motors);
app.use("/api/sensors", sensors);

// DEFAULT ROUTE → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running → http://localhost:" + PORT);
});
