import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/admin/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer zaten giriş yapılmışsa page-content sayfasına yönlendir
    if (isAuthenticated) {
      navigate('/admin/page-content');
    }
  }, [isAuthenticated, navigate]);

  return <LoginForm />;
};

export default AdminLogin;
