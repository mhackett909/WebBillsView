import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Snackbar } from '@mui/material';
import { getBillById, fetchEntryById, getPayments, postPayment, updatePayment } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { green, red } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

const Entries = () => {
    const { id } = useParams();
    const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
    const [entry, setEntry] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        date: '',
        amount: '',
        type: '',
        medium: '',
        notes: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [billName, setBillName] = useState('');
    const [billEnabled, setBillEnabled] = useState(true);

    const handleTokenRefresh = useCallback((newJwt, newRefresh) => {
        if (typeof setJwt === 'function') setJwt(newJwt);
        if (typeof setRefresh === 'function') setRefresh(newRefresh);
    }, [setJwt, setRefresh]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const entryData = await fetchEntryById(id, jwt, refresh, handleTokenRefresh);
                setEntry(entryData);
                const paymentData = await getPayments(id, jwt, refresh, handleTokenRefresh);
                setPayments(paymentData);
                // Fetch bill name and status if billId exists
                if (entryData && entryData.billId) {
                    const bill = await getBillById(entryData.billId, jwt, refresh, handleTokenRefresh);
                    setBillName(bill && bill.name ? bill.name : entryData.billId);
                    setBillEnabled(bill && bill.status ? true : false);
                } else {
                    setBillName('');
                    setBillEnabled(true);
                }
            } catch (err) {
                setError('Failed to load entry or payments.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, jwt, refresh, handleTokenRefresh]);

    const handleOpenAdd = () => {
        // Set default date to today in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        setModalMode('add');
        setPaymentForm({ date: todayStr, amount: '', type: '', medium: '', notes: '' });
        setSelectedPayment(null);
        setModalOpen(true);
    };
    const handleOpenEdit = (payment) => {
        setModalMode('edit');
        setPaymentForm({
            date: payment.date || '',
            amount: payment.amount || '',
            type: payment.type || '',
            medium: payment.medium || '',
            notes: payment.notes || ''
        });
        setSelectedPayment(payment);
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedPayment(null);
    };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            // Only allow up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/;
            if (!regex.test(value)) return;
        }
        setPaymentForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSavePayment = async () => {
        // Validate required fields
        if (!paymentForm.date || !paymentForm.amount || !paymentForm.type || !paymentForm.medium) {
            setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
            return;
        }
        try {
            if (modalMode === 'add') {
                const paymentData = {
                    ...paymentForm,
                    entryId: Number(id),
                    amount: parseFloat(paymentForm.amount),
                };
                const result = await postPayment(paymentData, jwt, refresh, handleTokenRefresh);
                if (result && result.paymentId) {
                    // Refresh entry and payments after add
                    const [entryData, paymentData] = await Promise.all([
                        fetchEntryById(id, jwt, refresh, handleTokenRefresh),
                        getPayments(id, jwt, refresh, handleTokenRefresh)
                    ]);
                    setEntry(entryData);
                    setPayments(paymentData);
                    setSnackbar({ open: true, message: 'Payment added successfully!', severity: 'success' });
                    setModalOpen(false);
                } else {
                    setSnackbar({ open: true, message: 'Failed to add payment.', severity: 'error' });
                }
            } else if (modalMode === 'edit' && selectedPayment) {
                const paymentData = {
                    ...paymentForm,
                    paymentId: selectedPayment.paymentId,
                    entryId: Number(id),
                    amount: parseFloat(paymentForm.amount),
                };
                const result = await updatePayment(paymentData, jwt, refresh, handleTokenRefresh);
                if (result && result.paymentId) {
                    // Refresh entry and payments after edit
                    const [entryData, paymentData] = await Promise.all([
                        fetchEntryById(id, jwt, refresh, handleTokenRefresh),
                        getPayments(id, jwt, refresh, handleTokenRefresh)
                    ]);
                    setEntry(entryData);
                    setPayments(paymentData);
                    setSnackbar({ open: true, message: 'Payment updated successfully!', severity: 'success' });
                    setModalOpen(false);
                } else {
                    setSnackbar({ open: true, message: 'Failed to update payment.', severity: 'error' });
                }
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error saving payment.', severity: 'error' });
        }
    };
    const handleOpenDelete = (payment) => {
        setDeleteTarget(payment);
        setDeleteDialogOpen(true);
    };
    const handleCloseDelete = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteDialogOpen(false);
        try {
            const paymentData = {
                ...deleteTarget,
                entryId: Number(id),
                recycle: true, // Pass recycle: true when deleting
            };
            const result = await updatePayment(paymentData, jwt, refresh, handleTokenRefresh);
            if (result && result.paymentId) {
                setSnackbar({ open: true, message: 'Payment deleted successfully.', severity: 'success' });
                // Refresh entry and payments after delete
                const [entryData, updatedPayments] = await Promise.all([
                    fetchEntryById(id, jwt, refresh, handleTokenRefresh),
                    getPayments(id, jwt, refresh, handleTokenRefresh)
                ]);
                setEntry(entryData);
                setPayments(updatedPayments);
            } else {
                setSnackbar({ open: true, message: 'Failed to delete payment.', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error deleting payment.', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return (
            <Box maxWidth={600} mx="auto" mt={4}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }
    if (!entry) {
        return (
            <Box maxWidth={600} mx="auto" mt={4}>
                <Alert severity="warning">Entry not found.</Alert>
            </Box>
        );
    }

    return (
        <Box maxWidth={800} mx="auto" mt={4}>
            {/* Read-only banner if bill is archived */}
            {!billEnabled && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    This entry is <strong>read only</strong> because the party is archived.<br />
                    To restore editing, use the <strong>Archives</strong> feature from the <strong>History</strong> dropdown in the toolbar to restore the party to an active state.
                </Alert>
            )}
            {/* Top half: Entry details */}
            <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" gutterBottom>Entry Details</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => entry && entry.entryId && window.open(`/invoice/${entry.entryId}`, '_self')}
                        sx={{ ml: 2, fontWeight: 'bold', boxShadow: 2, px: 2, py: 0.5, minWidth: 0 }}
                        disabled={!billEnabled}
                    >
                        Edit Invoice
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}><strong>Entry ID:</strong> {entry.entryId}</Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Party:</strong> {billName}
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}><strong>Date:</strong> {entry.date}</Grid>
                    <Grid item xs={12} sm={6} md={4}><strong>Amount:</strong> {entry.amount}</Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Paid:</strong> {entry.status ? (
                            <CheckCircleIcon sx={{ color: green[600], verticalAlign: 'middle' }} titleAccess="Active" />
                        ) : (
                            <CancelIcon sx={{ color: red[600], verticalAlign: 'middle' }} titleAccess="Inactive" />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Flow:</strong> {entry.flow === 'OUTGOING' ? 'Expense' : entry.flow === 'INCOMING' ? 'Income' : entry.flow}
                    </Grid>
                    <Grid item xs={12} md={12}><strong>Services:</strong> {entry.services}</Grid>
                </Grid>
            </Paper>
            {/* Bottom half: Payments table */}
            <Paper sx={{ p: 3 }} elevation={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" gutterBottom>Payments</Typography>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAdd} size="small" disabled={!billEnabled}>
                        Add Payment
                    </Button>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {/* id column is hidden */}
                                <TableCell style={{ display: 'none' }}>ID</TableCell>
                                <TableCell>Payment Date</TableCell>
                                <TableCell>Payment Amount</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Medium</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No payments found.</TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id || payment.paymentId}>
                                        <TableCell style={{ display: 'none' }}>{payment.id || payment.paymentId}</TableCell>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell>{payment.amount}</TableCell>
                                        <TableCell>{
                                            (() => {
                                                switch (payment.type) {
                                                case 'cash': return 'Cash';
                                                case 'check': return 'Check';
                                                case 'credit': return 'Credit';
                                                case 'debit': return 'Debit';
                                                case 'eft': return 'Electronic Fund Transfer';
                                                case 'other': return 'Other';
                                                default: return payment.type;
                                                }
                                            })()
                                            }</TableCell>
                                                                                    <TableCell>{
                                            (() => {
                                                switch (payment.medium) {
                                                case 'app': return 'App';
                                                case 'web': return 'Website';
                                                case 'person': return 'In Person';
                                                case 'mail': return 'Mail';
                                                case 'phone': return 'Phone';
                                                case 'other': return 'Other';
                                                case 'ach': return 'ACH';
                                                case 'wire': return 'Wire';
                                                default: return payment.medium;
                                                }
                                            })()
                                            }</TableCell>
                                        <TableCell>{payment.notes}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenEdit(payment)} disabled={!billEnabled}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(payment)} disabled={!billEnabled}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            {/* Payment Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>{modalMode === 'add' ? 'Add Payment' : 'Edit Payment'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Payment Date"
                        name="date"
                        type="date"
                        value={paymentForm.date}
                        onChange={handleFormChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Payment Amount"
                        name="amount"
                        type="number"
                        value={paymentForm.amount}
                        onChange={handleFormChange}
                        onKeyDown={(e) => {
                            // Allow only digits, one dot, backspace, delete, arrows, tab
                            if (
                                !/^[0-9.]$/.test(e.key) &&
                                e.key !== 'Backspace' &&
                                e.key !== 'Delete' &&
                                e.key !== 'ArrowLeft' &&
                                e.key !== 'ArrowRight' &&
                                e.key !== 'Tab'
                            ) {
                                e.preventDefault();
                            }
                            // Prevent more than one dot
                            if (e.key === '.' && e.target.value.includes('.')) {
                                e.preventDefault();
                            }
                        }}
                        fullWidth
                        required
                        inputProps={{
                            inputMode: 'decimal',
                            pattern: '^\\d*(\\.\\d{0,2})?$',
                            min: 0,
                            step: '0.01'
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Type"
                        name="type"
                        value={paymentForm.type}
                        onChange={handleFormChange}
                        select
                        fullWidth
                        required
                    >
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                        <MenuItem value="credit">Credit</MenuItem>
                        <MenuItem value="debit">Debit</MenuItem>
                        <MenuItem value="eft">Electronic Fund Transfer</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Medium"
                        name="medium"
                        value={paymentForm.medium}
                        onChange={handleFormChange}
                        select
                        fullWidth
                        required
                    >
                        <MenuItem value="app">App</MenuItem>
                        <MenuItem value="web">Website</MenuItem>
                        <MenuItem value="person">In Person</MenuItem>
                        <MenuItem value="mail">Mail</MenuItem>
                        <MenuItem value="phone">Phone</MenuItem>
                        <MenuItem value="ach">ACH</MenuItem>
                        <MenuItem value="wire">Wire</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Notes"
                        name="notes"
                        value={paymentForm.notes}
                        onChange={handleFormChange}
                        fullWidth
                        multiline
                        minRows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSavePayment} variant="contained">{modalMode === 'add' ? 'Add' : 'Save'}</Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
                <DialogTitle>Delete Payment?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to <strong>delete</strong> this payment? You will have 14 days to restore it from the <strong>Recycle Bin</strong> in the <strong>History</strong> tab.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            {/* Snackbar for success/error messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Entries;