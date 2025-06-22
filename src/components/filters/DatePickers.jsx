import { Box, TextField, MenuItem, Select, FormControl } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import '../../styles/filters.css'; // Import the CSS file
import dayjs from 'dayjs';

const DatePickers = ({ dateRange, setDateRange, dateMode, setDateMode }) => {
    const handleDateModeChange = (newMode) => {
        setDateMode(newMode);
        if (newMode === 'Single Date') {
            if (dateRange[0]) {
                const startOfDay = dayjs(dateRange[0]).startOf('day');
                const endOfDay = dayjs(dateRange[0]).endOf('day');
                setDateRange([startOfDay, endOfDay]);
            } else {
                setDateRange([null, null]);
            }
        } else {
            setDateRange([dateRange[0], null]);
        }
    };    return (
        <Box className="date-pickers" sx={{ minWidth: '320px' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* Dropdown to select Single Date or Date Range */}
                <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
                    <Select
                        value={dateMode}
                        onChange={(e) => handleDateModeChange(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="Single Date">Single Date</MenuItem>
                        <MenuItem value="Date Range">Date Range</MenuItem>
                    </Select>
                </FormControl>
                <Box display="flex" flexDirection={dateMode === 'Date Range' ? 'row' : 'column'} gap={1.5}>
                    {/* Start Date Picker */}
                    <DatePicker
                        label={dateMode === 'Single Date' ? 'Date' : 'Start Date'}
                        value={dateRange[0]}
                        onChange={(newValue) => {
                            if (newValue) {
                                const startOfDay = dayjs(newValue).startOf('day');
                                const endOfDay = dayjs(newValue).endOf('day');
                                if (dateMode === 'Single Date') {
                                    setDateRange([startOfDay.toDate(), endOfDay.toDate()]);
                                } else {
                                    setDateRange([startOfDay.toDate(), dateRange[1]]);
                                }
                            } else {
                                if (dateMode === 'Single Date') {
                                    setDateRange([null, null]);
                                } else {
                                    setDateRange([null, dateRange[1]]);
                                }
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small" 
                                sx={{ 
                                    width: dateMode === 'Date Range' ? '160px' : '320px',
                                    minWidth: dateMode === 'Date Range' ? '160px' : '320px'
                                }}
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
                                if (newValue) {
                                    const endOfDay = dayjs(newValue).startOf('day');
                                    setDateRange([dateRange[0], endOfDay.toDate()]);
                                } else {
                                    setDateRange([dateRange[0], null]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{ 
                                        width: '160px',
                                        minWidth: '160px'
                                    }}
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