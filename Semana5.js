// middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Cargar las variables de entorno
dotenv.config();

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
// routes/protectedRoute.js
const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.user });
});

module.exports = router;
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (error) {
    res.status(400).json({ message: 'Error en el registro', error });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error });
  }
});

module.exports = router;
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login exitoso');
    } else {
      alert('Error en el login');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
};

export default Login;
import { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.message === 'Usuario registrado correctamente.') {
      alert('Registro exitoso');
    } else {
      alert('Error en el registro');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;
// Ejemplo de solicitud con JWT
const fetchProtectedData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    console.log(data);
  };
// pages/addHabit.js
import { useState } from 'react';

const AddHabit = () => {
  const [habit, setHabit] = useState('');
  const [message, setMessage] = useState('');

  const handleAddHabit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ habit }),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div>
      <form onSubmit={handleAddHabit}>
        <input type="text" value={habit} onChange={(e) => setHabit(e.target.value)} placeholder="Nuevo hábito" required />
        <button type="submit">Agregar hábito</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddHabit;
  