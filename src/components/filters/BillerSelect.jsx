import { Box, Select, MenuItem, Checkbox, Chip } from '@mui/material';

const BillerSelect = ({ billers, selectedBillers, handleFilterChange }) => {
    return (
        <Box>
            <Select
                labelId="biller-label"
                multiple
                value={selectedBillers || []}
                onChange={(e) => handleFilterChange('biller', e.target.value)}
                displayEmpty
                fullWidth
                renderValue={(selected) =>
                    selected.length === 0 ? (
                        <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select Billers</span>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )
                }
            >
                {billers.map((biller) => (
                    <MenuItem key={biller} value={biller}>
                        <Checkbox checked={selectedBillers.includes(biller)} />
                        {biller}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default BillerSelect;