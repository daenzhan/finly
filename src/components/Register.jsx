import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUserThunk } from '../auth/authThunks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Пароль:</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Придумайте пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Имя (необязательно):</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Валюта по умолчанию:</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">Уже есть аккаунт? <a href="/login" className="text-blue-500 hover:underline">Войдите</a></p>
        </div>
      </form>
    </div>
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
