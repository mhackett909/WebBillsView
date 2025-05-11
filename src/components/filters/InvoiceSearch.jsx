import { TextField } from '@mui/material';
import '../../styles/filters.css'; // Import the CSS file

const InvoiceSearch = ({ invoice, handleFilterChange }) => {
    return (
        <div className="filters-border">
            <TextField
                label="Invoice #"
                type="number"
                variant="outlined"
                value={invoice}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 1) {
                        handleFilterChange('invoice', value);
                    }
                }}
                onKeyDown={(e) => {
                    if (
                        !/[0-9]/.test(e.key) && // Allow numeric keys
                        e.key !== 'Backspace' && // Allow backspace
                        e.key !== 'ArrowLeft' && // Allow left arrow
                        e.key !== 'ArrowRight' && // Allow right arrow
                        e.key !== 'Delete' && // Allow delete
                        e.key !== 'Tab' // Allow tab
                    ) {
                        e.preventDefault();
                    }
                }}
                fullWidth
            />
        </div>
    );
};

export default InvoiceSearch;