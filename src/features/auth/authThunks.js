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