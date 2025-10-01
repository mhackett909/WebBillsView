import { useState, useContext, useEffect, useCallback } from 'react';
import { Box, TextField, Button, MenuItem, Typography, FormControl, InputLabel, Select, Snackbar, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createEntry, getBills, createBill, fetchEntryById, editEntry, getBillById } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';
import { commonCategories, getDefaultCategory } from '../utils/Categories';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const initialState = {
  billId: '',
  date: dayjs().format('YYYY-MM-DD'),
  flow: '',
  amount: '',
  services: '',
  status: 0,
};

const Invoice = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [parties, setParties] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newPartyOpen, setNewPartyOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyCategory, setNewPartyCategory] = useState(getDefaultCategory());
  const [newPartyInternal, setNewPartyInternal] = useState(false);
  const [partySnackbar, setPartySnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [creatingParty, setCreatingParty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const entityNameParam = searchParams.get('entityName');

  const handleTokenRefresh = useCallback((newJwt, newRefresh) => {
    if (typeof setJwt === 'function') setJwt(newJwt);
    if (typeof setRefresh === 'function') setRefresh(newRefresh);
  }, [setJwt, setRefresh]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const bills = await getBills(jwt, refresh, handleTokenRefresh, 'active');
        setParties(bills);
        // If entityName param exists, select the matching entity
        if (entityNameParam && !id) {
          const match = bills.find(bill => bill.name === entityNameParam);
          if (match) {
            setForm(prev => ({ ...prev, billId: match.id }));
          }
        }
      } catch (err) {
        setParties([]);
      }
    };
    fetchParties();
  }, [jwt, refresh, handleTokenRefresh, entityNameParam, id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchEntryById(id, jwt, refresh, handleTokenRefresh)
        .then(async (entry) => {
          if (entry) {
            // Map backend flow values to UI values
            let flow = '';
            if (entry.flow === 'INCOMING') flow = 'income';
            else if (entry.flow === 'OUTGOING') flow = 'expense';
            else flow = entry.flow || '';
            setForm({
              billId: entry.billId || '',
              date: entry.date || dayjs().format('YYYY-MM-DD'),
              flow,
              amount: entry.amount || '',
              services: entry.services || '',
              status: entry.status || 0,
              invoiceId: entry.invoiceId || '',
              overpaid: entry.overpaid || 0,
            });
            // Fetch bill and set readOnly if status is false
            if (entry.billId) {
              const bill = await getBillById(entry.billId, jwt, refresh, handleTokenRefresh);
              if (!bill || !bill.status) {
                setReadOnly(true);
              } else {
                setReadOnly(false);
              }
              // Add bill to parties if not present
              if (bill && !parties.some(b => String(b.id) === String(bill.id))) {
                setParties(prev => [...prev, bill]);
              }
            }
          } else {
            setError('Invoice not found.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, jwt, refresh, parties, setLoading, handleTokenRefresh]);

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
        // If the selected entity is internal, force flow to be 'expense'
        flow: isSelectedPartyInternal() ? 'expense' : form.flow,
      };
      const result = await createEntry(entryData, jwt, refresh, handleTokenRefresh);
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

  const handleEditEntrySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const entryData = {
        ...form,
        amount: parseFloat(form.amount),
        date: form.date,
        entryId: parseInt(id, 10), // ensure id is an integer
        flow: form.flow,
      };
      const result = await editEntry(entryData, jwt, refresh, handleTokenRefresh);
      if (result && result.entryId) {
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(`/entries/${result.entryId}`);
        }, 1200);
      } else {
        setError('Failed to update invoice.');
      }
    } catch (err) {
      setError('Error updating invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPartyOpen = () => {
    setNewPartyOpen(true);
    setNewPartyName('');
    setNewPartyCategory(getDefaultCategory());
    setNewPartyInternal(false);
  };
  const handleNewPartyClose = () => {
    setNewPartyOpen(false);
    setNewPartyName('');
    setNewPartyCategory(getDefaultCategory());
    setNewPartyInternal(false);
  };

  const handleNewPartySubmit = async (e) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    setCreatingParty(true);
    try {
      const billData = { 
        name: newPartyName.trim(), 
        status: 1,
        category: newPartyCategory,
        internal: newPartyInternal
      };
      const result = await createBill(billData, jwt, refresh, handleTokenRefresh);
      if (result && result.id) {
        setParties((prev) => [...prev, result]);
        setPartySnackbar({ open: true, message: 'Entity created', severity: 'success' });
        setForm((prev) => ({ ...prev, billId: result.id }));
        setNewPartyOpen(false);
      } else {
        setPartySnackbar({ open: true, message: 'Failed to create entity', severity: 'error' });
      }
    } catch (err) {
      setPartySnackbar({ open: true, message: 'Error creating entity', severity: 'error' });
    } finally {
      setCreatingParty(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handlePartySnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setPartySnackbar((prev) => ({ ...prev, open: false }));
  };

  // Helper function to get the selected party
  const getSelectedParty = () => {
    return parties.find(party => String(party.id) === String(form.billId));
  };

  // Check if selected party is internal
  const isSelectedPartyInternal = () => {
    const selectedParty = getSelectedParty();
    return selectedParty ? selectedParty.internal : false;
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      {readOnly && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This invoice is <strong>read only</strong> because its entity is archived.<br />
          To restore editing, use the <strong>Archives</strong> feature from the <strong>History</strong> dropdown in the toolbar.
        </Alert>
      )}
      {loading ? (
        <>
          <Typography variant="h4" mb={2}>{id ? 'Edit Invoice' : 'New Invoice'}</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" my={2}>
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          </Box>
        </>
      ) : error ? (
        <Box maxWidth={500} mx="auto" mt={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <>
          <Typography variant="h4" mb={2}>{id ? 'Edit Invoice' : 'New Invoice'}</Typography>
          <form onSubmit={id ? handleEditEntrySubmit : handleSubmit}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Entity</InputLabel>
              <Select
                name="billId"
                value={form.billId}
                label="Entity"
                onChange={handleChange}
                disabled={readOnly}
              >
                {parties.map((bill) => (
                  <MenuItem key={bill.id} value={bill.id}>{bill.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" gap={2} mb={2}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleNewPartyOpen}
                disabled={readOnly}
              >
                New Entity
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                disabled={!form.billId || readOnly}
                onClick={() => {
                  if (form.billId) navigate(`/bills/${form.billId}`, { state: { invoiceId: id } });
                }}
              >
                Edit Entity
              </Button>
            </Box>
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
              disabled={readOnly}
            />
            {isSelectedPartyInternal() ? (
              <TextField
                label="Flow"
                value="Internal"
                fullWidth
                margin="normal"
                disabled
                InputProps={{
                  readOnly: true,
                }}
              />
            ) : (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Flow</InputLabel>
                <Select
                  name="flow"
                  value={form.flow}
                  label="Flow"
                  onChange={handleChange}
                  disabled={readOnly}
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              label="Amount"
              name="amount"
              type="text"
              value={form.amount}
              onChange={e => {
                // Only allow valid money input: digits, optional one dot, up to 2 decimals
                const value = e.target.value;
                if (value === '' || /^\d{0,9}(\.\d{0,2})?$/.test(value)) {
                  setForm(prev => ({ ...prev, amount: value }));
                }
              }}
              fullWidth
              margin="normal"
              required
              inputProps={{
                inputMode: 'decimal',
                pattern: '^\\d*(\\.\\d{0,2})?$',
                step: '0.01',
                min: '0',
                maxLength: 12
              }}
              disabled={readOnly}
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
              disabled={readOnly}
            />
            {error && <Typography color="error" mt={1}>{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={submitting || readOnly}
            >
              {submitting ? (id ? 'Saving...' : 'Submitting...') : (id ? 'Save Changes' : 'Create Invoice')}
            </Button>
            {id && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={readOnly}
                >
                  Delete Invoice
                </Button>
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                  <DialogTitle>Delete Invoice and Payments?</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Deleting this invoice will also <strong>delete all</strong> its payments. You will have <strong>14 days</strong> to restore them from the <strong>Recycle Bin</strong> in the <strong>History</strong> menu.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      setDeleteDialogOpen(false);
                      setSubmitting(true);
                      try {
                        const entryData = {
                          ...form,
                          amount: parseFloat(form.amount),
                          date: form.date,
                          entryId: parseInt(id, 10),
                          recycle: true, // Pass recycle: true when deleting
                          flow: form.flow,
                        };
                        const result = await editEntry(entryData, jwt, refresh, handleTokenRefresh);
                        if (result && result.entryId) {
                          setSnackbarOpen(true);
                          setTimeout(() => {
                            navigate('/home');
                          }, 1200);
                        } else {
                          setError('Failed to delete invoice.');
                        }
                      } catch (err) {
                        setError('Error deleting invoice.');
                      } finally {
                        setSubmitting(false);
                      }
                    }} color="error" variant="contained">Delete</Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </form>
          <Dialog open={newPartyOpen} onClose={handleNewPartyClose}>
            <DialogTitle>New Entity</DialogTitle>
            <form onSubmit={handleNewPartySubmit}>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Entity Name"
                  type="text"
                  fullWidth
                  value={newPartyName}
                  onChange={e => setNewPartyName(e.target.value)}
                  required
                  disabled={creatingParty}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newPartyCategory}
                    label="Category"
                    onChange={e => setNewPartyCategory(e.target.value)}
                    disabled={creatingParty}
                  >
                    {commonCategories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newPartyInternal}
                      onChange={e => setNewPartyInternal(e.target.checked)}
                      disabled={creatingParty}
                    />
                  }
                  label="Internal Transfers Only"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleNewPartyClose} disabled={creatingParty}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={creatingParty || !newPartyName.trim()}>
                  {creatingParty ? 'Creating...' : 'Create'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
          <Snackbar
            open={partySnackbar.open}
            autoHideDuration={2000}
            onClose={handlePartySnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handlePartySnackbarClose} severity={partySnackbar.severity} sx={{ width: '100%' }}>
              {partySnackbar.message}
            </Alert>
          </Snackbar>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={1500}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
              Invoice updated successfully!
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default Invoice;