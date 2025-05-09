import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Box, Menu, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { fetchEntries } from '../utils/BillsApiUtil';


const Bills = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [filters, setFilters] = useState({
        invoice: '',
        biller: '',
        date: '',
        amount: '',
    });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectionModel, setSelectionModel] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadEntries = async () => {
            const fetchedEntries = await fetchEntries();
            setEntries(fetchedEntries);
            setFilteredEntries(fetchedEntries);
        };

        loadEntries();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = useCallback(() => {
        let filtered = entries;

        if (filters.invoice) {
            filtered = filtered.filter((entry) =>
                entry.id.toString().includes(filters.invoice)
            );
        }
        if (filters.biller) {
            filtered = filtered.filter((entry) =>
                entry.name.toLowerCase().includes(filters.biller.toLowerCase())
            );
        }
        if (filters.date) {
            filtered = filtered.filter((entry) =>
                entry.date.includes(filters.date)
            );
        }
        if (filters.amount) {
            filtered = filtered.filter((entry) =>
                entry.amount.toString().includes(filters.amount)
            );
        }

        if (!includeArchived) {
            filtered = filtered.filter((entry) => !entry.archived);
        }

        setFilteredEntries(filtered);
    }, [entries, filters, includeArchived]); // Add dependencies here

    const resetFilters = () => {
        setFilters({
            invoice: '',
            biller: '',
            date: '',
            amount: '',
        });
        setIncludeArchived(false);
        setFilteredEntries(entries);
    };

    useEffect(() => {
        applyFilters();
    }, [applyFilters]); // Use applyFilters as a dependency

    const handleMenuClose = () => {
        setMenuAnchorEl(null); // Close the menu
    };

    const handleViewDetails = () => {
        if (selectedRow) {
            console.log('Navigating to details for:', selectedRow);
            navigate(`/details/${selectedRow.id}`); // Navigate to the details page with the selected row ID
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        console.log('Deleting row with ID:', selectedRow.id);
        // Implement delete functionality
        setEntries((prev) => prev.filter((entry) => entry.id !== selectedRow.id));
        setFilteredEntries((prev) => prev.filter((entry) => entry.id !== selectedRow.id));
        setSelectionModel([]); // Clear selection
        setSelectedRow(null);
        handleMenuClose();
    };

    const columns = [
        { field: 'id', headerName: 'Invoice #', width: 100 },
        { field: 'name', headerName: 'Biller', width: 300 },
        { field: 'date', headerName: 'Date', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 200 },
        { field: 'status', headerName: 'Status', width: 200 },
        { field: 'services', headerName: 'Notes', width: 400 },
    ];

    return (
        <Box sx={{ padding: '20px' }}>
        {/* New Invoice Button */}
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center', // Center the button horizontally
                marginBottom: '10px', // Add spacing below the button
            }}
        >
            <Button
                id="New"
                variant="outlined"
                color="primary"
            >
                New Invoice
            </Button>
        </Box>

            {/* Main Content Area */}
            <Box display="flex" gap="20px">
                {/* Filter Panel */}
                <Box
                    sx={{
                        width: '300px',
                        padding: '20px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        height: '100%', 
                    }}
                >
                    <TextField
                        label="Invoice #"
                        variant="outlined"
                        value={filters.invoice}
                        onChange={(e) => handleFilterChange('invoice', e.target.value)}
                    />
                    <TextField
                        label="Biller"
                        variant="outlined"
                        value={filters.biller}
                        onChange={(e) => handleFilterChange('biller', e.target.value)}
                    />
                    <TextField
                        label="Date"
                        variant="outlined"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                    />
                    <TextField
                        label="Amount"
                        variant="outlined"
                        value={filters.amount}
                        onChange={(e) => handleFilterChange('amount', e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeArchived}
                                onChange={(e) => setIncludeArchived(e.target.checked)}
                            />
                        }
                        label="Include archived?"
                    />
                                        <Button
                        variant="outlined"
                        color="primary"
                        onClick={resetFilters}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </Button>
                </Box>
                {/* Data Table */}
                <Box sx={{ flex: 1 }}>
                    <Box
                        sx={{
                            height: '80vh',
                            width: '100%',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <DataGrid
                            rows={filteredEntries}
                            columns={columns}
                            checkboxSelection
                            selectionModel={selectionModel}
                            onSelectionModelChange={(newSelection) => {
                                if (newSelection.length > 1) {
                                    setSelectionModel([newSelection[newSelection.length - 1]]);
                                } else {
                                    setSelectionModel(newSelection);
                                }

                                if (newSelection.length > 0) {
                                    const selectedId = newSelection[0];
                                    const selected = filteredEntries.find((entry) => entry.id === selectedId);
                                    setSelectedRow(selected);
                                    setMenuAnchorEl(document.querySelector(`[data-id="${selectedId}"]`));
                                } else {
                                    setSelectedRow(null);
                                    setMenuAnchorEl(null);
                                }
                            }}
                        />
                    </Box>
                </Box>


            </Box>

            {/* Row Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </Box>
    );

};

export default Bills;