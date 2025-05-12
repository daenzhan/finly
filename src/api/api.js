import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
      toast.error('Сессия истекла. Пожалуйста, войдите снова.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Превышено время ожидания ответа сервера');
    } else if (error.message === 'Network Error') {
      toast.error('Сервер недоступен. Проверьте подключение к интернету.');
    } else {
      toast.error('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
    return Promise.reject(error);
  }
);

export default API;
