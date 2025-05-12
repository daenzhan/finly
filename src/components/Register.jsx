import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUserThunk } from '../auth/authThunks';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';
import { FaEnvelope, FaLock, FaUser, FaMoneyBillWave } from 'react-icons/fa';

const currencies = [
  { code: 'RUB', name: 'Rubles (₽)' },
  { code: 'USD', name: 'US Dollars ($)' },
  { code: 'EUR', name: 'Euros (€)' },
  { code: 'KZT', name: 'Tenge (₸)' },
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
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <FaEnvelope />
          </span>
          <input
            type="email"
            className={styles.input}
            placeholder="Enter email"
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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <FaUser />
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <span className={styles.selectIcon}>
            <FaMoneyBillWave />
          </span>
          <select
            className={styles.select}
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
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Sign up'}
        </button>
        
        <div className={styles.linkContainer}>
          <p className={styles.linkText}>Already have an account?? <a href="/login" className={styles.link}>Sign In</a></p>
        </div>
      </form>
    </div>
  );
}