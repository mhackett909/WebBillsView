import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const Logout = () => {
  const navigate = useNavigate();
  const { setLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    setLoggedIn(false);
    navigate('/', { state: { showLogoutSnackbar: true }, replace: true });
  }, [navigate, setLoggedIn]);

  // This component will unmount immediately, so nothing is rendered
  return null;
};

export default Logout;