import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom'; // Import BrowserRouter and Link
import React, { useState } from 'react';
import Login from './pages/Login';
import Bills from './pages/Bills';
import Details from './pages/Details';
import NewUser from './pages/NewUser';

const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <AppBar position="static" style={{ backgroundColor: "blue", color: "white" }}>
          <Toolbar style={{ justifyContent: 'space-between' }}>
            {/* Left Side: Bill Manager and Tools */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                color="inherit"
                component={Link}
                to="/bills"
                style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}
              >
                Bill Manager
              </Typography>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                style={{ marginRight: '10px', color: 'yellow'}}
              >
                Tools
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Statistics</MenuItem>
                <MenuItem onClick={handleMenuClose}>Export to CSV</MenuItem>
                <MenuItem onClick={handleMenuClose}>Archives</MenuItem>
              </Menu>
            </Box>
            {/* Right Side: Account and Logout */}
            <Box>
              <Button color="inherit" style={{ marginRight: '10px', color: 'yellow' }}>Account</Button>
              <Button color="inherit" style={{ color: 'yellow' }}>Logout</Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/bills" element={<Bills />} />
          <Route path="/details" element={<Details />} />
          <Route path="/newuser" element={<NewUser />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;