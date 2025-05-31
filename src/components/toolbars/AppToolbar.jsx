import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import banner from '../../assets/banner.png';
import { useState, useContext } from 'react';
import { AuthContext } from '../../App';

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
        <AppBar position="static" color="primary" sx={{ bgcolor: 'primary.dark', color: 'white' }}>
            <Toolbar style={{ justifyContent: 'space-between', paddingLeft: 0, minHeight: 0 }}>
                {/* Left Side: Bill Manager */}
                <Box style={{ display: 'flex', alignItems: 'center', marginLeft: 0, paddingLeft: 0, height: '100%', cursor: 'pointer' }} onClick={() => navigate('/home')}>
                    <img src={banner} alt="Bill Manager Banner" style={{ height: '65px' }} />
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
                        PaperProps={{
                            sx: { bgcolor: 'info.main', color: 'white' }
                        }}
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
                        PaperProps={{
                            sx: { bgcolor: 'info.main', color: 'white' }
                        }}
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