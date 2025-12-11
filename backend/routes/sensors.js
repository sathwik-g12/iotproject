const express = require("express");
const db = require("../db");

const router = express.Router();

// LATEST SENSOR READING
router.get("/:id/latest", (req, res) => {
  const id = req.params.id;
  const reading = db.prepare(`
    SELECT * FROM sensor_readings 
    WHERE motor_id = ? 
    ORDER BY timestamp DESC LIMIT 1
  `).get(id);

  res.json(reading);
});

// HISTORY OF SENSOR READINGS
router.get("/:id/history", (req, res) => {
  const id = req.params.id;
  const hours = parseInt(req.query.hours || "24");
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  const rows = db.prepare(`
    SELECT * FROM sensor_readings
    WHERE motor_id = ? AND timestamp >= ?
    ORDER BY timestamp ASC
  `).all(id, since);

  res.json(rows);
});

module.exports = router;
