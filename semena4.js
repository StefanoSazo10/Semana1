const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  habitName: { type: String, required: true },
  streak: { type: Number, default: 0 }, // Días consecutivos
  lastCompleted: { type: Date }, // Fecha del último día marcado
});

module.exports = mongoose.model('Habit', habitSchema);
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ userId: user._id }, 'secreto', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
const express = require('express');
const Habit = require('../models/Habit');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware para verificar el token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Acceso denegado' });
  
  jwt.verify(token, 'secreto', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.userId = decoded.userId;
    next();
  });
}

// Crear un nuevo hábito
router.post('/', verifyToken, async (req, res) => {
  const { habitName } = req.body;
  try {
    const newHabit = new Habit({ userId: req.userId, habitName });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el hábito' });
  }
});

// Marcar hábito como realizado
router.post('/done/:habitId', verifyToken, async (req, res) => {
  const { habitId } = req.params;
  try {
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) return res.status(404).json({ error: 'Hábito no encontrado' });

    const today = new Date();
    if (habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === today.toDateString()) {
      return res.status(400).json({ error: 'Ya marcaste este hábito hoy' });
    }

    if (habit.lastCompleted && new Date(habit.lastCompleted).getDate() + 1 !== today.getDate()) {
      habit.streak = 0; // Reiniciar racha si se pierde el día
    } else {
      habit.streak += 1; // Incrementar racha si el hábito es completado
    }
    habit.lastCompleted = today;
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar hábito como realizado' });
  }
});

module.exports = router;
