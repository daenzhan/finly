import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// App.jsx
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} /> {/* Перенаправление */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/:userId"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
export default App;