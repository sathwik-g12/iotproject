// backend/routes/zones.js
const express = require("express");
const db = require("../db");

const router = express.Router();

// GET ALL ZONES WITH HEALTH DATA
router.get("/", (req, res) => {
  const zones = db.prepare("SELECT * FROM zones").all();
  const results = [];

  for (const z of zones) {
    const motors = db.prepare("SELECT id FROM motors WHERE zone_id = ?").all(z.id);
    const ids = motors.map(m => m.id);

    let normal = 0, warning = 0, critical = 0;

    if (ids.length > 0) {
      const idsString = ids.map(() => "?").join(",");
      const readings = db.prepare(`
        SELECT motor_id, temperature_celsius, vibration_mm_s, sound_db
        FROM sensor_readings
        WHERE motor_id IN (${idsString})
        GROUP BY motor_id
        HAVING MAX(timestamp)
      `).all(...ids);

      for (const r of readings) {
        let status = "normal";

        if (r.temperature_celsius > 80 || r.vibration_mm_s > 7.1 || r.sound_db > 85)
          status = "critical";
        else if (r.temperature_celsius >= 70 || r.vibration_mm_s >= 4.5 || r.sound_db >= 75)
          status = "warning";

        if (status === "normal") normal++;
        else if (status === "warning") warning++;
        else critical++;
      }
    }

    results.push({
      id: z.id,
      zone_name: z.zone_name,
      location: z.location,
      motors_count: ids.length,
      normal,
      warning,
      critical
    });
  }

  res.json(results);
});

module.exports = router;
