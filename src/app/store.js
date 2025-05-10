// // store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// Импортируем новые редьюсеры
import accountReducer from '../redux/reducers/accountReducer';
import transactionReducer from '../redux/reducers/transactionReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountReducer,    // Добавляем редьюсер для счетов
    transactions: transactionReducer // Добавляем редьюсер для транзакций
  },
  // Опционально: можно добавить middleware и другие настройки
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});