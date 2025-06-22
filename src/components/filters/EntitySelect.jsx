import { Box, Select, MenuItem, Checkbox, Chip, Tooltip } from '@mui/material';
import '../../styles/global.css';
import '../../styles/filters.css';

const EntitySelect = ({ billers, selectedBillers, handleFilterChange }) => {
    return (
        <Box className="input-border" sx={{ minWidth: '200px', maxWidth: '200px' }}>
            <Select
                labelId="biller-label"
                multiple
                value={selectedBillers || []}
                size="small"
                onChange={(e) => handleFilterChange('biller', e.target.value)}
                displayEmpty
                fullWidth
                renderValue={(selected) =>
                    selected.length === 0 ? (
                        <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select Entities</span>
                    ) : (                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.5,
                            maxWidth: '100%',
                            overflow: 'hidden'
                        }}>
                            {selected.map((value) => (
                                <Tooltip key={value} title={value} arrow placement="top">
                                    <Chip
                                        label={value}
                                        className="chip-style"
                                        size="small"
                                        sx={{
                                            maxWidth: '90px',
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }
                                        }}
                                    />
                                </Tooltip>
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

export default EntitySelect;