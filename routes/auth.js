// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, findUserByUsername } = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Замените на свой секретный ключ

// Регистрация
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await registerUser(username, hashedPassword);
        res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
        res.status(400).json({ message: 'Пользователь уже существует' });
    }
});

// Логин
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Неверные учетные данные' });
    }
});

module.exports = router;    