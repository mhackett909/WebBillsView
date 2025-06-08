import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Snackbar } from '@mui/material';
import { getBillById, fetchEntryById, getPayments, postPayment, updatePayment } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import BoltIcon from '@mui/icons-material/Bolt';
import { mapPaymentTypeMedium } from '../utils/Mappers';

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
                const paymentData = await getPayments(id, jwt, refresh, handleTokenRefresh);
                setEntry(entryData);
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
                setError('Failed to load invoice or payments.');
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
            notes: payment.notes || '',
            autopay: payment.autopay || false
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
                <Alert severity="warning">Invoice not found.</Alert>
            </Box>
        );
    }

    return (
        <Box maxWidth={800} mx="auto" mt={4}>
            {/* Read-only banner if bill is archived */}
            {!billEnabled && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    This invoice is <strong>read only</strong> because the entity is archived.<br />
                    To restore editing, use the <strong>Archives</strong> feature from the <strong>History</strong> dropdown in the toolbar to restore the entity to an active state.
                </Alert>
            )}
            {/* Top half: Entry details */}
            <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" gutterBottom>Invoice Details</Typography>
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
                    <Grid item xs={12} sm={6} md={4}><strong>ID:</strong> {entry.invoiceId}</Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Entity:</strong> {billName}
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}><strong>Date:</strong> {entry.date}</Grid>
                    <Grid item xs={12} sm={6} md={4}><strong>Amount:</strong> {Number(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Paid:</strong>{' '}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'middle' }}>
                            {entry.status ? (
                                <>
                                    <CheckCircleIcon color="success" titleAccess="Paid" />
                                    {entry.overpaid && (
                                        <PlusOneIcon
                                            fontSize="medium"
                                            titleAccess="Overpaid"
                                            style={{ color: entry.flow === 'OUTGOING' ? '#ed6c02' : '#0288d1' }}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
                                    <CancelIcon color="error" titleAccess="Unpaid" />
                                    {Number(entry.balance?.totalBalance) > 0 && Number(entry.balance?.totalBalance) < Number(entry.amount) && (
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={entry.flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={entry.flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke={entry.flow === 'INCOMING' ? '#0288d1' : '#ed6c02'} strokeWidth="2"/></svg>
                                        </span>
                                    )}
                                </>
                            )}
                        </span>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Flow:</strong> {entry.flow === 'OUTGOING' ? 'Expense' : entry.flow === 'INCOMING' ? 'Income' : entry.flow}
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <strong>Description:</strong> {entry.services}
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ my: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mr: 1 }}>Balance:</Typography>
                            <Typography variant="h5" sx={{
                                fontWeight: 900,
                                color:
                                    Number(entry.balance?.totalBalance) > 0 && Number(entry.balance?.totalBalance) < Number(entry.amount)
                                        ? (entry.flow === 'INCOMING' ? '#0288d1' : '#ed6c02')
                                        : Number(entry.balance?.totalBalance) === 0
                                        ? 'success.main'
                                        : 'error.main',
                                bgcolor: '#f5f5f5',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                boxShadow: 1,
                                minWidth: 60,
                                textAlign: 'center',
                                display: 'inline-block'
                            }}>
                                {Number(entry.balance?.totalBalance) === 0 && (entry.amount !== undefined && entry.amount !== null) && payments && payments.length > 0 ? (
                                    Number(entry.balance?.totalOverpaid) > 0 ? (
                                        <>
                                            $0.00{' '}
                                            <span style={{ color: entry.flow === 'OUTGOING' ? '#ed6c02' : '#0288d1', fontWeight: 700, fontSize: '1.1em' }}>
                                                {`(+${Number(entry.balance.totalOverpaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                                            </span>
                                        </>
                                    ) : '$0.00'
                                ) : (
                                    `-$${Number(entry.balance?.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                )}
                            </Typography>
                        </Box>
                    </Grid>
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
                                <TableCell>Method</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No payments found.</TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => {
                                    const typeMedium = `${payment.type}|${payment.medium}`;
                                    return (
                                        <TableRow key={payment.id || payment.paymentId}>
                                            <TableCell style={{ display: 'none' }}>{payment.id || payment.paymentId}</TableCell>
                                            <TableCell>{payment.date}</TableCell>
                                            <TableCell>{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell>
                                                {mapPaymentTypeMedium(typeMedium)}
                                                {payment.autopay && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8, color: '#0288d1', fontWeight: 500, fontSize: '0.95em' }}>
                                                        <BoltIcon fontSize="small" />
                                                        Auto
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{payment.notes}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenEdit(payment)} disabled={!billEnabled}><EditIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleOpenDelete(payment)} disabled={!billEnabled}><DeleteIcon fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1, mb: 1 }}
                        onClick={() => {
                            if (entry && entry.balance && entry.balance.totalBalance !== undefined && entry.balance.totalBalance !== null) {
                                setPaymentForm(prev => ({ ...prev, amount: Number(entry.balance.totalBalance).toFixed(2) }));
                            }
                        }}
                        disabled={modalMode !== 'add' || !entry || !entry.balance || Number(entry.balance.totalBalance) <= 0}
                    >
                        Pay Remaining balance
                    </Button>
                    <TextField
                        margin="dense"
                        label="Method"
                        name="method"
                        value={paymentForm.type && paymentForm.medium ? `${paymentForm.type}|${paymentForm.medium}` : ''}
                        onChange={e => {
                            const [type, medium] = e.target.value.split('|');
                            setPaymentForm(prev => ({ ...prev, type, medium }));
                        }}
                        select
                        fullWidth
                        required
                        displayEmpty
                        SelectProps={{
                            renderValue: (selected) => {
                                if (!selected) {
                                    return '';
                                }
                                return mapPaymentTypeMedium(selected);
                            }
                        }}
                    >
                        <MenuItem value="bank|ach">{mapPaymentTypeMedium('bank|ach')}</MenuItem>
                        <MenuItem value="credit|person">{mapPaymentTypeMedium('credit|person')}</MenuItem>
                        <MenuItem value="credit|web">{mapPaymentTypeMedium('credit|web')}</MenuItem>
                        <MenuItem value="debit|person">{mapPaymentTypeMedium('debit|person')}</MenuItem>
                        <MenuItem value="debit|web">{mapPaymentTypeMedium('debit|web')}</MenuItem>
                        <MenuItem value="check|person">{mapPaymentTypeMedium('check|person')}</MenuItem>
                        <MenuItem value="check|mail">{mapPaymentTypeMedium('check|mail')}</MenuItem>
                        <MenuItem value="cash|person">{mapPaymentTypeMedium('cash|person')}</MenuItem>
                        <MenuItem value="cash|mail">{mapPaymentTypeMedium('cash|mail')}</MenuItem>
                        <MenuItem value="cyber|web">{mapPaymentTypeMedium('cyber|web')}</MenuItem>
                        <MenuItem value="other|ewallet">{mapPaymentTypeMedium('other|ewallet')}</MenuItem>
                        <MenuItem value="other|service">{mapPaymentTypeMedium('other|service')}</MenuItem>
                        <MenuItem value="other|other">{mapPaymentTypeMedium('other|other')}</MenuItem>
                    </TextField>
                    <Box display="flex" alignItems="center" mt={1} mb={1}>
                        <input
                            type="checkbox"
                            id="autopay-checkbox"
                            checked={!!paymentForm.autopay}
                            onChange={e => setPaymentForm(prev => ({ ...prev, autopay: e.target.checked }))}
                            style={{ marginRight: 8 }}
                        />
                        <label htmlFor="autopay-checkbox" style={{ userSelect: 'none', cursor: 'pointer' }}>
                            This payment was made automatically (e.g., Autopay)
                        </label>
                    </Box>
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
