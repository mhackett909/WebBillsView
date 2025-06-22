import { Box, Checkbox, FormControlLabel, Collapse } from '@mui/material';
import { useMemo } from 'react';
import DatePickers from './filters/DatePickers';
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
    width,
}) => {
    const shouldShowOptions = showMoreOptions;

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
        <Box className="filters-panel" width={width} minWidth="800px">
        <Box display="flex" alignItems="flex-start" width="100%">
            <Box display="flex" gap="15px" alignItems="flex-start" sx={{ minWidth: 'fit-content' }}>     
                <Box display="flex" flexDirection="column" gap="8px" sx={{ minWidth: '200px' }}>
                        <InvoiceSearch
                            invoice={filters.invoice}
                            handleFilterChange={handleFilterChange}
                        />
                        <EntitySelect
                            billers={availableBillers}
                            selectedBillers={filters.biller}
                            handleFilterChange={handleFilterChange}
                        />
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
                    </Box>
                    <DatePickers 
                        dateRange={dateRange} 
                        setDateRange={setDateRange}
                        dateMode={dateMode}
                        setDateMode={setDateMode}
                    />                </Box>                  
                    <FilterButtons
                        filterBills={filterBills}
                        clearFilters={clearFilters}
                        disableSearch={disableSearch}
                    />
            </Box>
            <Collapse in={shouldShowOptions}>
                <CheckBoxControls
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    includeArchived={includeArchived}
                    setIncludeArchived={setIncludeArchived}
                />
            </Collapse>
        </Box>
    );
};

export default FilterPanel;