import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const PrivateRoute = () => {
  const { user, loading } = useSelector(state => state.auth);
  
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!user) {
    toast.error('Для доступа требуется авторизация');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;