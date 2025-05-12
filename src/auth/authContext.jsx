import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthThunk } from '../auth/authThunks';
import { logout } from './authSlice';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);