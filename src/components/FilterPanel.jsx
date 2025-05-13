import {
    Box,
} from '@mui/material';
import DatePickers from './filters/DatePickers';
import AmountRange from './filters/AmountRange';
import InvoiceSearch from './filters/InvoiceSearch';
import PartySelect from './filters/PartySelect';
import CheckBoxControls from './filters/CheckBoxControls';
import FilterButtons from './filters/FilterButtons';
import '../styles/filters.css';

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
            <PartySelect
                billers={availableBillers}
                selectedBillers={filters.biller}
                handleFilterChange={handleFilterChange}
            />
            <DatePickers dateRange={dateRange} setDateRange={setDateRange} />
            <AmountRange filters={filters} handleFilterChange={handleFilterChange} />
            <CheckBoxControls
                filters={filters}
                handleFilterChange={handleFilterChange}
                includeArchived={includeArchived}
                setIncludeArchived={setIncludeArchived}
            />
            <FilterButtons
                filterBills={filterBills}
                clearFilters={clearFilters}
            />
        </Box>
    );
};

export default FilterPanel;