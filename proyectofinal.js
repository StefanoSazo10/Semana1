let user = '';
let habits = {};

// Inicia sesión con nombre de usuario
function login() {
  user = document.getElementById('username').value.trim();
  if (!user) return alert("Introduce un nombre de usuario");

  habits = JSON.parse(localStorage.getItem(user)) || {};
  document.getElementById('userDisplay').innerText = user;
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
  renderHabits();
}

// Guarda hábitos en localStorage
function saveHabits() {
  localStorage.setItem(user, JSON.stringify(habits));
}

// Añade un nuevo hábito
function addHabit() {
  const name = document.getElementById('habitInput').value.trim();
  if (!name) return;
  habits[name] = { count: 0, lastDate: null };
  saveHabits();
  renderHabits();
  document.getElementById('habitInput').value = '';
}

// Marca el hábito como hecho hoy
function markHabit(name) {
  const today = new Date().toISOString().split('T')[0];
  const habit = habits[name];

  if (habit.lastDate === today) return alert("Ya lo marcaste hoy");

  const last = habit.lastDate ? new Date(habit.lastDate) : null;
  const now = new Date(today);
  const diff = last ? (now - last) / (1000 * 60 * 60 * 24) : 0;

  if (diff === 1 || !last) {
    habit.count++;
  } else if (diff > 1) {
    habit.count = 1;
  }

  habit.lastDate = today;
  saveHabits();
  renderHabits();
}

// Dibuja la lista de hábitos con su progreso
function renderHabits() {
  const container = document.getElementById('habitList');
  container.innerHTML = '';

  Object.keys(habits).forEach(name => {
    const { count, lastDate } = habits[name];
    const progress = Math.min((count / 66) * 100, 100);
    const color = progress < 33 ? 'red' : progress < 66 ? 'orange' : 'green';

    container.innerHTML += `
      <div class="habit">
        <strong>${name}</strong><br>
        Días seguidos: ${count} / 66<br>
        Última marca: ${lastDate || '-'}
        <div class="progress-container">
          <div class="progress-bar" style="width:${progress}%; background-color:${color};"></div>
        </div>
        <button onclick="markHabit('${name}')">✅ Marcar hoy</button>
      </div>
    `;
  });
}

