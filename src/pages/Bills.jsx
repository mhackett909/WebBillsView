import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button, Paper, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getBillById } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const Bills = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const [editName, setEditName] = useState('');
  const [archived, setArchived] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
          console.log('Fetched bill:', data);
          setEditName(data.name || '');
          setArchived(!data.status);
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load party.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id, jwt, refresh, handleTokenRefresh]);

  const handleSave = () => {
    // Dummy save, just route home
    navigate('/home');
  };
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    navigate('/home');
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
        <Alert severity="error">Party not found.</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Edit Party</Typography>
        <TextField
          label="Party Name"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox checked={archived} onChange={e => setArchived(e.target.checked)} />}
          label="Archived"
          sx={{ mb: 2 }}
        />
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth>Save</Button>
          <Button variant="outlined" color="error" onClick={handleDelete} fullWidth>Delete</Button>
        </Box>
      </Paper>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Party?</DialogTitle>
        <DialogContent>
          <Typography>
            Deleting this party will also delete all its entries. You will have 14 days to restore them from the recycle bin.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
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

export default Bills;
