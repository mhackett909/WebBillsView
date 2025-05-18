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
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const AppToolbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const navigate = useNavigate(); // Initialize navigate
    const { jwt, username } = useContext(AuthContext);

    const contactEnabled = process.env.REACT_APP_CONTACT_ME_ENABLED === 'true';

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
                    <RequestQuoteIcon sx={{ fontSize: '2rem', color: '#00e676', marginRight: '18px', filter: 'drop-shadow(0 1px 2px #1976d2)' }} />
                    <Typography
                        variant="h5"
                        color="inherit"
                        component={Link}
                        to="/home"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            marginRight: '20px',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                            textShadow: '0 2px 4px #1976d2',
                            background: 'none',
                            WebkitBackgroundClip: 'initial',
                            WebkitTextFillColor: 'initial',
                            display: 'inline-block',
                            fontSize: '1.7rem',
                        }}
                    >
                        Bill Manager <span style={{ color: 'yellow', fontWeight: 900, fontSize: '1.15em', letterSpacing: '3px', marginLeft: '6px', textTransform: 'uppercase', textShadow: '0 1px 2px #1976d2', fontStyle: 'italic', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Web</span>
                    </Typography>
                </Box>
                {/* Right Side: History, Account, and User Dropdown */}
                {jwt && (
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
                        {username ? username.toUpperCase() : ''}
                    </Button>
                    <Menu
                        anchorEl={userMenuAnchorEl}
                        open={Boolean(userMenuAnchorEl)}
                        onClose={handleUserMenuClose}
                    >
                        <MenuItem onClick={handleNavigateToAccount}>Account</MenuItem>
                        {contactEnabled && (
                          <MenuItem onClick={handleNavigateToContact}>Support</MenuItem>
                        )}
                        <MenuItem onClick={handleNavigateToLogout}>Logout</MenuItem>
                    </Menu>
                  </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;