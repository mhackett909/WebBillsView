import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import '../styles/tabs.css';

import CustomToolbar from './toolbars/TableToolbar';

const DataTable = ({
    rows,
    columns,
    selectionModel,
    setSelectionModel,
    columnVisibilityModel,
    setColumnVisibilityModel,
    handleAdd,
}) => {
    const [selectedRow, setSelectedRow] = useState(null);
    return (
        <Box className="main-tabs">
            <DataGrid
                rows={rows}
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
                        const selected = rows.find((entry) => entry.id === selectedId);
                        setSelectedRow(selected);
                    } else {
                        setSelectedRow(null);
                    }
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                components={{
                    Toolbar: CustomToolbar,
                }}
                componentsProps={{
                    toolbar: {
                        handleAdd: handleAdd,
                        selectedRow: selectedRow,
                    },
                }}
            />
        </Box>
    );
};

export default DataTable;