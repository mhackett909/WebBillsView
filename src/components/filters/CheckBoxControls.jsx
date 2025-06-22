import { Box } from '@mui/material';
import CheckboxGroup from './CheckboxGroup';

const CheckBoxControls = ({
    filters,
    handleFilterChange,
    includeArchived,
    setIncludeArchived,
    setIncludeArchivedOnly,
}) => (
    <Box sx={{ mt: 1, width: '100%' }}>        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: 1, 
            width: '100%',
            alignItems: 'stretch'
        }}>
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
                            if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(false);
                        } else if (value === 'only') {
                            setIncludeArchived('only');
                            if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(true);
                        } else {
                            setIncludeArchived(false);
                            if (typeof setIncludeArchivedOnly === 'function') setIncludeArchivedOnly(false);
                        }
                    }}
                />
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
    </Box>
);

export default CheckBoxControls;