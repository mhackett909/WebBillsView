import { Box, TextField, InputAdornment } from '@mui/material';

const AmountRange = ({ filters, handleFilterChange }) => {
    const MAX_VALUE = 99999;
    return (
        <Box display="flex" alignItems="center" gap={2}>
            <TextField
                label="Min"
                type="number"
                variant="outlined"
                value={filters.amountMin}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    // Ensure Min is not negative
                    if (value >= 0) {
                        handleFilterChange('amountMin', value);
                    }
                }}
                error={
                    filters.amountMin !== '' &&
                    (Number(filters.amountMin) > Number(filters.amountMax) && Number(filters.amountMax) !== 0) ||
                    Number(filters.amountMin) > MAX_VALUE
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
                    // Ensure Max is not negative
                    if (value >= 0) {
                        handleFilterChange('amountMax', value);
                    }
                }}
                error={
                    filters.amountMax !== '' &&
                    Number(filters.amountMax) !== 0 &&
                    (Number(filters.amountMax) < Number(filters.amountMin) || Number(filters.amountMax) > MAX_VALUE)
                }
                helperText={
                    filters.amountMax !== '' &&
                    Number(filters.amountMax) !== 0 &&
                    Number(filters.amountMax) < Number(filters.amountMin)
                        ? 'Max must be greater than or equal to Min'
                        : Number(filters.amountMax) > MAX_VALUE
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