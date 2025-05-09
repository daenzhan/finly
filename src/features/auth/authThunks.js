import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password, name, currency }, { rejectWithValue }) => {
    try {
      const existing = await API.get(`/users?email=${email}`);
      if (existing.data.length > 0) {
        return rejectWithValue('Пользователь уже существует');
      }
      
      const newUser = {
        email,
        password, // В реальном приложении нужно хешировать!
        name: name || '',
        currency: currency || 'RUB',
      };
      
      const response = await API.post('/users', newUser);
      const userId = response.data.id;
      const createdAt = new Date().toISOString();

      // Создаем три стандартных счета для нового пользователя
      const defaultAccounts = [
        {
          userId,
          name: "Зарплата",
          icon: "money-bill-wave",
          balance: 0,
          createdAt
        },
        {
          userId,
          name: "Стипендия",
          icon: "graduation-cap",
          balance: 0,
          createdAt
        },
        {
          userId,
          name: "Инвестиции",
          icon: "chart-line",
          balance: 0,
          createdAt
        }
      ];

      // Сохраняем все счета в API
      await Promise.all(
        defaultAccounts.map(account => API.post('/accounts', account))
      );

      return response.data;
    } catch (err) {
      return rejectWithValue('Ошибка регистрации');
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await API.get(`/users?email=${email}&password=${password}`);
      if (res.data.length === 0) {
        return rejectWithValue('Неверный email или пароль');
      }
      return res.data[0];
    } catch {
      return rejectWithValue('Ошибка входа');
    }
  }
);