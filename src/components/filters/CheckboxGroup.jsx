import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import '../../styles/filters.css';

const CheckboxGroup = ({ legend, options, selectedValue, onChange, row = false }) => {
    const handleChange = (value) => {
        if (selectedValue === value) {
            onChange('');
        } else {
            onChange(value);
        }
    };
    return (
        <Box 
            className="checkbox-container" 
            sx={{ 
                width: '100%',
                border: '2px solid rgb(134, 131, 131)',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                display: 'flex',
                padding: '6px',
                minHeight: '60px',
                height: 'auto',
                maxHeight: '60px'
            }}
        >
            <FormControl 
                component="fieldset" 
                sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}
                className={legend === 'Status' ? 'status-container' : undefined}
            >
                <FormLabel 
                    component="legend"
                    className="checkbox-label"
                    sx={{ 
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 0.5,
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minHeight: '20px'
                    }}
                >
                    {legend}
                </FormLabel>
                <FormGroup 
                    sx={{ 
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 0.2,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        flex: 1,
                        alignContent: 'flex-start'
                    }}
                >
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            control={
                                <Checkbox
                                    checked={selectedValue === option.value}
                                    onChange={() => handleChange(option.value)}
                                    size="small"
                                />
                            }
                            label={option.label}
                            sx={{ 
                                margin: '1px 2px',
                                minWidth: 'auto',
                                fontSize: '12px'
                            }}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </Box>
    );
};

export default CheckboxGroup;
