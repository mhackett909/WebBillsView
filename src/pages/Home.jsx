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
    const [rowCount, setRowCount] = useState(0);
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
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // Ignore parse errors
            }
        }
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
            null,
        ];
    };

    const getInitialDateMode = () => {
        const stored = sessionStorage.getItem('dateMode');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // Ignore parse errors, fallback to stored string
            }
        }
        return 'Date Range';
    };

    const getInitialPage = () => {
        const stored = sessionStorage.getItem('page');
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed)) return parsed;
        }
        return 0;
    };

    const getInitialPageSize = () => {
        const stored = sessionStorage.getItem('pageSize');
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed)) return parsed;
        }
        return 25;
    };

    const getInitialColumnVisibilityModel = () => {
        const stored = sessionStorage.getItem('columnVisibilityModel');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // Ignore parse errors
            }
        }
        return {
            billId: false,
            entryId: false,
            invoiceId: true,
            name: true,
            date: true,
            flow: true,
            amount: true,
            status: true,
            balance: true,
            services: true,
            archived: true,
        };
    };

    const getInitialSortModel = () => {
        const stored = sessionStorage.getItem('sortModel');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // Ignore parse errors
            }
        }
        return [];
    };

    const [filters, setFilters] = useState(getInitialFilters());
    const [page, setPage] = useState(getInitialPage());
    const [pageSize, setPageSize] = useState(getInitialPageSize());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(getInitialColumnVisibilityModel());
    const [sortModel, setSortModel] = useState(getInitialSortModel());
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
        if (ia === false) archives = false;
        else if (ia === 'only') archives = true;
        else if (ia === true) archives = null;
        // Map status to 'true', 'false', or 'overpaid' string
        let paid;
        if (f.status === 'paid') paid = true;
        else if (f.status === 'unpaid') paid = false;
        else if (f.status === 'overpaid') paid = 'overpaid';
        else if (f.status === 'partial') paid = 'partial';
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
        // Save filters, includeArchived, dateRange, dateMode, page, pageSize, columnVisibilityModel, and sortModel to session storage
        sessionStorage.setItem('filters', JSON.stringify(filters));
        sessionStorage.setItem('includeArchived', JSON.stringify(includeArchived));
        sessionStorage.setItem('dateRange', JSON.stringify(dateRange));
        sessionStorage.setItem('dateMode', JSON.stringify(dateMode));
        sessionStorage.setItem('page', JSON.stringify(page));
        sessionStorage.setItem('pageSize', JSON.stringify(pageSize));
        sessionStorage.setItem('columnVisibilityModel', JSON.stringify(columnVisibilityModel));
        sessionStorage.setItem('sortModel', JSON.stringify(sortModel));
        loadEntries();
        loadStats();
    }, [filters, includeArchived, dateRange, dateMode, page, pageSize, columnVisibilityModel, sortModel, loadEntries, loadStats]);

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
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        sessionStorage.setItem('page', JSON.stringify(newPage));
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        sessionStorage.setItem('pageSize', JSON.stringify(newPageSize));
        setPage(0); // Reset to first page when page size changes
        sessionStorage.setItem('page', JSON.stringify(0));
    };

    // Save column visibility and sort model to session storage when they change
    useEffect(() => {
        sessionStorage.setItem('columnVisibilityModel', JSON.stringify(columnVisibilityModel));
    }, [columnVisibilityModel]);
    useEffect(() => {
        sessionStorage.setItem('sortModel', JSON.stringify(sortModel));
    }, [sortModel]);

    const clearFilters = () => {
        setFilters(defaultFilters);
        filterParamRef.current = defaultFilters;
        handleDateRangeChange([null, null]);
        setDateMode('Date Range');
        handleIncludeArchivedChange(false); // Reset to show only non-archived
        setPage(0); // Reset pagination
        setPageSize(25); // Reset page size
        setColumnVisibilityModel(getInitialColumnVisibilityModel());
        setSortModel([]);
        setResetFlag(flag => !flag); // Toggle flag to trigger effect
        // Save cleared filters, includeArchived, dateRange, dateMode, page, and pageSize to session storage
        sessionStorage.setItem('filters', JSON.stringify(defaultFilters));
        sessionStorage.setItem('includeArchived', JSON.stringify(false));
        sessionStorage.setItem('dateRange', JSON.stringify([null, null]));
        sessionStorage.setItem('dateMode', JSON.stringify('Date Range'));
        sessionStorage.setItem('page', JSON.stringify(0));
        sessionStorage.setItem('pageSize', JSON.stringify(25));
        sessionStorage.setItem('columnVisibilityModel', JSON.stringify(getInitialColumnVisibilityModel()));
        sessionStorage.setItem('sortModel', JSON.stringify([]));
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
        const handlePageShow = (event) => {
            if (event.persisted) {
            console.log("Page restored from bfcache. Reloading home data...");
            loadEntries();
            loadStats();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
        // eslint-disable-next-line
    }, []);


    // Fetch entries whenever page, pageSize, or sortModel changes
    useEffect(() => {
        loadEntries();
    }, [page, pageSize, sortModel, loadEntries]);

    // Only run after clearFilters is called
    useEffect(() => {
        loadStats();
        // eslint-disable-next-line
    }, [resetFlag]);

    const columns = [
        { field: 'invoiceId', headerName: 'Invoice #', width: 100 },
        { field: 'entryId', headerName: 'Entry ID', width: 100, hide: true },
        { field: 'billId', headerName: 'Bill ID', width: 100, hide: true },
        { field: 'name', headerName: 'Entity', width: 250 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'flow', headerName: 'Flow', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 130 },
        { field: 'status', headerName: 'Paid', width: 100 },
        { field: 'balance', headerName: 'Balance', width: 130 },
        { field: 'services', headerName: 'Description', width: 470 },
        { field: 'archived', headerName: 'Archived', width: 100 },
    ];


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
                    <Tab label="Invoices" />
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
                        onPageChange={handlePageChange}
                        pageSize={pageSize}
                        onPageSizeChange={handlePageSizeChange}
                        rowCount={rowCount}
                        sortingMode="server"
                        sortingOrder={['asc', 'desc']}
                        sortModel={sortModel}
                        onSortModelChange={setSortModel}
                        showGoToPage
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