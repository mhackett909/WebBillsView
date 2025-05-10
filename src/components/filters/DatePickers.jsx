import { useState } from 'react';
import { Box, TextField, MenuItem, Select, FormControl } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const DatePickers = ({ dateRange, setDateRange }) => {
    const [dateMode, setDateMode] = useState('Date Range'); // Default to "Date Range"

    const handleDateModeChange = (newMode) => {
        setDateMode(newMode);
        if (newMode === 'Single Date') {
            setDateRange([dateRange[0], null]); // Clear end date when switching to Single Date mode
        }
    };

    return (
        <Box
            sx={{
                border: '2px solid rgb(134, 131, 131)', // Add a light gray border
                borderRadius: '8px', // Optional: Add rounded corners
                padding: '16px', // Add padding inside the border
                marginBottom: '16px', // Add space below the component
            }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* Dropdown to select Single Date or Date Range */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <Select
                        value={dateMode}
                        onChange={(e) => handleDateModeChange(e.target.value)}
                    >
                        <MenuItem value="Single Date">Single Date</MenuItem>
                        <MenuItem value="Date Range">Date Range</MenuItem>
                    </Select>
                </FormControl>

                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Start Date Picker */}
                    <DatePicker
                        label={dateMode === 'Single Date' ? 'Date' : 'Start Date'}
                        value={dateRange[0]}
                        onChange={(newValue) => {
                            if (dateMode === 'Single Date') {
                                setDateRange([newValue, null]); // Clear end date in Single Date mode
                            } else {
                                setDateRange([newValue, dateRange[1]]);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                error={
                                    dateMode === 'Date Range' &&
                                    dateRange[0] &&
                                    dateRange[1] &&
                                    dayjs(dateRange[0]).isAfter(dayjs(dateRange[1])) // Start date exceeds end date
                                }
                                helperText={
                                    dateMode === 'Date Range' &&
                                    dateRange[0] &&
                                    dateRange[1] &&
                                    dayjs(dateRange[0]).isAfter(dayjs(dateRange[1]))
                                        ? 'Start date must not exceed end date'
                                        : ''
                                }
                            />
                        )}
                    />

                    {/* End Date Picker (only visible in Date Range mode) */}
                    {dateMode === 'Date Range' && (
                        <DatePicker
                            label="End Date"
                            value={dateRange[1]}
                            onChange={(newValue) => {
                                setDateRange([dateRange[0], newValue]);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    error={
                                        dateRange[0] &&
                                        dateRange[1] &&
                                        dayjs(dateRange[0]).isAfter(dayjs(dateRange[1])) // Start date exceeds end date
                                    }
                                    helperText={
                                        dateRange[0] &&
                                        dateRange[1] &&
                                        dayjs(dateRange[0]).isAfter(dayjs(dateRange[1]))
                                            ? 'End date must not be earlier than start date'
                                            : ''
                                    }
                                />
                            )}
                        />
                    )}
                </Box>
            </LocalizationProvider>
        </Box>
    );
};

export default DatePickers;