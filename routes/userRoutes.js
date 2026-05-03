const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('express-async-handler');


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
// GET - Jeden użytkownik
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

// POST - Rejestracja
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
    const newUser = new User(req.body);

    // Jeśli Mongoose wyrzuci błąd walidacji, asyncHandler sam przekaże go jako status 400/500
    await newUser.save();
    res.status(201).json(newUser);
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