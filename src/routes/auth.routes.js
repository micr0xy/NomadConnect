const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/testdb', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS time');
    res.json({ message: 'Database connected!', time: rows[0].time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

module.exports = router;
