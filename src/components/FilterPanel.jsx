import { Box, Checkbox, FormControlLabel, Collapse } from '@mui/material';
import { useMemo } from 'react';
import DatePickers from './filters/DatePickers';
import AmountRange from './filters/AmountRange';
import InvoiceSearch from './filters/InvoiceSearch';
import EntitySelect from './filters/EntitySelect';
import CheckBoxControls from './filters/CheckBoxControls';
import CheckboxGroup from './filters/CheckboxGroup';
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

    const disableSearch = amountRangeError || dateRangeError;    return (
        <Box className="filters-panel" width={width} minWidth="800px">            
        <Box display="flex" alignItems="flex-start">                
            <Box display="flex" gap="15px" alignItems="flex-start">                
                <Box display="flex" flexDirection="column" gap="8px">
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
                    />
                </Box>                  <Box display="flex" flexDirection="column" gap="10px" alignItems="flex-end" justifyContent="center" sx={{ minWidth: '160px' }}>
                    <FilterButtons
                        filterBills={filterBills}
                        clearFilters={clearFilters}
                        disableSearch={disableSearch}
                    />
                </Box>
            </Box>
            <Collapse in={shouldShowOptions}>
                <Box sx={{ pt: 0.5, maxWidth: '100%', overflow: 'hidden' }}>
                    {/* Top row: AmountRange and Status */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                            <AmountRange filters={filters} handleFilterChange={handleFilterChange} />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <CheckboxGroup
                                legend="Status"
                                options={[
                                    { value: 'paid', label: 'Paid' },
                                    { value: 'unpaid', label: 'Unpaid' },
                                    { value: 'overpaid', label: 'Overpaid' },
                                    { value: 'partial', label: 'Partial' },
                                ]}
                                selectedValue={filters.status || ''}
                                onChange={(value) => handleFilterChange('status', value)}
                            />
                        </Box>
                    </Box>
                    {/* Bottom row: Flow and Archives */}
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <CheckboxGroup
                                legend="Flow"
                                options={[
                                    { value: 'OUTGOING', label: 'Expense' },
                                    { value: 'INCOMING', label: 'Income' },
                                ]}
                                selectedValue={filters.flow || ''}
                                onChange={(value) => handleFilterChange('flow', value)}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <CheckboxGroup
                                legend="Archives"
                                options={[
                                    { value: 'include', label: 'Include' },
                                    { value: 'only', label: 'Only' },
                                ]}
                                selectedValue={includeArchived === true ? 'include' : includeArchived === 'only' ? 'only' : ''}
                                onChange={(value) => {
                                    if (value === 'include') {
                                        setIncludeArchived(true);
                                    } else if (value === 'only') {
                                        setIncludeArchived('only');
                                    } else {
                                        setIncludeArchived(false);
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default FilterPanel;