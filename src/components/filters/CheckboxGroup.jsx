import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import '../../styles/filters.css';

const CheckboxGroup = ({ legend, options, selectedValue, onChange, row = false }) => {
    const handleChange = (value) => {
        if (selectedValue === value) {
            // Unselect if already selected
            onChange('');
        } else {
            onChange(value);
        }
    };

    return (
        <Box className="checkbox-container">
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ textAlign: 'center', width: '100%' }}>
                    {legend}
                </FormLabel>
                <FormGroup>
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
                            className="checkbox-label"
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </Box>
    );
};

export default CheckboxGroup;