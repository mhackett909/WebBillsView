import { Box } from '@mui/material';
import CheckboxGroup from './CheckboxGroup';

const CheckBoxControls = ({
    filters,
    handleFilterChange,
    includeArchived,
    setIncludeArchived,
    setIncludeArchivedOnly,
}) => (
    <Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <CheckboxGroup
                legend="Flow"
                options={[
                    { value: 'OUTGOING', label: 'Expense' },
                    { value: 'INCOMING', label: 'Income' },
                ]}
                selectedValue={filters.flow || ''}
                onChange={(value) => handleFilterChange('flow', value)}
            />
            <CheckboxGroup
                legend="Status"
                options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' },
                    { value: 'overpaid', label: 'Overpaid' },
                ]}
                selectedValue={filters.status || ''}
                onChange={(value) => handleFilterChange('status', value)}
            />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mt: 1.5, mb: 1 }}>
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
                        if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(false);
                    } else if (value === 'only') {
                        setIncludeArchived('only');
                        if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(true);
                    } else {
                        setIncludeArchived(false);
                        if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(false);
                    }
                }}
                row
            />
        </Box>
    </Box>
);

export default CheckBoxControls;