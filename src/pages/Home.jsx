import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { fetchEntries, getBills, getStats } from '../utils/BillsApiUtil';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import Statistics from '../components/Statistics';
import { AuthContext } from '../App';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Home = () => {
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
        dayjs().subtract(30, 'day').startOf('day').toDate(),
        dayjs().startOf('day').toDate(),
    ]);
    const [availableBillers, setAvailableBillers] = useState([]);
    const [stats, setStats] = useState(null);

    const navigate = useNavigate();
    const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);

    // Reusable handleTokenRefresh
    const handleTokenRefresh = useCallback((newAccessToken, newRefreshToken) => {
        if (typeof setJwt === 'function') setJwt(newAccessToken);
        if (typeof setRefresh === 'function') setRefresh(newRefreshToken);
    }, [setJwt, setRefresh]);

    // Move loadEntries outside useEffect and wrap in useCallback
    const loadEntries = useCallback(async () => {
        const fetchedEntries = await fetchEntries(jwt, refresh, handleTokenRefresh);
        setEntries(fetchedEntries);
        // Only show non-archived by default
        setFilteredEntries(fetchedEntries.filter((entry) => !entry.archived));
    }, [jwt, refresh, handleTokenRefresh]);

    // Fetch billers based on includeArchived filter
    const fetchBillers = useCallback(async () => {
        let filterParam;
        if (includeArchived === false) filterParam = 'active';
        else if (includeArchived === 'only') filterParam = 'inactive';
        else filterParam = null;
        const bills = await getBills(jwt, refresh, handleTokenRefresh, filterParam);
        const newAvailableBillers = bills.map(bill => bill.name);
        setAvailableBillers(newAvailableBillers);
        // Only clear filters.biller if the current selection is not in the new list
        setFilters(prev => {
            const currentSelected = prev.biller || [];
            // If every selected biller is still available, keep selection
            const allSelectedStillAvailable = currentSelected.every(biller => newAvailableBillers.includes(biller));
            if (allSelectedStillAvailable) {
                return prev;
            } else {
                return { ...prev, biller: [] };
            }
        });
    }, [jwt, refresh, handleTokenRefresh, includeArchived]);

    // Fetch stats for dashboard
    const loadStats = useCallback(async () => {
        const result = await getStats(jwt, refresh, handleTokenRefresh);
        setStats(result);
    }, [jwt, refresh, handleTokenRefresh]);

    useEffect(() => {
        fetchBillers();
    }, [fetchBillers]);

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

    // Memoize filterBills to avoid infinite loop in useEffect
    const filterBills = useCallback(() => {
        let filtered = entries;
        if (filters.invoice) {
            filtered = filtered.filter((entry) =>
                entry.entryId && entry.entryId.toString().includes(filters.invoice)
            );
        }
        if (filters.biller.length > 0) {
            filtered = filtered.filter((entry) =>
                filters.biller.some((biller) =>
                    entry.name.toLowerCase().includes(biller.toLowerCase())
                )
            );
        }
        if (dateRange[0] || dateRange[1]) {
            filtered = filtered.filter((entry) => {
                // Always compare using dayjs for both entry and range
                const entryDate = dayjs(entry.date).startOf('day');
                const start = dateRange[0] ? dayjs(dateRange[0]).startOf('day') : null;
                const end = dateRange[1] ? dayjs(dateRange[1]).startOf('day') : null;
                if (start && end) return entryDate.isSameOrAfter(start) && entryDate.isSameOrBefore(end);
                if (start) return entryDate.isSameOrAfter(start);
                if (end) return entryDate.isSameOrBefore(end);
                return true;
            });
        }
        if (filters.amountMin !== '') {
            filtered = filtered.filter((entry) => entry.amount >= filters.amountMin);
        }
        if (filters.amountMax !== '') {
            filtered = filtered.filter((entry) => entry.amount <= filters.amountMax);
        }
        if (filters.flow && filters.flow !== '') {
            filtered = filtered.filter((entry) => entry.flow === filters.flow);
        }
        if (filters.status && filters.status !== '') {
            const statusBool = filters.status === 'unpaid' ? false : true;
            filtered = filtered.filter((entry) => entry.status === statusBool);
        }
        if (includeArchived === 'only') {
            filtered = filtered.filter((entry) => entry.archived === true);
        } else if (includeArchived !== true) {
            filtered = filtered.filter((entry) => !entry.archived);
        }
        setFilteredEntries(filtered);
    }, [entries, filters, dateRange, includeArchived]);

    const clearFilters = () => {
        setFilters({
            invoice: '',
            biller: [],
            date: '',
            amountMin: '',
            amountMax: '',
        });
        setDateRange([null, null]);
        setIncludeArchived(false); // Reset to show only non-archived
        // Apply the archived filter immediately after clearing
        setFilteredEntries(entries.filter((entry) => !entry.archived));
    };

    // Only run loadEntries on mount
    useEffect(() => {
        setActiveTab(0);
        loadEntries();
        loadStats();
        // eslint-disable-next-line
    }, []);

    // Run filterBills after entries are loaded
    useEffect(() => {
        filterBills();
        // eslint-disable-next-line
    }, [entries]);

    const columns = [
        { field: 'entryId', headerName: 'Invoice #', width: 100 },
        { field: 'billId', headerName: 'Bill ID', width: 100, hide: true },
        { field: 'name', headerName: 'Party', width: 250 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'flow', headerName: 'Flow', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 130 },
        { field: 'status', headerName: 'Paid', width: 100 },
        { field: 'services', headerName: 'Description', width: 500 },
        { field: 'archived', headerName: 'Archived', width: 100 },
    ];

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        billId: false, // billId column is hidden by default
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
        <Box display="flex" gap="20px" padding="15px">
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
                availableBillers={availableBillers}
            />
            <Box flexGrow={1}>
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
                    <Statistics stats={stats} />
                )}
            </Box>
        </Box>
    );
};

export default Home;