import { Box, Button } from '@mui/material';

const FilterButtons = ({ filterBills, clearFilters }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: -1 }}>
        <Button 
            variant="outlined" 
            color="primary" 
            onClick={filterBills}
            sx={{ borderWidth: 2 }}
        >
            Search
        </Button>
        <Button 
            variant="outlined" 
            color="secondary" 
            onClick={clearFilters}
            sx={{ borderWidth: 2 }}
        >
            Clear Filters
        </Button>
    </Box>
);

export default FilterButtons;