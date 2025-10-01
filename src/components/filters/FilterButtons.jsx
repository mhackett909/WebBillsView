import { Box, Button } from '@mui/material';

const FilterButtons = ({ filterBills, clearFilters, disableSearch }) => (
    <Box sx={{ width: '95%', pl: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
            variant="outlined" 
            color="primary" 
            onClick={filterBills}
            fullWidth
            sx={{ borderWidth: 2, mb: 1 }}
            disabled={disableSearch}
        >
            Search
        </Button>
        <Button 
            variant="outlined" 
            color="secondary" 
            onClick={clearFilters}
            fullWidth
            sx={{ borderWidth: 2 }}
        >
            Clear Filters
        </Button>
    </Box>
);

export default FilterButtons;