import { Box, TextField, InputAdornment } from '@mui/material';
import '../../styles/filters.css'; // Import the CSS file

const AmountRange = ({ filters, handleFilterChange }) => {
    return (
        <Box className="range-picker">
            <TextField
                label="Min Amount"
                type="number"
                variant="outlined"
                size="small"
                value={filters.amountMin}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1) {
                        handleFilterChange('amountMin', value);
                    } else {
                        handleFilterChange('amountMin', '');
                    }
                }}
                error={
                    filters.amountMin !== '' &&
                    (Number(filters.amountMin) > Number(filters.amountMax) && Number(filters.amountMax) !== 0)
                }
                helperText={
                    filters.amountMin !== '' &&
                    Number(filters.amountMin) > Number(filters.amountMax) &&
                    Number(filters.amountMax) !== 0
                        ? 'Min must be less than or equal to Max'
                        : ''
                }
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
            />
            <TextField
                label="Max Amount"
                type="number"
                variant="outlined"
                size="small"
                value={filters.amountMax}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1) {
                        handleFilterChange('amountMax', value);
                    } else {
                        handleFilterChange('amountMax', '');
                    }
                }}
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
            />
        </Box>
    );
};

export default AmountRange;