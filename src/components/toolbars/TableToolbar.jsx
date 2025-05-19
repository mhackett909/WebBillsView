import { GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { Button } from '@mui/material';

import { exportEntries } from '../../utils/BillsApiUtil';

const CustomToolbar = ({ handleAdd }) => {
    
    const handleExport = async () => {
        await exportEntries();
    };

    const exportCsvEnabled = process.env.REACT_APP_EXPORT_CSV_ENABLED === 'true';

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '8px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="contained" onClick={handleAdd}>
                    New Invoice
                </Button>
                 {exportCsvEnabled && (
                    <Button variant="outlined" onClick={handleExport}>
                        Export As CSV
                    </Button>
                 )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <GridToolbarColumnsButton />
                <GridToolbarDensitySelector />
            </div>
        </div>
    );
};

export default CustomToolbar;