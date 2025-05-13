import { Box, Checkbox, FormControlLabel } from '@mui/material';
import CheckboxGroup from './CheckboxGroup';

const CheckBoxControls = ({
    filters,
    handleFilterChange,
    includeArchived,
    setIncludeArchived,
}) => (
    <Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <CheckboxGroup
                legend="Flow"
                options={[
                    { value: 'OUTGOING', label: 'Outgoing' },
                    { value: 'INCOMING', label: 'Incoming' },
                ]}
                selectedValue={filters.flow || ''}
                onChange={(value) => handleFilterChange('flow', value)}
                row={true}
            />
            <CheckboxGroup
                legend="Status"
                options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' },
                ]}
                selectedValue={filters.status || ''}
                onChange={(value) => handleFilterChange('status', value)}
                row={true}
            />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={includeArchived}
                        onChange={(e) => setIncludeArchived(e.target.checked)}
                    />
                }
                label="Archived"
            />
        </Box>
    </Box>
);

export default CheckBoxControls;