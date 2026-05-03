const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// Funkcja pomocnicza do tworzenia tokena
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token ważny przez 30 dni
    });
};

// GET

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Sprawdza czy backend żyje (z nowym handlerem)
 *     responses:
 *       200:
 *         description: Zwraca status działania serwera.
 */
router.get('/health', asyncHandler(async (req, res) => {

    res.status(200).json({
        success: true,
        status: "Działa",
        message: "Serwer XTB jest online!"
    });
}));

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Pobiera listę wszystkich użytkowników
 *     responses:
 *       200:
 *         description: Lista użytkowników pobrana pomyślnie
 */
router.get('/users/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Błąd serwera" });
    }
});

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Pobiera profil zalogowanego użytkownika (Wymaga Tokena)
 *     responses:
 *       200:
 *         description: Zwraca dane zalogowanego usera
 *       401:
 *         description: Brak tokena
 */
router.get('/users/profile', protect, asyncHandler(async (req, res) => {
    // Dzięki middleware 'protect', mamy dostęp do req.user!
    res.json(req.user);
}));

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Pobiera jednego użytkownika (z obsługą błędów)
 *     parameters:           # <--- TEJ SEKCJI BRAKUJE
 *       - in: path         # Określamy, że parametr jest w URL
 *         name: id         # Nazwa musi być taka sama jak w {id}
 *         required: true   # ID jest wymagane
 *         schema:
 *           type: string   # Typ danych (w MongoDB to string)
 *     responses:
 *       200:
 *         description: Sukces
 *       404:
 *         description: Nie znaleziono użytkownika
 */
router.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        const error = new Error("Użytkownik o podanym ID nie istnieje");
        error.statusCode = 404;
        throw error;
    }

    res.json(user);
}));



// POST

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Użytkownik stworzony
 *       400:
 *         description: Błąd zapytania
 */
router.post('/users', asyncHandler(async (req, res) => {

    const { username, email, password, balance } = req.body;

    // 1. Tworzymy nową instancję modelu (tu jeszcze hasło jest jawne)
    const user = new User({
        username,
        email,
        password, // To hasło zostanie zahashowane w modelu User.js przez pre('save')
        balance
    });

    // 2. Wywołujemy .save() - to odpala mechanizm szyfrowania z modelu
    await user.save();
    // Konwertujemy dokument Mongoose na zwykły obiekt JS i usuwamy hasło
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
}));

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Logowanie użytkownika i pobranie tokena
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zalogowano pomyślnie, zwraca token
 *       401:
 *         description: Nieprawidłowy email lub hasło
 */
router.post('/users/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Szukamy użytkownika po emailu
    const user = await User.findOne({ email });

    // 2. Sprawdzamy czy użytkownik istnieje i czy hasło pasuje (używając metody matchPassword z modelu)
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id), // Wysyłamy wygenerowany token
        });
    } else {
        res.status(401);
        throw new Error('Nieprawidłowy email lub hasło');
    }
}));


// PUT - Aktualizacja
/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Aktualizacja danych użytkownika
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dane zaktualizowane
 *       404:
 *         description: Nie znaleziono użytkownika
 */
router.put('/users/:id', asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true // Sprawdza poprawność danych przy aktualizacji
    });

    if (!updatedUser) {
        const error = new Error("Nie ma takiego użytkownika");
        error.statusCode = 404;
        throw error;
    }

    res.json(updatedUser);
}));

// DELETE - Usuwanie
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Usunięcie konta użytkownika
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Użytkownik usunięty
 */
router.delete('/users/:id', asyncHandler(async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
        const error = new Error("Użytkownik nie istnieje");
        error.statusCode = 404;
        throw error;
    }

    res.json({ message: "Użytkownik usunięty pomyślnie" });
}));

module.exports = router;