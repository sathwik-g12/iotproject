// backend/db.js
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// initialize DB + tables + seed
function init() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Zones table
  db.exec(`
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_name TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    );
  `);

  // Motors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS motors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motor_name TEXT NOT NULL,
      zone_id INTEGER,
      motor_type TEXT NOT NULL,
      rated_power_kw REAL NOT NULL,
      installation_date TEXT,
      status TEXT DEFAULT 'running',
      FOREIGN KEY(zone_id) REFERENCES zones(id)
    );
  `);

  // Sensor Readings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motor_id INTEGER,
      timestamp TEXT NOT NULL,
      temperature_celsius REAL NOT NULL,
      vibration_mm_s REAL NOT NULL,
      sound_db REAL NOT NULL,
      FOREIGN KEY(motor_id) REFERENCES motors(id)
    );
  `);

  // Seed users
  const countUsers = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (countUsers === 0) {
    const insert = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    insert.run("admin", bcrypt.hashSync("admin123", 8), "admin@example.com");
    insert.run("operator", bcrypt.hashSync("operator123", 8), "operator@example.com");
    console.log("Seeded users ✔");
  }

  // Seed sample zones & motors
  const countZones = db.prepare("SELECT COUNT(*) as c FROM zones").get().c;
  if (countZones === 0) {
    const z1 = db.prepare("INSERT INTO zones (zone_name, location) VALUES (?, ?)").run("Assembly Line A", "Building 1 Floor 2").lastInsertRowid;
    const z2 = db.prepare("INSERT INTO zones (zone_name, location) VALUES (?, ?)").run("Packaging Zone", "Building 2 Floor 1").lastInsertRowid;

    const m1 = db.prepare(`
      INSERT INTO motors (motor_name, zone_id, motor_type, rated_power_kw, installation_date)
      VALUES (?, ?, ?, ?, ?)
    `).run("Motor A1", z1, "Induction", 5.5, "2023-04-10").lastInsertRowid;

    const m2 = db.prepare(`
      INSERT INTO motors (motor_name, zone_id, motor_type, rated_power_kw, installation_date)
      VALUES (?, ?, ?, ?, ?)
    `).run("Motor B1", z2, "Servo", 3.0, "2024-01-20").lastInsertRowid;

    // Add initial sensor readings
    const insertReading = db.prepare(`
      INSERT INTO sensor_readings (motor_id, timestamp, temperature_celsius, vibration_mm_s, sound_db)
      VALUES (?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    insertReading.run(m1, now, 55, 2.5, 70);
    insertReading.run(m2, now, 48, 1.8, 65);

    console.log("Seeded zones, motors & initial readings ✔");
  }
}

init();

module.exports = db;
