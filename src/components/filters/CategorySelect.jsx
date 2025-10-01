import { Box, Select, MenuItem, Checkbox, Chip, Tooltip } from '@mui/material';
import '../../styles/global.css';
import '../../styles/filters.css';

const CategorySelect = ({ categories, selectedCategories, handleFilterChange }) => {
    // Function to capitalize first letter of each word
    const capitalizeWords = (str) => {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    };

    // Sort categories alphabetically, but put "Uncategorized" first
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.toLowerCase() === 'uncategorized') return -1;
        if (b.toLowerCase() === 'uncategorized') return 1;
        return a.localeCompare(b);
    });
    
    return (
        <Box className="input-border" sx={{ minWidth: '200px', maxWidth: '200px' }}>
            <Select
                labelId="category-label"
                multiple
                value={selectedCategories || []}
                size="small"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                displayEmpty
                fullWidth
                renderValue={(selected) =>
                    selected.length === 0 ? (
                        <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select Categories</span>
                    ) : (
                    <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.5,
                            maxWidth: '100%',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        >{selected.map((value) => (
                            <Tooltip key={value} title={capitalizeWords(value)} arrow placement="top">
                                <Chip
                                    label={capitalizeWords(value)}
                                    className="chip-style"
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        const newSelected = selected.filter(item => item !== value);
                                        handleFilterChange('category', newSelected);
                                    }}
                                    sx={{
                                        maxWidth: '150px',
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
                {sortedCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                        <Checkbox checked={selectedCategories.includes(category)} />
                        {capitalizeWords(category)}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default CategorySelect;
