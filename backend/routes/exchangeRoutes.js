import express from 'express';
import { getRates } from '../utils/exchangeRates.js';

const router = express.Router();

// GET /api/exchange/rates?base=INR
router.get('/rates', async (req, res) => {
  const base = req.query.base || 'INR';
  try {
    const rates = await getRates(base);
    res.json({ success: true, base, rates });
  } catch (err) {
    console.error('Exchange rates error:', err.message || err);
    res.status(500).json({ success: false, error: 'Failed to fetch exchange rates' });
  }
});

export default router;
