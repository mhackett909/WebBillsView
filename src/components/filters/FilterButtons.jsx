import { Box, Button } from '@mui/material';

const FilterButtons = ({ filterBills, clearFilters, disableSearch }) => (
    <Box sx={{ width: '100%' }}>
        <Button 
            variant="outlined" 
            color="primary" 
            onClick={filterBills}
            sx={{ borderWidth: 2, display: 'block', width: '100%', mb: 1 }}
            disabled={disableSearch}
        >
            Search
        </Button>
        <Button 
            variant="outlined" 
            color="secondary" 
            onClick={clearFilters}
            sx={{ borderWidth: 2, display: 'block', width: '100%' }}
        >
            Clear Filters
        </Button>
    </Box>
);

export default FilterButtons;