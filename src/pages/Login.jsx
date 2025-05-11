import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../styles/login.css'; // Import the CSS file
import '../styles/global.css'; // Import the global CSS file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just navigate to the Bills page
    navigate('/home');
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
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '15px' }}
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
    </Box>
  );
};

export default Login;