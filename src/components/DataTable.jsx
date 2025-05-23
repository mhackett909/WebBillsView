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
                        if (flow === 'OUTGOING') plusOneColor = '#ed6c02'; // orange (same as right arrow)
                        else if (flow === 'INCOMING') plusOneColor = '#0288d1';
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
                                <CancelIcon color="error" titleAccess="Unpaid" />
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