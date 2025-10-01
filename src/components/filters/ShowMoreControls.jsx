import { Box } from '@mui/material';
import AmountRange from './AmountRange';
import CheckboxGroup from './CheckboxGroup';

const ShowMoreControls = ({
    filters,
    handleFilterChange,
    includeArchived,
    setIncludeArchived,
}) => {
    return (
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
                            { value: 'internal', label: 'Internal' },
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
    );
};

export default ShowMoreControls;
