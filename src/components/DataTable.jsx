import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import '../styles/tabs.css';
import dayjs from 'dayjs';

import CustomToolbar from './toolbars/TableToolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const DataTable = ({
    rows,
    columns,
    columnVisibilityModel,
    setColumnVisibilityModel,
    handleAdd,
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
        // Party column (name)
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
                        <ArrowBackIcon color="primary" titleAccess="Income" />
                    ) : (
                        <ArrowForwardIcon color="warning" titleAccess="Expense" />
                    ),
            };
        }
        // Status column
        if (col.field === 'status') {
            return {
                ...col,
                renderCell: (params) =>
                    params.row.status ? (
                        <CheckCircleIcon color="success" titleAccess="Paid" />
                    ) : (
                        <CancelIcon color="error" titleAccess="Unpaid" />
                    ),
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
            />
        </Box>
    );
};

export default DataTable;