const axios = require('axios');

let stockCache = {
    data: null,
    lastFetched: null
};

// Funkcja pomocnicza do robienia pauzy (żeby nie dostać bana za 5 req/min)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStocks = async () => {
    const today = new Date().toDateString();

    // 1. Sprawdzamy cache
    if (stockCache.data && stockCache.lastFetched === today) {
        return stockCache.data;
    }

    const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA'];
    const results = [];

    console.log("⏳ Pobieranie danych z Alpha Vantage...");

    for (const symbol of symbols) {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: symbol,
                apikey: process.env.ALPHA_VANTAGE_KEY
            }
        });

        const data = response.data['Global Quote'];
        if (data) {
            results.push({
                symbol: data['01. symbol'],
                price: parseFloat(data['05. price']),
                change: data['09. change']
            });
        }

        // Czekamy 15 sekund między akcjami, żeby zmieścić się w limicie 5/min
        if (symbol !== 'TSLA') await delay(5000);
    }

    stockCache.data = results;
    stockCache.lastFetched = today;

    return results;
};

module.exports = { getStocks };