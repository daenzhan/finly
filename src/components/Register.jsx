import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUserThunk } from '../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

const currencies = [
  { code: 'RUB', name: 'Рубли (₽)' },
  { code: 'USD', name: 'Доллары ($)' },
  { code: 'EUR', name: 'Евро (€)' },
  { code: 'KZT', name: 'Тенге (₸)' },
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      registerUserThunk({ email, password, name, currency })
    );
    if (registerUserThunk.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Регистрация</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <input
        type="email"
        className="w-full border p-2 mb-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        className="w-full border p-2 mb-2 rounded"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <input
        type="text"
        className="w-full border p-2 mb-2 rounded"
        placeholder="Ваше имя (необязательно)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <select
        className="w-full border p-2 mb-4 rounded"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.name}
          </option>
        ))}
      </select>
      
      <button 
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}

// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { registerUserThunk } from '../features/auth/authThunks';
// import { useNavigate } from 'react-router-dom';

// export default function Register() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { error, loading } = useSelector((state) => state.auth);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await dispatch(registerUserThunk({ email, password }));
//     if (registerUserThunk.fulfilled.match(result)) {
//       navigate('/login');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
//       <h2 className="text-xl font-bold mb-4">Регистрация</h2>
//       {error && <p className="text-red-500">{error}</p>}
//       <input
//         type="email"
//         className="w-full border p-2 mb-2"
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         className="w-full border p-2 mb-2"
//         placeholder="Пароль"
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
//         {loading ? 'Регистрация...' : 'Зарегистрироваться'}
//       </button>
//     </form>
//   );
// }
