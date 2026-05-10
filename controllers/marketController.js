const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getRates } = require('../services/rateService');
const { getStocks } = require('../services/stockService');

// ----------------------
//   BUY CURRENCY
// ----------------------
exports.buyCurrency = async (req, res) => {
    const { code, quantity } = req.body;
    const user = req.user;

    const rates = await getRates();
    const rate = rates.find(r => r.code === code);

    if (!rate) return res.status(400).json({ message: "Nie znaleziono waluty" });

    const price = rate.ask; // kupno = ask
    const totalCost = price * quantity;

    if (user.balance < totalCost) {
        return res.status(400).json({ message: "Za mało środków" });
    }

    // Aktualizacja balansu
    user.balance -= totalCost;

    // Aktualizacja portfolio
    let currency = user.portfolio.currencies.find(c => c.code === code);

    if (!currency) {
        user.portfolio.currencies.push({
            code,
            amount: quantity,
            lastBuyPrice: price,
            profit: 0
        });
    } else {
        currency.amount += quantity;
        currency.lastBuyPrice = price;
    }

    // Zapis transakcji
    await Transaction.create({
        user: user._id,
        type: "buy",
        assetType: "currency",
        symbol: code,
        quantity,
        price,
        totalValue: totalCost
    });

    await user.save();

    res.json({
        message: "Kupiono walutę",
        balance: user.balance,
        portfolio: user.portfolio
    });
};

// ----------------------
//   SELL CURRENCY
// ----------------------
exports.sellCurrency = async (req, res) => {
    const { code, quantity } = req.body;
    const user = req.user;

    const rates = await getRates();
    const rate = rates.find(r => r.code === code);

    if (!rate) return res.status(400).json({ message: "Nie znaleziono waluty" });

    const price = rate.bid; // sprzedaż = bid
    const totalGain = price * quantity;

    let currency = user.portfolio.currencies.find(c => c.code === code);

    if (!currency || currency.amount < quantity) {
        return res.status(400).json({ message: "Nie masz tyle waluty" });
    }

    // Liczymy zysk
    const profit = (price - currency.lastBuyPrice) * quantity;

    // Aktualizacja portfela
    currency.amount -= quantity;
    currency.profit += profit;

    // Aktualizacja balansu
    user.balance += totalGain;

    // Zapis transakcji
    await Transaction.create({
        user: user._id,
        type: "sell",
        assetType: "currency",
        symbol: code,
        quantity,
        price,
        totalValue: totalGain,
        profit
    });

    await user.save();

    res.json({
        message: "Sprzedano walutę",
        balance: user.balance,
        portfolio: user.portfolio
    });
};

// ----------------------
//   BUY STOCK
// ----------------------
exports.buyStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const user = req.user;

    const stocks = await getStocks();
    const stock = stocks.find(s => s.symbol === symbol);

    if (!stock) return res.status(400).json({ message: "Nie znaleziono akcji" });

    const price = stock.price;
    const totalCost = price * quantity;

    if (user.balance < totalCost) {
        return res.status(400).json({ message: "Za mało środków" });
    }

    user.balance -= totalCost;

    let position = user.portfolio.stocks.find(s => s.symbol === symbol);

    if (!position) {
        user.portfolio.stocks.push({
            symbol,
            amount: quantity,
            lastBuyPrice: price,
            profit: 0
        });
    } else {
        position.amount += quantity;
        position.lastBuyPrice = price;
    }

    await Transaction.create({
        user: user._id,
        type: "buy",
        assetType: "stock",
        symbol,
        quantity,
        price,
        totalValue: totalCost
    });

    await user.save();

    res.json({
        message: "Kupiono akcje",
        balance: user.balance,
        portfolio: user.portfolio
    });
};

// ----------------------
//   SELL STOCK
// ----------------------
exports.sellStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const user = req.user;

    const stocks = await getStocks();
    const stock = stocks.find(s => s.symbol === symbol);

    if (!stock) return res.status(400).json({ message: "Nie znaleziono akcji" });

    const price = stock.price;
    const totalGain = price * quantity;

    let position = user.portfolio.stocks.find(s => s.symbol === symbol);

    if (!position || position.amount < quantity) {
        return res.status(400).json({ message: "Nie masz tylu akcji" });
    }

    const profit = (price - position.lastBuyPrice) * quantity;

    position.amount -= quantity;
    position.profit += profit;

    user.balance += totalGain;

    await Transaction.create({
        user: user._id,
        type: "sell",
        assetType: "stock",
        symbol,
        quantity,
        price,
        totalValue: totalGain,
        profit
    });

    await user.save();

    res.json({
        message: "Sprzedano akcje",
        balance: user.balance,
        portfolio: user.portfolio
    });
};

// ----------------------
//   GET PORTFOLIO
// ----------------------

exports.getPortfolio = async (req, res) => {
    const user = req.user;

    res.json({
        balance: user.balance,
        currencies: user.portfolio.currencies,
        stocks: user.portfolio.stocks
    });
};