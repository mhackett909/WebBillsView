import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../App';
import '../styles/login.css'; // Import the CSS file
import '../styles/global.css'; // Import the global CSS file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogoutSnackbar, setShowLogoutSnackbar] = useState(false);
  const [showAccountCreated, setShowAccountCreated] = useState(false);
  const { setLoggedIn } = useContext(AuthContext);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoggedIn(false); // Reset before login attempt
    if (!username || !password) return;
    try {
      // Simulate API call
      // Replace this with your real API call, e.g. await api.login({ username, password })
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoggedIn(true);
      navigate('/home');
    } catch (err) {
      // Handle error (show error message, etc.)
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ marginBottom: '15px' }}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '15px' }}
            required
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
    </Box>
  );
};

export default Login;