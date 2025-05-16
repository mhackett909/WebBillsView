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
        <Box className="tabs-container">
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.entryId}
                checkboxSelection
                selectionModel={selectionModel}
                onSelectionModelChange={(newSelection) => {
                    let selectedId = null;
                    if (newSelection.length > 1) {
                        setSelectionModel([newSelection[newSelection.length - 1]]);
                        selectedId = newSelection[newSelection.length - 1];
                    } else {
                        setSelectionModel(newSelection);
                        if (newSelection.length > 0) {
                            selectedId = newSelection[0];
                        }
                    }
                    if (selectedId !== null) {
                        const selectedRowObj = rows.find(row => row.entryId == selectedId);
                        setSelectedRow(selectedRowObj ? selectedRowObj.entryId : null);
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