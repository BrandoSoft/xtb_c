const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getRates } = require('../services/rateService');
const { getStocks } = require('../services/stockService');

/**
 * @swagger
 * /api/market/rates:
 *   get:
 *     tags:
 *       - Market
 *     summary: Pobiera aktualne kursy walut
 *     responses:
 *       200:
 *         description: Sukces
 */
router.get('/rates', asyncHandler(async (req, res) => {
    const rates = await getRates();
    res.json(rates);
}));

/**
 * @swagger
 * /api/market/stocks:
 *   get:
 *     tags:
 *       - Market
 *     summary: Pobiera ceny 5 głównych spółek technologicznych
 *     responses:
 *       200:
 *         description: Sukces
 */
router.get('/stocks', asyncHandler(async (req, res) => {
    const stocks = await getStocks();
    res.json(stocks);
}));
module.exports = router;