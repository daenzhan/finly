import API from '../api/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const DEFAULT_ACCOUNTS = [
  { name: "Кошелек: ", icon: "money-bill-wave", balance: 0 },
  { name: "Банковская карта: ", icon: "credit-card", balance: 0 },
  { name: "Инвестиции: ", icon: "chart-line", balance: 0 }
];

const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || defaultMessage;
  toast.error(message);
  return message;
};

export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user?.id) {
        return rejectWithValue('Требуется авторизация');
      }
      
      const res = await API.get(`/users/${user.id}`);
      return res.data;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(handleApiError(err, 'Ошибка проверки авторизации'));
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password, name, currency }, { rejectWithValue }) => {
    try {
      // Проверка существующего пользователя
      const existing = await API.get(`/users?email=${email}`);
      if (existing.data.length > 0) {
        return rejectWithValue('Пользователь с таким email уже существует');
      }
      
      // Создание нового пользователя
      const newUser = {
        email,
        password,
        name: name || 'Новый пользователь',
        currency: currency || 'RUB',
      };
      
      const response = await API.post('/users', newUser);
      const userId = response.data.id;
      
      // Создаем стандартные счета
      const accountsWithUserId = DEFAULT_ACCOUNTS.map(account => ({
        ...account,
        userId,
        createdAt: new Date().toISOString()
      }));
      
      await Promise.all(
        accountsWithUserId.map(account => API.post('/accounts', account))
      );

      // Сохраняем данные пользователя (без пароля)
      const { password: _, ...userData } = response.data;
      localStorage.setItem('token', userId);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Регистрация прошла успешно!');
      return userData;
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Ошибка регистрации'));
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await API.get(`/users?email=${email}&password=${password}`);
      
      if (!res.data || res.data.length === 0) {
        return rejectWithValue('Неверный email или пароль');
      }
      
      const userData = res.data[0];
      
      // Сохраняем данные аутентификации
      localStorage.setItem('token', userData.id);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Получаем счета пользователя
      const accountsRes = await API.get(`/accounts?userId=${userData.id}`);
      userData.accounts = accountsRes.data || [];
      
      toast.success(`Добро пожаловать, ${userData.name || userData.email}!`);
      return userData;
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Ошибка входа'));
    }
  }
);

export const addAccountThunk = createAsyncThunk(
  'accounts/add',
  async ({ userId, accountData }, { rejectWithValue }) => {
    try {
      const newAccount = {
        ...accountData,
        userId,
        balance: accountData.balance || 0,
        createdAt: new Date().toISOString()
      };
      
      const response = await API.post('/accounts', newAccount);
      toast.success(`Счет "${newAccount.name}" успешно создан`);
      return response.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Ошибка создания счета'));
    }
  }
);

export const fetchUserAccountsThunk = createAsyncThunk(
  'accounts/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/accounts?userId=${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Ошибка загрузки счетов'));
    }
  }
);