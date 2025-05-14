import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useState, useContext } from 'react';
import { AuthContext } from '../../App';

const AppToolbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const navigate = useNavigate(); // Initialize navigate
    const { loggedIn } = useContext(AuthContext);
    const username = 'JOHNDOE'; // Replace with real user context if available

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // New navigation functions
    const handleNavigateToArchives = () => {
        navigate('/archives');
        handleMenuClose();
    };

    const handleNavigateToRecycleBin = () => {
        navigate('/recycle');
        handleMenuClose();
    };

    const handleNavigateToAccount = () => {
        navigate('/account');
        handleUserMenuClose();
    };

    const handleNavigateToContact = () => {
        navigate('/contact');
        handleUserMenuClose();
    };

    const handleNavigateToLogout = () => {
        navigate('/logout');
        handleUserMenuClose();
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchorEl(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    return (
        <AppBar position="static" style={{ backgroundColor: "blue", color: "white" }}>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                {/* Left Side: Bill Manager */}
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        color="inherit"
                        component={Link}
                        to="/home"
                        style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}
                    >
                        Bill Manager
                    </Typography>
                </Box>
                {/* Right Side: History, Account, and User Dropdown */}
                {loggedIn && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        color="inherit"
                        onClick={handleMenuOpen}
                        style={{ color: 'yellow' }}
                    >
                        History
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleNavigateToArchives}>Archives</MenuItem>
                        <MenuItem onClick={handleNavigateToRecycleBin}>Recycle Bin</MenuItem>
                    </Menu>
                    <Button
                        color="inherit"
                        onClick={handleUserMenuOpen}
                        style={{ color: 'yellow', textTransform: 'none', fontWeight: 600 }}
                    >
                        {username.toUpperCase()}
                    </Button>
                    <Menu
                        anchorEl={userMenuAnchorEl}
                        open={Boolean(userMenuAnchorEl)}
                        onClose={handleUserMenuClose}
                    >
                        <MenuItem onClick={handleNavigateToAccount}>Account</MenuItem>
                        <MenuItem onClick={handleNavigateToContact}>Support</MenuItem>
                        <MenuItem onClick={handleNavigateToLogout}>Logout</MenuItem>
                    </Menu>
                  </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;