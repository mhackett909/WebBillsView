import { GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { exportEntries } from '../../utils/BillsApiUtil';

const CustomToolbar = ({ handleAdd, selectedRow }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const navigate = useNavigate();
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExport = async () => {
        await exportEntries();
        handleMenuClose();
    };

    const handleViewDetails = () => {
        if (selectedRow) {
            console.log('Navigating to details for:', selectedRow);
            navigate(`/details/${selectedRow}`);
        }
        handleMenuClose();
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="contained" onClick={handleAdd}>
                    New Invoice
                </Button>
                <Button variant="outlined" onClick={handleMenuOpen}>
                    Actions
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleViewDetails}>View Entry</MenuItem>
                    <MenuItem onClick={handleExport}>Export Table to CSV</MenuItem>
                </Menu>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <GridToolbarColumnsButton />
                <GridToolbarDensitySelector />
            </div>
        </div>
    );
};

export default CustomToolbar;