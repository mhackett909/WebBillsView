import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../App';
import { login } from '../utils/BillsApiUtil';
import '../styles/login.css'; // Import the CSS file
import '../styles/global.css'; // Import the global CSS file
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [inputtedUserName, setInputtedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogoutSnackbar, setShowLogoutSnackbar] = useState(false);
  const [showAccountCreated, setShowAccountCreated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setJwt, setUsername, setRefresh } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.showLogoutSnackbar) {
      setShowLogoutSnackbar(true);
      const timer = setTimeout(() => setShowLogoutSnackbar(false), 2000);
      return () => clearTimeout(timer);
    }
    if (location.state && location.state.showAccountCreated) {
      setShowAccountCreated(true);
      const timer = setTimeout(() => setShowAccountCreated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      // Optionally check for expiry
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() < expiry) {
          navigate('/home');
        }
      } catch (e) {
        // If JWT is invalid, do nothing
      }
    }
  }, [navigate]);

  // Helper to get a user-friendly error message from the login response
  function getErrorMessageFromResponse(response) {
    let errorMsg = response && (response.message || response.detail || response.error);
    if (errorMsg && typeof errorMsg === 'string') {
      if (errorMsg.includes('ECONNREFUSED')) {
        return 'Service Currently Unavailable. Please try again later.';
      } else if (
        errorMsg.toLowerCase().includes('unauthorized') ||
        errorMsg.toLowerCase().includes('401')
      ) {
        return 'Unauthorized: Invalid username or password.';
      }
      return errorMsg;
    }
    return 'Login failed for an unknown reason.';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputtedUserName || !password) return;
    const response = await login({ username: inputtedUserName, password });
    if (response && response.accessToken) {
      setJwt(response.accessToken);
      setRefresh(response.refreshToken);
      setUsername(response.username || inputtedUserName);
      navigate('/home');
    } else {
      const errorMsg = getErrorMessageFromResponse(response);
      setLoginError(errorMsg);
    }
  };

  const handleCreateUser = () => {
    // Navigate to the Create User page
    navigate('/user');
  };

  return (
    <Box className="login-container">
      <Typography variant="h4" component="h1" gutterBottom>
        Login or Create User
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="login-form"
      >
        <div className="input-border">
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={inputtedUserName}
            onChange={(e) => setInputtedUsername(e.target.value)}
            sx={{ marginBottom: '15px' }}
            required
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '15px' }}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginBottom: '10px', width: '100%' }}
        >
          Submit
        </Button>
      </Box>

      <Button
        onClick={handleCreateUser}
        variant="contained"
        color="secondary"
        sx={{ width: '300px' }}
      >
        Create User
      </Button>

      <Snackbar
        open={showLogoutSnackbar}
        message="You have been logged out"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setShowLogoutSnackbar(false)}
      />
      <Snackbar
        open={showAccountCreated}
        message="Account created! Please log in."
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setShowAccountCreated(false)}
      />
      <Snackbar
        open={!!loginError}
        message={loginError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setLoginError('')}
        autoHideDuration={3000}
      />
    </Box>
  );
};

export default Login;