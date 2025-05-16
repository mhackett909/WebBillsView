import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Logout = () => {
  const navigate = useNavigate();
  const { setJwt, setUsername } = useContext(AuthContext);

  useEffect(() => {
    setJwt(null);
    setUsername(null);
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('jwt');
    navigate('/', { state: { showLogoutSnackbar: true }, replace: true });
  }, [navigate, setJwt, setUsername]);

  // This component will unmount immediately, so nothing is rendered
  return null;
};

export default Logout;