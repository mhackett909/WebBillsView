import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { useState } from 'react';

const dummyData = [
  {
    id: 1,
    entity: 'Party',
    deletionDate: '2025-05-10',
    partyName: 'Acme Corp',
    invoiceNumber: '',
    entryOrPaymentDate: '',
    amount: '',
    type: '',
    details: 'Party deleted by user',
  },
  {
    id: 2,
    entity: 'Entry',
    deletionDate: '2025-05-12',
    partyName: 'Acme Corp',
    invoiceNumber: 'INV-1001',
    entryOrPaymentDate: '2025-05-01',
    amount: '1200.00',
    type: 'Invoice',
    details: 'Invoice for May',
  },
  {
    id: 3,
    entity: 'Payment',
    deletionDate: '2025-05-13',
    partyName: 'Beta LLC',
    invoiceNumber: 'INV-1002',
    entryOrPaymentDate: '2025-05-05',
    amount: '500.00',
    type: 'Credit Card',
    details: 'Partial payment',
  },
];

const RecycleBin = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            {dummyData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">No recycled items found.</TableCell>
              </TableRow>
            ) : (
              dummyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.entity}</TableCell>
                  <TableCell>{item.deletionDate}</TableCell>
                  <TableCell>{item.partyName}</TableCell>
                  <TableCell>{item.invoiceNumber}</TableCell>
                  <TableCell>{item.entryOrPaymentDate}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.details}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" color="primary" size="small">Restore</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={dummyData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default RecycleBin;