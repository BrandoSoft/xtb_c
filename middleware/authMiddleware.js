const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Sprawdzamy czy w nagłówkach jest Bearer Token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Wyciągamy sam token (ucinamy słowo 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Weryfikujemy token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Pobieramy dane użytkownika z bazy (bez hasła) i przypisujemy do req.user
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Przepuszczamy dalej
        } catch (error) {
            res.status(401);
            throw new Error('Brak autoryzacji, token nieprawidłowy');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Brak autoryzacji, brak tokena');
    }
});

module.exports = { protect };