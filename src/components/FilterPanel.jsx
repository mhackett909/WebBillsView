import { Box } from '@mui/material';
import { useMemo } from 'react';
import DatePickers from './filters/DatePickers';
import AmountRange from './filters/AmountRange';
import InvoiceSearch from './filters/InvoiceSearch';
import EntitySelect from './filters/EntitySelect';
import CheckBoxControls from './filters/CheckBoxControls';
import FilterButtons from './filters/FilterButtons';
import '../styles/filters.css';

const FilterPanel = ({
    filters,
    dateRange,
    dateMode,
    includeArchived,
    handleFilterChange,
    setDateRange,
    setDateMode,
    setIncludeArchived,
    filterBills,
    clearFilters,
    availableBillers,
}) => {
    // Validation for AmountRange
    const amountRangeError = useMemo(() => {
        return (
            filters.amountMin !== '' &&
            Number(filters.amountMin) > Number(filters.amountMax) &&
            Number(filters.amountMax) !== 0
        );
    }, [filters.amountMin, filters.amountMax]);

    // Validation for DatePickers
    const dateRangeError = useMemo(() => {
        return (
            dateMode === 'Date Range' &&
            dateRange[0] &&
            dateRange[1] &&
            new Date(dateRange[0]) > new Date(dateRange[1])
        );
    }, [dateMode, dateRange]);

    const disableSearch = amountRangeError || dateRangeError;

    return (
        <Box className="filters-panel">
            <InvoiceSearch
                invoice={filters.invoice}
                handleFilterChange={handleFilterChange}
            />
            <EntitySelect
                billers={availableBillers}
                selectedBillers={filters.biller}
                handleFilterChange={handleFilterChange}
            />
            <DatePickers 
                dateRange={dateRange} 
                setDateRange={setDateRange}
                dateMode={dateMode}
                setDateMode={setDateMode}
            />
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
                disableSearch={disableSearch}
            />
        </Box>
    );
};

export default FilterPanel;