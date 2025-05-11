import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import DatePickers from './DatePickers';
import AmountRange from './AmountRange';
import InvoiceSearch from './InvoiceSearch';
import BillerSelect from './BillerSelect';
import '../../styles/filters.css';

const FilterPanel = ({
    filters,
    dateRange,
    includeArchived,
    handleFilterChange,
    setDateRange,
    setIncludeArchived,
    filterBills,
    clearFilters,
}) => {
    // Temporary array of available billers
    const availableBillers = ['Bill 1', 'Bill 2', 'Bill 3', 'Bill 4', 'Bill 5'];

    return (
        <Box className="filters-panel">
            <InvoiceSearch
                invoice={filters.invoice}
                handleFilterChange={handleFilterChange}
            />
            <BillerSelect
                billers={availableBillers}
                selectedBillers={filters.biller}
                handleFilterChange={handleFilterChange}
            />
            <DatePickers dateRange={dateRange} setDateRange={setDateRange} />
            <AmountRange filters={filters} handleFilterChange={handleFilterChange} />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={includeArchived}
                        onChange={(e) => setIncludeArchived(e.target.checked)}
                    />
                }
                label="Include Archives"
            />
            <Button variant="outlined" color="primary" onClick={filterBills}>
                Search
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearFilters}>
                Clear Filters
            </Button>
        </Box>
    );
};

export default FilterPanel;