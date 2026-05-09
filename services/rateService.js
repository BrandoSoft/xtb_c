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

    if (ratesCache.data && ratesCache.lastFetched === today) {
        return ratesCache.data.map(rate => ({
            ...rate,
            mid: addNoise(rate.mid)
        }));
    }

    // Bez try-catch: błąd z axios poleci prosto do asyncHandler w routes
    const response = await axios.get('https://api.nbp.pl/api/exchangerates/tables/A?format=json');
    const rates = response.data[0].rates;
    const filteredRates = rates.filter(r => ['USD', 'EUR', 'GBP', 'CHF'].includes(r.code));

    ratesCache.data = filteredRates;
    ratesCache.lastFetched = today;

    return filteredRates.map(rate => ({
        ...rate,
        mid: addNoise(rate.mid)
    }));
};

module.exports = { getRates };