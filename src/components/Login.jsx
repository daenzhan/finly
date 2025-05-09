import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserThunk } from '../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);

  // features/auth/Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await dispatch(loginUserThunk({ email, password }));
  if (loginUserThunk.fulfilled.match(result)) {
    navigate(`/dashboard/${result.payload.id}`); // Перенаправляем с userId
  }
};

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Вход</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        className="w-full border p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full border p-2 mb-2"
        placeholder="Пароль"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}
