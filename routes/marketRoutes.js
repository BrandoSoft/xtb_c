const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const {
    buyCurrency,
    sellCurrency,
    buyStock,
    sellStock,
    getPortfolio
} = require('../controllers/marketController');


const { getRates } = require('../services/rateService');
const { getStocks } = require('../services/stockService');

/**
 * @swagger
 * /api/market/rates:
 *   get:
 *     tags:
 *       - Market
 *     summary: Pobiera aktualne kursy walut (NBP tabela C)
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


/**
 * @swagger
 * /api/market/buy-currency:
 *   post:
 *     tags:
 *       - Market
 *     summary: Kupno waluty po kursie ASK (NBP tabela C)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "USD"
 *               quantity:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Waluta kupiona pomyślnie
 */
router.post('/buy-currency', protect, asyncHandler(buyCurrency));


/**
 * @swagger
 * /api/market/sell-currency:
 *   post:
 *     tags:
 *       - Market
 *     summary: Sprzedaż waluty po kursie BID (NBP tabela C)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "EUR"
 *               quantity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Waluta sprzedana pomyślnie
 */
router.post('/sell-currency', protect, asyncHandler(sellCurrency));


/**
 * @swagger
 * /api/market/buy-stock:
 *   post:
 *     tags:
 *       - Market
 *     summary: Kupno akcji po aktualnej cenie z Alpha Vantage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "AAPL"
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Akcje kupione pomyślnie
 */
router.post('/buy-stock', protect, asyncHandler(buyStock));


/**
 * @swagger
 * /api/market/sell-stock:
 *   post:
 *     tags:
 *       - Market
 *     summary: Sprzedaż akcji po aktualnej cenie z Alpha Vantage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "TSLA"
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Akcje sprzedane pomyślnie
 */
router.post('/sell-stock', protect, asyncHandler(sellStock));

/**
 * @swagger
 * /api/market/portfolio:
 *   get:
 *     tags:
 *       - Market
 *     summary: Pobiera aktualne portfolio użytkownika
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Zwraca balance, waluty i akcje użytkownika
 */
router.get('/portfolio', protect, asyncHandler(getPortfolio));


module.exports = router;
