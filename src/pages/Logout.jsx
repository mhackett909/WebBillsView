import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Logout = () => {
  const navigate = useNavigate();
  const { setJwt, setUsername } = useContext(AuthContext);

  useEffect(() => {
    setJwt(null);
    setUsername(null);
    localStorage.removeItem('username');
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('filters');
    sessionStorage.removeItem('includeArchived');
    sessionStorage.removeItem('dateRange');
    sessionStorage.removeItem('dateMode');
    sessionStorage.removeItem('page');
    sessionStorage.removeItem('pageSize');
    sessionStorage.removeItem('columnVisibilityModel');
    sessionStorage.removeItem('sortModel');
    navigate('/', { state: { showLogoutSnackbar: true }, replace: true });
  }, [navigate, setJwt, setUsername]);

  // This component will unmount immediately, so nothing is rendered
  return null;
};

export default Logout;