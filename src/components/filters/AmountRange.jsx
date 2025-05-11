import { Box, TextField, InputAdornment } from '@mui/material';
import '../../styles/filters.css'; // Import the CSS file

const AmountRange = ({ filters, handleFilterChange }) => {
    const MAX_VALUE = 99999;
    return (
        <Box className="range-picker">
            <TextField
                label="Min"
                type="number"
                variant="outlined"
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
                    (
                        (Number(filters.amountMin) > Number(filters.amountMax) && Number(filters.amountMax) !== 0) ||
                        Number(filters.amountMin) > MAX_VALUE
                    )
                }
                helperText={
                    filters.amountMin !== '' &&
                    Number(filters.amountMin) > Number(filters.amountMax) &&
                    Number(filters.amountMax) !== 0
                        ? 'Min must be less than or equal to Max'
                        : Number(filters.amountMin) > MAX_VALUE
                        ? `Min must not exceed ${MAX_VALUE}`
                        : ''
                }
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
            />
            <TextField
                label="Max"
                type="number"
                variant="outlined"
                value={filters.amountMax}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1) {
                        handleFilterChange('amountMax', value);
                    } else {
                        handleFilterChange('amountMax', '');
                    }
                }}
                error={
                    filters.amountMax !== '' &&
                    Number(filters.amountMax) > MAX_VALUE
                }
                helperText={
                    filters.amountMax !== '' &&
                    Number(filters.amountMax) > MAX_VALUE
                        ? `Max must not exceed ${MAX_VALUE}`
                        : ''
                }
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
            />
        </Box>
    );
};

export default AmountRange;