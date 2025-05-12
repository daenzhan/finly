// components/LogoutButton.jsx
import { useDispatch } from 'react-redux';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LogBtn.module.css';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className={styles.logoutButton}
    >
      <i className={`${styles.icon} fas fa-sign-out-alt`}></i>
      Выйти
    </button>
  );
}