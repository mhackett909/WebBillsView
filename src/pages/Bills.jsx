import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { fetchEntries } from '../utils/BillsApiUtil';
import dayjs from 'dayjs';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import Statistics from '../components/Statistics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const Bills = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [filters, setFilters] = useState({
        invoice: '',
        biller: [],
        date: '',
        amountMin: '',
        amountMax: '',
    });
    const [includeArchived, setIncludeArchived] = useState(false);
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
        setActiveTab(0);
        loadEntries();
    }, []);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        console.log('Add New Invoice button clicked');
        navigate('/invoice');
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

        // New: Flow filter (single value or none)
        if (filters.flow && filters.flow !== '') {
            filtered = filtered.filter((entry) => entry.flow === filters.flow);
        }

        if (filters.status && filters.status !== '') {
            const statusBool = filters.status === 'unpaid' ? true : false;
            filtered = filtered.filter(
                (entry) => entry.status === statusBool
            );
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
            biller: [],
            date: '',
            amountMin: '',
            amountMax: '',
        });
        setDateRange([null, null]);
        setIncludeArchived(false);
        setFilteredEntries(entries);
    };

    const columns = [
        { field: 'id', headerName: 'Invoice #', width: 100 },
        { field: 'name', headerName: 'Party', width: 250 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'flow', headerName: 'Flow', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 130 },
        {
            field: 'status',
            headerName: 'Paid',
            width: 100,
            renderCell: (params) =>
                params.row.status === false ? (
                    <CheckCircleIcon color="success" titleAccess="Paid" />
                ) : (
                    <CancelIcon color="error" titleAccess="Unpaid" />
                ),
        },
        { field: 'services', headerName: 'Description', width: 420 },
        { field: 'archived', headerName: 'Archived', width: 100 },
    ];

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        id: true,
        name: true,
        date: true,
        flow: true,
        amount: true,
        status: true,
        services: true,
        archived: true,
    });

    return (
        <Box sx={{ padding: '20px' }}>
            <Box display="flex" gap="20px">
                {/* Filter Panel */}
                <FilterPanel
                    filters={filters}
                    dateRange={dateRange}
                    includeArchived={includeArchived}
                    handleFilterChange={handleFilterChange}
                    setDateRange={setDateRange}
                    setIncludeArchived={setIncludeArchived}
                    filterBills={filterBills}
                    clearFilters={clearFilters}
                />
                 <Box sx={{ flex: 1 }}>
                        {/* Tabs for switching between Data Table and Statistics */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            className="main-tabs"
                        >
                            <Tab label="Entries" />
                            <Tab label="Stats" />
                        </Tabs>
                        {/* Render content based on the active tab */}
                        {activeTab === 0 && (
                            <DataTable
                                rows={filteredEntries}
                                columns={columns}
                                selectionModel={selectionModel}
                                setSelectionModel={setSelectionModel}
                                columnVisibilityModel={columnVisibilityModel}
                                setColumnVisibilityModel={setColumnVisibilityModel}
                                handleAdd={handleAdd}
                            />
                        )}
                        {activeTab === 1 && (
                            <Statistics />
                        )}
                </Box>
            </Box>
        </Box>
    );
};

export default Bills;