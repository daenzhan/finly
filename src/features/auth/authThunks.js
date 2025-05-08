import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const existing = await API.get(`/users?email=${email}`);
      if (existing.data.length > 0) {
        return rejectWithValue('Пользователь уже существует');
      }
      await API.post('/users', { email, password });
      return;
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
