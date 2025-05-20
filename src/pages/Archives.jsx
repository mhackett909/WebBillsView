import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { getBills, editBill } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const Archives = () => {
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [archivedBills, setArchivedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleTokenRefresh = useCallback((newJwt, newRefresh) => {
    if (typeof setJwt === 'function') setJwt(newJwt);
    if (typeof setRefresh === 'function') setRefresh(newRefresh);
  }, [setJwt, setRefresh]);

  const fetchArchivedBills = async () => {
    setLoading(true);
    try {
      const bills = await getBills(jwt, refresh, handleTokenRefresh);
      setArchivedBills(Array.isArray(bills) ? bills.filter(b => !b.status) : []);
    } catch (err) {
      setArchivedBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedBills();
    // eslint-disable-next-line
  }, [jwt, refresh, handleTokenRefresh]);

  const handleRestore = async (bill) => {
    try {
      const result = await editBill({ ...bill, status: 1 }, jwt, refresh, handleTokenRefresh);
      if (result && result.id) {
        setSnackbar({ open: true, message: 'Party restored successfully.', severity: 'success' });
        fetchArchivedBills();
      } else {
        setSnackbar({ open: true, message: 'Failed to restore party.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error restoring party.', severity: 'error' });
    }
  };

  const handleDelete = (bill) => {
    setDeleteTarget(bill);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteDialogOpen(false);
    try {
      const result = await editBill({ ...deleteTarget, recycle: true }, jwt, refresh, handleTokenRefresh);
      if (result && (result.id || result === true)) {
        setSnackbar({ open: true, message: 'Party recycled successfully.', severity: 'success' });
        fetchArchivedBills();
      } else {
        setSnackbar({ open: true, message: 'Failed to delete party.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting party.', severity: 'error' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <Typography variant="h6" color="text.secondary">Loading...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h4" mb={3}>Archived Parties</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ display: 'none' }}>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {archivedBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No archived parties found.</TableCell>
                  </TableRow>
                ) : (
                  archivedBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell style={{ display: 'none' }}>{bill.id}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.name}</TableCell>
                      <TableCell align="right">
                        <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }} onClick={() => handleRestore(bill)}>Restore</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(bill)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={archivedBills.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Party Permanently?</DialogTitle>
        <DialogContent>
          <Typography>
            Deleting this party will also <strong>delete all</strong> its entries. You will have <strong>14 days</strong> to restore them from the <strong>Recycle Bin</strong> in the <strong>History</strong> menu.
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

export default Archives;