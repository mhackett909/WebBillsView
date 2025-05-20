import { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { getRecycleBin, getBillById, editBill, fetchEntryById, editEntry, getPaymentById, updatePayment } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const RecycleBin = () => {
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [restoreLoadingId, setRestoreLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getRecycleBin(jwt, refresh, (newJwt, newRefresh) => {
      if (typeof setJwt === 'function') setJwt(newJwt);
      if (typeof setRefresh === 'function') setRefresh(newRefresh);
    })
      .then(result => {
        if (isMounted) {
          setData(Array.isArray(result) ? result : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [jwt, refresh, setJwt, setRefresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTokenRefresh = (newJwt, newRefresh) => {
    if (typeof setJwt === 'function') setJwt(newJwt);
    if (typeof setRefresh === 'function') setRefresh(newRefresh);
  };

  const handleRestore = async (item) => {
    setRestoreLoadingId(item.entityId);
    try {
      let result = null;
      if (item.entityType === 'Party') {
        const obj = await getBillById(item.entityId, jwt, refresh, handleTokenRefresh, 'bypass');
        if (!obj) throw new Error('Party not found');
        obj.recycle = false;
        result = await editBill(obj, jwt, refresh, handleTokenRefresh);
      } else if (item.entityType === 'Entry') {
        const obj = await fetchEntryById(item.entityId, jwt, refresh, handleTokenRefresh, 'bypass');
        if (!obj) throw new Error('Entry not found');
        obj.recycle = false;
        // Map flow for editEntry
        if (obj.flow === 'INCOMING') obj.flow = 'income';
        else if (obj.flow === 'OUTGOING') obj.flow = 'expense';
        result = await editEntry(obj, jwt, refresh, handleTokenRefresh, 'bypass');
      } else if (item.entityType === 'Payment') {
        const obj = await getPaymentById(item.entityId, jwt, refresh, handleTokenRefresh);
        if (!obj) throw new Error('Payment not found');
        obj.recycle = false;
        result = await updatePayment(obj, jwt, refresh, handleTokenRefresh, 'bypass');
      }
      if (result && (result.id || result.entryId || result.paymentId)) {
        setSnackbar({ open: true, message: `${item.entityType} restored successfully.`, severity: 'success' });
        // Remove restored item from data
        setData(prev => prev.filter(d => d.entityId !== item.entityId));
      } else {
        throw new Error('Restore failed');
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error restoring item.', severity: 'error' });
    } finally {
      setRestoreLoadingId(null);
    }
  };

  return (
    <Box maxWidth={1000} mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>Recycle Bin</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>Deletion Date</TableCell>
              <TableCell>Party Name</TableCell>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Entry/Payment Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Details</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">No recycled items found.</TableCell>
              </TableRow>
            ) : (
              data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item.entityId}>
                  <TableCell>{item.entityType}</TableCell>
                  <TableCell>{item.recycleDate ? new Date(item.recycleDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{item.partyName || ''}</TableCell>
                  <TableCell>{item.invoiceNumber || ''}</TableCell>
                  <TableCell>{item.entityDate ? new Date(item.entityDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{item.amount != null ? item.amount : ''}</TableCell>
                  <TableCell>{item.type || ''}</TableCell>
                  <TableCell>{item.details || ''}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleRestore(item)}
                      disabled={restoreLoadingId === item.entityId}
                    >
                      {restoreLoadingId === item.entityId ? 'Restoring...' : 'Restore'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecycleBin;