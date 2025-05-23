import { useState, useEffect, useContext, useCallback, useRef } from 'react';
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
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [rowCount, setRowCount] = useState(0);
    const [sortModel, setSortModel] = useState([]);
    // Initialize filters and includeArchived from sessionStorage if available
    // Default filters object for reuse
    const defaultFilters = {
        invoice: '',
        biller: [],
        amountMin: '',
        amountMax: '',
        flow: '',
        status: '',
    };

    const getInitialFilters = () => {
        const storedFilters = sessionStorage.getItem('filters');
        if (storedFilters) {
            try {
                const parsed = JSON.parse(storedFilters);
                if (parsed && typeof parsed === 'object') {
                    return { ...defaultFilters, ...parsed };
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return { ...defaultFilters };
    };

    const getInitialIncludeArchived = () => {
        const stored = sessionStorage.getItem('includeArchived');
        if (stored === 'true') return true;
        if (stored === 'false') return false;
        if (stored === 'only') return 'only';
        return false;
    };

    const getInitialDateRange = () => {
        const stored = sessionStorage.getItem('dateRange');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length === 2) {
                    // Convert to Date objects if possible
                    return [parsed[0] ? new Date(parsed[0]) : null, parsed[1] ? new Date(parsed[1]) : null];
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return [
            dayjs().subtract(30, 'day').startOf('day').toDate(),
            dayjs().startOf('day').toDate(),
        ];
    };

    const getInitialDateMode = () => {
        const stored = sessionStorage.getItem('dateMode');
        if (stored) return stored;
        return 'Date Range';
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const [includeArchived, setIncludeArchived] = useState(getInitialIncludeArchived());
    const [dateRange, setDateRange] = useState(getInitialDateRange);
    const [dateMode, setDateMode] = useState(getInitialDateMode);
    const [availableBillers, setAvailableBillers] = useState([]);
    const [stats, setStats] = useState(null);
    const [resetFlag, setResetFlag] = useState(false);
    const filterParamRef = useRef(getInitialFilters());
    const dateRangeRef = useRef(getInitialDateRange());
    const includeArchivedRef = useRef(getInitialIncludeArchived());

    const navigate = useNavigate();
    const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);

    // Reusable handleTokenRefresh
    const handleTokenRefresh = useCallback((newAccessToken, newRefreshToken) => {
        if (typeof setJwt === 'function') setJwt(newAccessToken);
        if (typeof setRefresh === 'function') setRefresh(newRefreshToken);
    }, [setJwt, setRefresh]);

    // Helper to map UI filters to API filters for backend
    const mapFiltersToEntryParams = useCallback((f = filterParamRef.current, dr = dateRangeRef.current, ia = includeArchivedRef.current) => {
        let archives;
        console.log('Mapping filters to params:', f, dr, ia);
        if (ia === false) archives = false;
        else if (ia === 'only') archives = true;
        else if (ia === true) archives = null;
        // Map status to 'true' or 'false' string
        let paid;
        if (f.status === 'paid') paid = true;
        else if (f.status === 'unpaid') paid = false;
        else paid = undefined;
        return {
            startDate: dr[0] ? dayjs(dr[0]).format('YYYY-MM-DD') : undefined,
            endDate: dr[1] ? dayjs(dr[1]).format('YYYY-MM-DD') : undefined,
            invoiceNum: f.invoice ? Number(f.invoice) : undefined,
            partyList: f.biller && f.biller.length > 0 ? f.biller : undefined,
            min: f.amountMin !== '' ? f.amountMin : undefined,
            max: f.amountMax !== '' ? f.amountMax : undefined,
            flow: f.flow === 'INCOMING' ? 'income' : f.flow === 'OUTGOING' ? 'expense' : undefined,
            paid,
            archives,
        };
    }, []);

    // Fetch stats for dashboard
    const loadStats = useCallback(async () => {
        const params = mapFiltersToEntryParams();
        const result = await getStats(jwt, refresh, handleTokenRefresh, params);
        setStats(result);
    }, [jwt, refresh, handleTokenRefresh, mapFiltersToEntryParams]);

    // Fetch entries from backend using filters
    const loadEntries = useCallback(async () => {
        const params = mapFiltersToEntryParams();
        params.pageNum = page; 
        params.pageSize = pageSize;
        if (Array.isArray(sortModel) && sortModel.length > 0 && sortModel[0].field && sortModel[0].sort) {
            params.sortField = sortModel[0].field;
            params.sortOrder = sortModel[0].sort;
        }
        console.log('Fetching entries with params:', params);
        const result = await fetchEntries(jwt, refresh, handleTokenRefresh, params);
        // Expect result.entries (array) and result.total (integer)
        let entriesArr = [];
        let total = 0;
        if (result && Array.isArray(result.entries)) {
            entriesArr = result.entries;
            total = typeof result.total === 'number' ? result.total : result.entries.length;
        }
        setEntries(entriesArr);
        setRowCount(total);
    }, [jwt, refresh, handleTokenRefresh, mapFiltersToEntryParams, page, pageSize, sortModel]);

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
                const updated = { ...prev, biller: [] };
                filterParamRef.current = updated;
                return updated;
            }
        });
    }, [jwt, refresh, handleTokenRefresh, includeArchived]);

        // Central filterBills function: calls loadEntries, loadStats, and sets session storage
    const filterBills = useCallback(() => {
        // Save filters, includeArchived, dateRange, and dateMode to session storage
        sessionStorage.setItem('filters', JSON.stringify(filters));
        sessionStorage.setItem('includeArchived', includeArchived);
        sessionStorage.setItem('dateRange', JSON.stringify(dateRange));
        sessionStorage.setItem('dateMode', dateMode);
        loadEntries();
        loadStats();
    }, [filters, includeArchived, dateRange, dateMode, loadEntries, loadStats]);

    useEffect(() => {
        fetchBillers();
    }, [fetchBillers]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => {
            const updated = { ...prev, [field]: value };
            filterParamRef.current = updated;
            return updated;
        });
    };

    const handleAdd = () => {
        navigate('/invoice');
    };

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
        dateRangeRef.current = newRange;
    };

    const handleIncludeArchivedChange = (newValue) => {
        setIncludeArchived(newValue);
        includeArchivedRef.current = newValue;
        console.log('Include Archived:', newValue);
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        filterParamRef.current = defaultFilters;
        handleDateRangeChange([null, null]);
        setDateMode('Date Range');
        handleIncludeArchivedChange(false); // Reset to show only non-archived
        setResetFlag(flag => !flag); // Toggle flag to trigger effect
        // Save cleared filters, includeArchived, dateRange, and dateMode to session storage
        sessionStorage.setItem('filters', JSON.stringify(defaultFilters));
        sessionStorage.setItem('includeArchived', 'false');
        sessionStorage.setItem('dateRange', JSON.stringify([null, null]));
        sessionStorage.setItem('dateMode', 'Date Range');
        loadEntries();
        loadStats();
    };


    // Only run loadEntries on mount
    useEffect(() => {
        setActiveTab(0);
        loadEntries();
        loadStats();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        // Only run after clearFilters is called
        loadStats();
        // eslint-disable-next-line
    }, [resetFlag]);

    // Fetch entries whenever page, pageSize, or sortModel changes
    useEffect(() => {
        loadEntries();
    }, [page, pageSize, sortModel, loadEntries]);

    const columns = [
        { field: 'entryId', headerName: 'Invoice #', width: 100 },
        { field: 'billId', headerName: 'Bill ID', width: 100, hide: true },
        { field: 'name', headerName: 'Entity', width: 250 },
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
                dateMode={dateMode}
                includeArchived={includeArchived}
                handleFilterChange={handleFilterChange}
                setDateRange={handleDateRangeChange}
                setDateMode={setDateMode}
                setIncludeArchived={handleIncludeArchivedChange}
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
                        rows={entries}
                        columns={columns}
                        columnVisibilityModel={columnVisibilityModel}
                        setColumnVisibilityModel={setColumnVisibilityModel}
                        handleAdd={handleAdd}
                        pagination
                        paginationMode="server"
                        page={page}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        rowCount={rowCount}
                        sortingMode="server"
                        sortingOrder={['asc', 'desc']}
                        sortModel={sortModel}
                        onSortModelChange={setSortModel}
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