import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button, Paper, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getBillById, editBill } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const STATUS_INACTIVE = 0;
const STATUS_ACTIVE = 1;

const Entity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const [editName, setEditName] = useState('');
  const [archived, setArchived] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    if (archived && bill && bill.status !== STATUS_INACTIVE) {
      setArchiveWarningOpen(true);
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
        setTimeout(() => navigate('/home'), 1200);
      } else {
        setSnackbar({ open: true, message: 'Failed to update entity.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating entity.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    setLoading(true);
    try {
      const result = await editBill({ ...bill, recycle: true }, jwt, refresh, handleTokenRefresh);
      if (result && result.id) {
        setSnackbar({ open: true, message: 'Entity deleted (recycled) successfully.', severity: 'success' });
        setTimeout(() => navigate('/home'), 1200);
      } else {
        setSnackbar({ open: true, message: 'Failed to delete entity.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting entity.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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
        <FormControlLabel
          control={<Checkbox checked={archived} onChange={e => setArchived(e.target.checked)} disabled={!billEnabled} />}
          label="Archived"
          sx={{ mb: 2 }}
        />
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth disabled={!billEnabled}>Save</Button>
          <Button variant="outlined" color="error" onClick={handleDelete} fullWidth disabled={!billEnabled}>Delete</Button>
        </Box>
      </Paper>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Entity and Entries?</DialogTitle>
        <DialogContent>
          <Typography>
            Deleting this entity will also <strong>delete all</strong> its entries. You will have <strong>14 days</strong> to restore them from the <strong>Recycle Bin</strong> in the <strong>History</strong> menu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={archiveWarningOpen} onClose={() => setArchiveWarningOpen(false)}>
        <DialogTitle>Archive Entity?</DialogTitle>
        <DialogContent>
          <Typography>
            Archiving this entity will make all its entries <strong>read-only</strong>. You can reactivate them anytime from the <strong>Archives</strong> tool in the <strong>History</strong> menu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveWarningOpen(false)}>Cancel</Button>
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

export default Entity;
