npm install @reduxjs/toolkit react-redux
// redux/habitsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  habits: [],
};

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits: (state, action) => {
      state.habits = action.payload;
    },
    addHabit: (state, action) => {
      state.habits.push(action.payload);
    },
  },
});

export const { setHabits, addHabit } = habitsSlice.actions;

export default habitsSlice.reducer;
// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import habitsReducer from './habitsSlice';

const store = configureStore({
  reducer: {
    habits: habitsReducer,
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
// components/HabitsList.js
import { useSelector, useDispatch } from 'react-redux';
import { addHabit } from '../redux/habitsSlice';

const HabitsList = () => {
  const habits = useSelector((state) => state.habits.habits);
  const dispatch = useDispatch();

  const handleAddHabit = () => {
    const newHabit = prompt('Introduce un nuevo hábito');
    if (newHabit) {
      dispatch(addHabit(newHabit));
    }
  };

  return (
    <div>
      <h2>Lista de hábitos</h2>
      <ul>
        {habits.map((habit, index) => (
          <li key={index}>{habit}</li>
        ))}
      </ul>
      <button onClick={handleAddHabit}>Añadir hábito</button>
    </div>
  );
};

export default HabitsList;
// pages/index.js
import HabitsList from '../components/HabitsList';

const Home = () => {
  return (
    <div>
      <h1>Mi aplicación de hábitos</h1>
      <HabitsList />
    </div>
  );
};

export default Home;
// components/ProgressBar.js
const ProgressBar = () => {
    return (
      <div className="w-full bg-gray-200 rounded-full">
        <div className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: '50%' }}>
          50%
        </div>
      </div>
    );
  };
  
  export default ProgressBar;
// pages/index.js
import ProgressBar from '../components/ProgressBar';
import HabitsList from '../components/HabitsList';

const Home = () => {
  return (
    <div>
      <h1>Mi aplicación de hábitos</h1>
      <ProgressBar />
      <HabitsList />
    </div>
  );
};

export default Home;
// components/DoneButton.js
const DoneButton = () => {
    return (
      <button className="bg-green-500 text-white p-2 rounded-lg">
        Done
      </button>
    );
  };
  
  export default DoneButton;
// pages/index.js
import DoneButton from '../components/DoneButton';
import ProgressBar from '../components/ProgressBar';
import HabitsList from '../components/HabitsList';

const Home = () => {
  return (
    <div>
      <h1>Mi aplicación de hábitos</h1>
      <ProgressBar />
      <HabitsList />
      <DoneButton />
    </div>
  );
};

export default Home;
    