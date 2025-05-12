import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './page/Register';
import Login from './page/Login';
import Dashboard from './components/Dashboard';
import StatsPage from './page/StatsPage';
import CategoriesPage from './page/CategoriesPage';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './auth/authContext'; 

function App() {
  return (
    <AuthProvider> 
      <ToastContainer position="bottom-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;