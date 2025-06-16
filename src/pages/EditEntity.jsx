import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getBillById, editBill } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const STATUS_INACTIVE = 0;
const STATUS_ACTIVE = 1;

const EditEntity = () => {
  const { id } = useParams();
  const location = useLocation();
  const invoiceId = location.state?.invoiceId;
  const entityId = location.state?.entityId;
  const navigate = useNavigate();
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const [editName, setEditName] = useState('');
  const [archived, setArchived] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [archiveWarningOpen, setArchiveWarningOpen] = useState(false);

  const handleTokenRefresh = useCallback((newJwt, newRefresh) => {
    if (typeof setJwt === 'function') setJwt(newJwt);
    if (typeof setRefresh === 'function') setRefresh(newRefresh);
  }, [setJwt, setRefresh]);

  useEffect(() => {
    const fetchBill = async () => {
      setLoading(true);
      try {
        const data = await getBillById(id, jwt, refresh, handleTokenRefresh);
        if (data) {
          setBill(data);
          setEditName(data.name || '');
          setArchived(!data.status);
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load entity.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id, jwt, refresh, handleTokenRefresh]);

  const handleSave = async () => {
    if (!editName.trim()) {
      setSnackbar({ open: true, message: 'Entity name cannot be empty.', severity: 'error' });
      return;
    }
    await doSave();
  };

  const doSave = async () => {
    setLoading(true);
    try {
      const updatedBill = {
        ...bill,
        name: editName.trim(),
        status: archived ? STATUS_INACTIVE : STATUS_ACTIVE,
      };
      const result = await editBill(updatedBill, jwt, refresh, handleTokenRefresh);
      if (result && result.id) {
        setSnackbar({ open: true, message: 'Entity updated successfully.', severity: 'success' });
        setBill(result);
        if (archived) {
          setTimeout(() => navigate('/home'), 1200);
        } else {
          setTimeout(() => handleBack(), 1200);
        }
      } else {
        setSnackbar({ open: true, message: 'Failed to update entity.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating entity.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (entityId) {
      navigate(`/entities/${entityId}`);
    } else if (invoiceId) {
      navigate(`/invoice/${invoiceId}`);
    } else {
      navigate('/invoice');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }
  if (!bill) {
    return (
      <Box maxWidth={500} mx="auto" mt={4}>
        <Alert severity="error">Entity not found.</Alert>
      </Box>
    );
  }

  const billEnabled = !!bill.status;

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      {/* Read-only banner if bill is archived */}
      {!billEnabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This entity is <strong>read only</strong> because it is archived.<br />
          To restore editing, use the <strong>Archives</strong> feature from the <strong>History</strong> dropdown in the toolbar.
        </Alert>
      )}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Edit Entity</Typography>
        <TextField
          label="Entity Name"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={!billEnabled}
        />
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth disabled={!billEnabled}>Save</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => { setArchived(true); setArchiveWarningOpen(true); }}
            fullWidth
            disabled={!billEnabled || archived}
          >
            Archive
          </Button>
        </Box>
      </Paper>
      <Dialog open={archiveWarningOpen} onClose={() => { setArchiveWarningOpen(false); setArchived(false); }}>
        <DialogTitle>Archive Entity?</DialogTitle>
        <DialogContent>
          <Typography>
            Archiving this entity will make all its invoices <strong>read-only</strong>. You can reactivate them anytime from the <strong>Archives</strong> tool in the <strong>History</strong> menu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setArchiveWarningOpen(false); setArchived(false); }}>Cancel</Button>
          <Button onClick={() => { setArchiveWarningOpen(false); doSave(); }} color="warning" variant="contained">Archive</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditEntity;
