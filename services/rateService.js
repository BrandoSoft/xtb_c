const axios = require('axios');

let ratesCache = {
    data: null,
    lastFetched: null
};

// Funkcja dodająca "szum" rynkowy (zmiana o max +/- 0.05%)
const addNoise = (price) => {
    const noise = (Math.random() * 0.001) - 0.0005;
    return parseFloat((price * (1 + noise)).toFixed(4));
};

const getRates = async () => {
    const today = new Date().toDateString();

    // Jeśli mamy cache z dzisiaj zwracamy z szumem
    if (ratesCache.data && ratesCache.lastFetched === today) {
        return ratesCache.data.map(rate => ({
            ...rate,
            bid: addNoise(rate.bid),
            ask: addNoise(rate.ask)
        }));
    }

    // Pobieramy TABELĘ C (bid/ask)
    const response = await axios.get(
        'https://api.nbp.pl/api/exchangerates/tables/C?format=json'
    );

    const rates = response.data[0].rates;

    // Filtrujemy tylko waluty, które obslugujemy
    const filteredRates = rates.filter(r =>
        ['USD', 'EUR', 'GBP', 'CHF', 'JPY'].includes(r.code)
    );

    // Zapisujemy do cache
    ratesCache.data = filteredRates;
    ratesCache.lastFetched = today;

    // Zwracamy z dodanym szumem
    return filteredRates.map(rate => ({
        code: rate.code,
        currency: rate.currency,
        bid: addNoise(rate.bid),
        ask: addNoise(rate.ask)
    }));
};

module.exports = { getRates };
