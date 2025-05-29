import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import '../styles/tabs.css';
import dayjs from 'dayjs';

import CustomToolbar from './toolbars/TableToolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlusOneIcon from '@mui/icons-material/PlusOne';

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
}) => {
    // Enhance the first column (assumed to be ID) to use a Chip for better visuals
    const enhancedColumns = columns.map((col, idx) => {
        if (idx === 0) {
            return {
                ...col,
                renderCell: (params) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.href = `/entries/${params.row.entryId}`;
                            }
                        }}
                    >
                        <Chip
                            label={params.value}
                            color="info"
                            variant="filled"
                            size="small"
                            sx={{
                                transition: 'background 0.2s',
                                '&:hover': {
                                    backgroundColor: (theme) => theme.palette.secondary.dark,
                                    color: 'white',
                                },
                            }}
                        />
                    </span>
                ),
                headerName: col.headerName || 'ID',
                width: col.width || 90,
            };
        }
        if (col.field === 'name') {
            return {
                ...col,
                renderCell: (params) => (
                    <span>{params.value}</span>
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
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke={flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2"/></svg>
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
                        // Show totalOverpaid in color with plus, totalBalance in purple with minus, 0 as normal
                        if (isOverpaid) {
                            const overpaidColor = flow === 'OUTGOING' ? '#ed6c02' : flow === 'INCOMING' ? '#0288d1' : undefined;
                            return (
                                <span style={{ color: overpaidColor, fontWeight: 500 }}>+{displayValue}</span>
                            );
                        }
                        if (Number(displayValue) === 0) {
                            return <span style={{ color: '#2e7d32', fontWeight: 500 }}>0.00</span>; // green for 0.00
                        }
                        // If balance equals amount, show in red
                        if (Number(displayValue) === amount) {
                            return (
                                <span style={{ color: '#d32f2f', fontWeight: 500 }}>-{displayValue}</span>
                            );
                        }
                        // Show negative balance and in-progress icon in blue for income, orange for expense
                        const flowColor = flow === 'INCOMING' ? '#0288d1' : '#ed6c02';
                        return (
                            <span style={{ color: flowColor, fontWeight: 500 }}>-{displayValue}</span>
                        );
                    }
                    return params.value ?? '';
                },
            };
        }
        return col;
    });

    return (
        <Box className="tabs-container">
            <DataGrid
                rows={rows}
                columns={enhancedColumns}
                getRowId={(row) => row.entryId}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                components={{
                    Toolbar: CustomToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        handleAdd: handleAdd,
                        selectedRow: null,
                    },
                }}
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
            />
        </Box>
    );
};

export default DataTable;