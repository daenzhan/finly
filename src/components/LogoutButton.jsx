// components/LogoutButton.jsx
import { useDispatch } from 'react-redux';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return <button onClick={handleLogout}>Выйти</button>;
}