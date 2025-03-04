// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const habitRoutes = require('./routes/habitRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.log('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/habits', habitRoutes);

app.listen(3000, () => {
  console.log('Servidor Express corriendo en el puerto 3000');
});

// src/models/habit.js
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  habitName: { type: String, required: true },
  completionCount: { type: Number, default: 0 },
  completedDates: [Date],  // Fechas cuando el hábito fue completado
  progress: { type: Number, default: 0 },  // Progreso en porcentaje
  lastCompleted: Date,  // Fecha del último día completado
}, {
  timestamps: true,
});

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;

// src/controllers/habitController.js
const Habit = require('../models/habit');

// Crear un nuevo hábito
const createHabit = async (req, res) => {
  const { userId, habitName } = req.body;

  try {
    const newHabit = new Habit({ userId, habitName });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un hábito
const deleteHabit = async (req, res) => {
  const { id } = req.params;

  try {
    await Habit.findByIdAndDelete(id);
    res.status(200).json({ message: 'Hábito eliminado con éxito' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Marcar hábito como completado
const completeHabit = async (req, res) => {
  const { id } = req.params;

  try {
    const habit = await Habit.findById(id);

    if (habit) {
      habit.completionCount += 1;
      habit.completedDates.push(new Date());
      habit.lastCompleted = new Date();
      
      // Calcular el progreso
      const daysNeeded = 66;
      habit.progress = (habit.completionCount / daysNeeded) * 100;

      await habit.save();
      res.status(200).json(habit);
    } else {
      res.status(404).json({ message: 'Hábito no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createHabit,
  deleteHabit,
  completeHabit,
};

// src/routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const { createHabit, deleteHabit, completeHabit } = require('../controllers/habitController');

// Rutas para manejar hábitos
router.post('/', createHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/complete', completeHabit);

module.exports = router;
