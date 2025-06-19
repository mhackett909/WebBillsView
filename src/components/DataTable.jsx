import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import '../styles/tabs.css';
import '../styles/datatable.css';
import dayjs from 'dayjs';

import CustomToolbar from './toolbars/TableToolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import CachedIcon from '@mui/icons-material/Cached';
import GoToPage from './GoToPage';

const DataTable = ({
    rows,
    columns,
    columnVisibilityModel,
    setColumnVisibilityModel,
    handleAdd,
    pagination,
    paginationMode,
    page,
    onPageChange,
    pageSize,
    onPageSizeChange,
    rowCount,
    sortingMode,
    sortModel,
    sortingOrder,
    onSortModelChange,
    showGoToPage,
    smaller = false,
    rowsPerPageOptions = [5, 10, 25, 50, 100], // default options
}) => {
    // Enhance the first column (assumed to be ID) to use a Chip for better visuals
    const enhancedColumns = columns.map((col, idx) => {
        // Invoice # column (first column, assumed to be invoiceId)
        if (col.field === 'invoiceId' || idx === 0) {
            return {
                ...col,
                renderCell: (params) => (
                    <Link
                        to={`/entries/${params.row.entryId}`}
                        className="data-table-invoice-link"
                        onClick={e => { e.stopPropagation(); }}
                    >
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                            <Chip
                                label={params.value}
                                color="info"
                                variant="filled"
                                size="small"
                                sx={{
                                    backgroundColor: (theme) => theme.palette.secondary.main,
                                    color: 'white',
                                    transition: 'background 0.2s',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.secondary.dark,
                                        color: 'white',
                                    },
                                }}
                            />
                        </Box>
                    </Link>
                ),
                headerName: col.headerName || 'Invoice #',
                width: col.width || 100,
            };
        }
        // Entity (name) column
        if (col.field === 'name') {
            return {
                ...col,
                renderCell: (params) => (
                    <span>
                        <Link
                            to={`/entities/${params.row.billId}`}
                            style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); }}
                        >
                            {params.value}
                        </Link>
                    </span>
                ),
            };
        }
        // Date column
        if (col.field === 'date') {
            return {
                ...col,
                renderCell: (params) => {
                    // Format using dayjs to match the picker's local format
                    return params.value ? dayjs(params.value).format('YYYY-MM-DD') : '';
                },
            };
        }
        // Flow column
        if (col.field === 'flow') {
            return {
                ...col,
                renderCell: (params) =>
                    params.row.flow === 'INCOMING' ? (
                        <ArrowBackIcon sx={{ color: '#0288d1' }} titleAccess="Income" />
                    ) : (
                        <ArrowForwardIcon color="warning" titleAccess="Expense" />
                    ),
            };
        }
        // Status column
        if (col.field === 'status') {
            return {
                ...col,
                renderCell: (params) => {
                    const isPaid = params.row.status;
                    const isOverpaid = params.row.overpaid;
                    const flow = params.row.flow;
                    let plusOneColor = undefined;
                    if (isOverpaid) {
                        if (flow === 'OUTGOING') plusOneColor = '#ed6c02';
                        else if (flow === 'INCOMING') plusOneColor = '#0288d1';
                    }
                    // Determine if in progress (balance !== amount)
                    let inProgress = false;
                    const balanceObj = params.row.balance;
                    const amount = Number(params.row.amount);
                    let balanceValue = undefined;
                    if (balanceObj && typeof balanceObj === 'object' && balanceObj !== null) {
                        if (Number(balanceObj.totalBalance) === 0 && Number(balanceObj.totalOverpaid) > 0) {
                            balanceValue = Number(balanceObj.totalOverpaid);
                        } else if (Number(balanceObj.totalBalance) === 0 && Number(balanceObj.totalOverpaid) === 0) {
                            balanceValue = 0;
                        } else {
                            balanceValue = Number(balanceObj.totalBalance);
                        }
                    } else if (typeof params.row.balance === 'number') {
                        balanceValue = Number(params.row.balance);
                    }
                    if (typeof balanceValue === 'number' && typeof amount === 'number' && balanceValue !== amount) {
                        inProgress = true;
                    }
                    return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isPaid ? (
                                <>
                                    <CheckCircleIcon color="success" titleAccess="Paid" />
                                    {isOverpaid && (
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            <PlusOneIcon
                                                fontSize="small"
                                                titleAccess="Overpaid"
                                                style={plusOneColor ? { color: plusOneColor } : {}}
                                            />
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <CancelIcon color="error" titleAccess="Unpaid" />
                                    {inProgress && (
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            <CachedIcon
                                                fontSize="small"
                                                sx={{ color: flow === 'INCOMING' ? '#0288d1' : '#ed6c02' }}
                                                titleAccess="In Progress"
                                            />
                                        </span>
                                    )}
                                </>
                            )}
                        </span>
                    );
                },
            };
        }
        // Archived column
        if (col.field === 'archived') {
            return {
                ...col,
                renderCell: (params) =>
                    params.row.archived === true ? (
                        <CheckCircleIcon color="success" titleAccess="Archived" />
                    ) : '',
            };
        }
        // Balance column
        if (col.field === 'balance') {
            return {
                ...col,
                renderCell: (params) => {
                    if (params.value && typeof params.value === 'object' && params.value !== null) {
                        const { totalBalance, totalOverpaid } = params.value;
                        const flow = params.row.flow;
                        const amount = Number(params.row.amount);
                        let displayValue;
                        let isOverpaid = false;
                        if (Number(totalBalance) === 0 && Number(totalOverpaid) > 0) {
                            displayValue = totalOverpaid;
                            isOverpaid = true;
                        } else if (Number(totalBalance) === 0 && Number(totalOverpaid) === 0) {
                            displayValue = 0;
                        } else {
                            displayValue = totalBalance;
                        }
                        if (isOverpaid) {
                            const overpaidColor = flow === 'OUTGOING' ? '#ed6c02' : flow === 'INCOMING' ? '#0288d1' : undefined;
                            return (
                                <span style={{ color: overpaidColor, fontWeight: 700 }}>+{Number(displayValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            );
                        }
                        if (Number(displayValue) === 0) {
                            return <span style={{ color: '#2e7d32', fontWeight: 700 }}>0.00</span>; // green for 0.00
                        }
                        // If balance equals amount, show in red
                        if (Number(displayValue) === amount) {
                            return (
                                <span style={{ color: '#d32f2f', fontWeight: 700 }}>-{Number(displayValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            );
                        }
                        // Show negative balance and in-progress icon in blue for income, orange for expense
                        const flowColor = flow === 'INCOMING' ? '#0288d1' : '#ed6c02';
                        return (
                            <span style={{ color: flowColor, fontWeight: 700 }}>-{Number(displayValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        );
                    }
                    // If it's a number, format to 2 decimals
                    if (typeof params.value === 'number') {
                        return <span style={{ fontWeight: 700 }}>{Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
                    }
                    return params.value ?? '';
                },
            };
        }
        // Amount column
        if (col.field === 'amount') {
            return {
                ...col,
                renderCell: (params) => {
                    if (typeof params.value === 'number') {
                        return Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                    return params.value ?? '';
                },
            };
        }
        return col;
    });

    return (
        <Box className="tabs-container" sx={{ height: smaller ? 420 : 600 }}>
            <DataGrid
                rows={rows}
                columns={enhancedColumns}
                getRowId={(row) => row.entryId}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                components={{
                    // Only show the toolbar if handleAdd is provided
                    Toolbar: handleAdd ? CustomToolbar : undefined,
                }}
                componentsProps={handleAdd ? {
                    toolbar: {
                        handleAdd: handleAdd,
                        selectedRow: null,
                    },
                } : {}}
                pagination={pagination}
                paginationMode={paginationMode}
                page={page}
                onPageChange={onPageChange}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                rowCount={rowCount}
                sortingMode={sortingMode}
                sortModel={sortModel}
                sortingOrder={sortingOrder}
                onSortModelChange={onSortModelChange}
                rowsPerPageOptions={rowsPerPageOptions}
            />
            {showGoToPage && (
                <GoToPage
                    page={page}
                    pageSize={pageSize}
                    rowCount={rowCount}
                    onPageChange={onPageChange}
                />
            )}
        </Box>
    );
};

export default DataTable;