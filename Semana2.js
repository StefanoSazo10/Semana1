import { configureStore } from '@reduxjs/toolkit';

// Reducer de ejemplo, más tarde lo modificas para manejar los hábitos
const habitReducer = (state = [], action) => {
  switch (action.type) {
    case 'ADD_HABIT':
      return [...state, action.payload];
    case 'TOGGLE_HABIT':
      return state.map((habit) =>
        habit.id === action.payload ? { ...habit, completed: !habit.completed } : habit
      );
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    habits: habitReducer,
  },
});

export default store;

import { Provider } from 'react-redux';
import store from '../redux/store';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/habits'; // Reemplaza con la URL de tu API

export const getHabits = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching habits', error);
    throw error;
  }
};

import { useEffect, useState } from 'react';
import { getHabits } from '../services/habits';

export default function Home() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      const data = await getHabits();
      setHabits(data);
    };

    fetchHabits();
  }, []);

  return (
    <div>
      <h1>Mis Hábitos</h1>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>{habit.name}</li>
        ))}
      </ul>
    </div>
  );
}
