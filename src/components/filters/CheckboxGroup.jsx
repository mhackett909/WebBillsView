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
        <Box className="checkbox-container">
            <FormControl component="fieldset" sx={{ width: '100%', alignItems: 'center' }}>
                <FormLabel 
                    component="legend"
                    className="checkbox-label"
                >
                    {legend}
                </FormLabel>
                <FormGroup row={row} sx={{ justifyContent: 'center' }}>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            control={
                                <Checkbox
                                    checked={selectedValue === option.value}
                                    onChange={() => handleChange(option.value)}
                                />
                            }
                            label={option.label}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </Box>
    );
};

export default CheckboxGroup;
