import React, { useState, useContext, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, FormControl, InputLabel, Select, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { createEntry, getBills } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const initialState = {
  billId: '',
  date: dayjs().format('YYYY-MM-DD'),
  flow: '',
  amount: '',
  services: '',
  status: 0,
};

const NewInvoice = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [parties, setParties] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { jwt } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const bills = await getBills(jwt);
        setParties(bills);
      } catch (err) {
        setParties([]);
      }
    };
    fetchParties();
  }, [jwt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const entryData = {
        ...form,
        amount: parseFloat(form.amount),
        date: form.date,
      };
      const result = await createEntry(entryData, jwt);
      if (result && result.entryId) {
        setForm(initialState);
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate('/home');
        }, 1200);
      } else {
        setError('Failed to create invoice.');
      }
    } catch (err) {
      setError('Error creating invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h4" mb={2}>New Invoice</Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Party</InputLabel>
          <Select
            name="billId"
            value={form.billId}
            label="Party"
            onChange={handleChange}
          >
            {parties.map((bill) => (
              <MenuItem key={bill.id} value={bill.id}>{bill.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Flow</InputLabel>
          <Select
            name="flow"
            value={form.flow}
            label="Flow"
            onChange={handleChange}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          inputProps={{
            inputMode: 'decimal',
            pattern: '^\\d*(\\.\\d{0,2})?$',
            step: '0.01',
            min: '0',
          }}
        />
        <TextField
          label="Description"
          name="services"
          value={form.services}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Create Invoice'}
        </Button>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Invoice created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewInvoice;