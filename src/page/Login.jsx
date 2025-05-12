import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserThunk } from '../auth/authThunks';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUserThunk({ email, password }));
    if (loginUserThunk.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Sign In</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <FaEnvelope />
          </span>
          <input
            type="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <FaLock />
          </span>
          <input
            type="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Sign in'}
        </button>
        
        <div className={styles.linkContainer}>
          <p className={styles.linkText}>Don't have an account? <a href="/register" className={styles.link}>Sign up</a></p>
        </div>
      </form>
    </div>
  );
}