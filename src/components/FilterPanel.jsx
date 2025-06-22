import { Box, Checkbox, FormControlLabel, Collapse } from '@mui/material';
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
    showMoreOptions,
    setShowMoreOptions,
}) => {    
    // Check if any advanced options are active
    const hasActiveAdvancedOptions = useMemo(() => {
        return (
            filters.flow !== '' ||
            filters.status !== '' ||
            includeArchived !== false
        );
    }, [filters.flow, filters.status, includeArchived]);

    // Auto-expand if any advanced options are active
    const shouldShowOptions = showMoreOptions || hasActiveAdvancedOptions;

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
            <FormControlLabel
                control={
                    <Checkbox
                        checked={shouldShowOptions}
                        onChange={(e) => {
                            const isChecked = e.target.checked;
                            setShowMoreOptions(isChecked);
                            sessionStorage.setItem('showMoreOptions', JSON.stringify(isChecked));
                        }}
                        size="small"
                    />
                }
                label="Show more options"
            />
            <Collapse in={shouldShowOptions}>
                <CheckBoxControls
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    includeArchived={includeArchived}
                    setIncludeArchived={setIncludeArchived}
                />
            </Collapse>
            <FilterButtons
                filterBills={filterBills}
                clearFilters={clearFilters}
                disableSearch={disableSearch}
            />
        </Box>
    );
};

export default FilterPanel;