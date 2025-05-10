import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import { fetchEntries } from '../utils/BillsApiUtil';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { InputAdornment, Chip } from '@mui/material';

const Bills = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [filters, setFilters] = useState({
        invoice: '',
        biller: [], // Initialize as an empty array for multiselect
        date: '',
        amountMin: '',
        amountMax: '',
    });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectionModel, setSelectionModel] = useState([]);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day').toDate(),
        dayjs().toDate(),
    ]);

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

    const filterBills = () => {
        let filtered = entries;

        if (filters.invoice) {
            filtered = filtered.filter((entry) =>
                entry.id.toString().includes(filters.invoice)
            );
        }
        if (filters.biller.length > 0) {
            filtered = filtered.filter((entry) =>
                filters.biller.some((biller) =>
                    entry.name.toLowerCase().includes(biller.toLowerCase())
                )
            );
        }
        if (dateRange[0] && dateRange[1]) {
            filtered = filtered.filter((entry) => {
                const entryDate = new Date(entry.date);
                return entryDate >= dateRange[0] && entryDate <= dateRange[1];
            });
        }
        if (filters.amountMin !== '') {
            filtered = filtered.filter((entry) => entry.amount >= filters.amountMin);
        }
        if (filters.amountMax !== '') {
            filtered = filtered.filter((entry) => entry.amount <= filters.amountMax);
        }

        if (!includeArchived) {
            filtered = filtered.filter((entry) => !entry.archived);
        }

        setFilteredEntries(filtered);
        console.log('Filtering bills with filters:', filters);
    };

    const clearFilters = () => {
        setFilters({
            invoice: '',
            biller: [], // Reset biller to an empty array for multiselect
            date: '',
            amountMin: '',
            amountMax: '',
        });
        setDateRange([null, null]); // Reset date range
        setIncludeArchived(false); // Reset archived filter
        setFilteredEntries(entries); // Reset filtered entries to the original list
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null); // Close the menu
    };

    const handleViewDetails = () => {
        if (selectedRow) {
            console.log('Navigating to details for:', selectedRow);
            navigate(`/details/${selectedRow.id}`);
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
        { field: 'status', headerName: 'Paid', width: 200 },
        { field: 'services', headerName: 'Notes', width: 400 },
        { field: 'archived', headerName: 'Archived', width: 400 },
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
                        width: '250px',
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
                        type="number"
                        variant="outlined"
                        value={filters.invoice}
                        onChange={(e) => {
                            const value = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1); // Allow clearing
                            handleFilterChange('invoice', value);
                        }}
                        onKeyDown={(e) => {
                            // Prevent non-numeric input
                            if (
                                e.key !== 'Backspace' &&
                                e.key !== 'Delete' &&
                                e.key !== 'ArrowLeft' &&
                                e.key !== 'ArrowRight' &&
                                !/^[0-9]$/.test(e.key)
                            ) {
                                e.preventDefault();
                            }
                        }}
                        fullWidth
                    />
                    <Box>
                        <Select
                            labelId="biller-label"
                            multiple
                            value={filters.biller || []}
                            onChange={(e) => handleFilterChange('biller', e.target.value)}
                            displayEmpty
                            fullWidth
                            renderValue={(selected) =>
                                selected.length === 0 ? (
                                    <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select Billers</span>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )
                            }
                        >
                            {['Biller A', 'Biller B', 'Biller C', 'Biller D'].map((biller) => (
                                <MenuItem key={biller} value={biller}>
                                    <Checkbox checked={filters.biller.includes(biller)} />
                                    {biller}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <DatePicker
                                    label="Start Date"
                                    value={dateRange[0]}
                                    onChange={(newValue) => {
                                        const updatedRange = [newValue, dateRange[1]];
                                        setDateRange(updatedRange);
                                        handleFilterChange('date', updatedRange); // Update the filter state
                                    }}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={dateRange[1]}
                                    onChange={(newValue) => {
                                        const updatedRange = [dateRange[0], newValue];
                                        setDateRange(updatedRange);
                                        handleFilterChange('date', updatedRange); // Update the filter state
                                    }}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Box>
                        </LocalizationProvider>
                    </Box>
                    <Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <TextField
                                label="Min"
                                type="number"
                                variant="outlined"
                                value={filters.amountMin}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                                    handleFilterChange('amountMin', value);

                                    // Ensure Max is always >= Min
                                    if (filters.amountMax !== '' && value !== '' && parseInt(value, 10) > parseInt(filters.amountMax, 10)) {
                                        handleFilterChange('amountMax', value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    // Prevent non-numeric input
                                    if (
                                        e.key !== 'Backspace' &&
                                        e.key !== 'Delete' &&
                                        e.key !== 'ArrowLeft' &&
                                        e.key !== 'ArrowRight' &&
                                        !/^[0-9]$/.test(e.key)
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Max"
                                type="number"
                                variant="outlined"
                                value={filters.amountMax}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? '' : Math.max(0, Math.min(99999, parseInt(e.target.value, 10) || 0));
                                    handleFilterChange('amountMax', value);

                                    // Ensure Min is updated if Max drops below Min
                                    if (filters.amountMin !== '' && value !== '' && parseInt(value, 10) < parseInt(filters.amountMin, 10)) {
                                        handleFilterChange('amountMin', value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    // Prevent non-numeric input
                                    if (
                                        e.key !== 'Backspace' &&
                                        e.key !== 'Delete' &&
                                        e.key !== 'ArrowLeft' &&
                                        e.key !== 'ArrowRight' &&
                                        !/^[0-9]$/.test(e.key)
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </Box>
                    </Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeArchived}
                                onChange={(e) => setIncludeArchived(e.target.checked)}
                            />
                        }
                        label="Include Archives"
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={filterBills}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={clearFilters}
                    >
                        Clear Filters
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