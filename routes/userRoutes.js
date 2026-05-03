const express = require('express');
const router = express.Router();
const User = require('../models/User');




/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Sprawdza czy backend żyje
 *     responses:
 *       200:
 *         description: Zwraca status działania serwera.
 */
router.get('/health', (req, res) => {
    res.json({ status: "Działa", message: "Serwer XTB jest online!" });
});

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
router.post('/users/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: "Błąd rejestracji", error: err.message });
    }
});

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
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Nie ma takiego użytkownika" });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: "Nieprawidłowe zapytanie (400 Bad Request)" });
    }
});


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
router.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "Użytkownik nie istnieje" });
        res.json({ message: "Użytkownik usunięty pomyślnie" });
    } catch (err) {
        res.status(400).json({ message: "Błąd podczas usuwania" });
    }
});

module.exports = router;