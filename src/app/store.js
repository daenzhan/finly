import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import accountReducer from '../redux/reducers/accountReducer';
import transactionReducer from '../redux/reducers/transactionReducer';
import categoryReducer from '../redux/reducers/categoryReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountReducer,
    transactions: transactionReducer,
    categories: categoryReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});