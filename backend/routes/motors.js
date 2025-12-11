// backend/routes/motors.js
const express = require("express");
const db = require("../db");

const router = express.Router();

// GET MOTORS IN A ZONE
router.get("/", (req, res) => {
  const zone = req.query.zone_id;
  if (!zone) return res.status(400).json({ error: "zone_id required" });

  const motors = db.prepare("SELECT * FROM motors WHERE zone_id = ?").all(zone);

  const result = motors.map(m => {
    const latest = db.prepare(`
      SELECT * FROM sensor_readings 
      WHERE motor_id = ? 
      ORDER BY timestamp DESC LIMIT 1
    `).get(m.id);

    return { ...m, latest };
  });

  res.json(result);
});

module.exports = router;
