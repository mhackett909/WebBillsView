import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { AuthContext } from '../App';
import { getBillById, getStats, fetchEntries } from '../utils/BillsApiUtil';
import Statistics from '../components/Statistics';
import DataTable from '../components/DataTable';

const columns = [
  { field: 'invoiceId', headerName: 'Invoice #', width: 100 },
  { field: 'entryId', headerName: 'Entry ID', width: 100 },
  { field: 'billId', headerName: 'Bill ID', width: 100 },
  { field: 'name', headerName: 'Entity', width: 250 },
  { field: 'date', headerName: 'Date', width: 150 },
  { field: 'flow', headerName: 'Flow', width: 150 },
  { field: 'amount', headerName: 'Amount', width: 130 },
  { field: 'status', headerName: 'Paid', width: 100 },
  { field: 'balance', headerName: 'Balance', width: 130 },
  { field: 'services', headerName: 'Description', width: 470 },
  { field: 'archived', headerName: 'Archived', width: 100 },
];

// Columns to hide in the DataTable
const hiddenColumns = {
  entryId: false,
  billId: false,
  name: false,
};

const Entity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [bill, setBill] = useState(null);
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleTokenRefresh = useCallback((newJwt, newRefresh) => {
    if (typeof setJwt === 'function') setJwt(newJwt);
    if (typeof setRefresh === 'function') setRefresh(newRefresh);
  }, [setJwt, setRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const billData = await getBillById(id, jwt, refresh, handleTokenRefresh);
        if (!billData) throw new Error('Entity not found');
        setBill(billData);
        // Use bill name for partyList filter
        const partyList = billData.name ? [billData.name] : [];
        // Fetch stats and entries
        const statsData = await getStats(jwt, refresh, handleTokenRefresh, { partyList });
        setStats(statsData);
        const entriesData = await fetchEntries(jwt, refresh, handleTokenRefresh, { partyList });
        setEntries(entriesData.entries || []);
      } catch (err) {
        setError(err.message || 'Failed to load entity data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, jwt, refresh, handleTokenRefresh]);

  // Bill enabled status (active = true, archived = false)
  const billEnabled = !!bill?.status;

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4">
              Entity: {bill?.name}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              disabled={!billEnabled}
              onClick={() => {
                if (bill?.id) {
                  navigate(`/bills/${bill.id}`, { state: { entityId: bill.id } });
                }
              }}
            >
              Edit Entity
            </Button>
          </Box>
          {!billEnabled && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              This entity is <strong>read only</strong> because it is archived.<br />
              To restore editing, use the <strong>Archives</strong> feature from the <strong>History</strong> dropdown in the toolbar.
            </Alert>
          )}
          <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
            <Typography variant="h6" mb={2} align="center">Invoices</Typography>
            <Alert severity="info" sx={{ mb: 2, textAlign: 'center' }}>
              To add a new invoice, please use the main page.
            </Alert>
            <DataTable
              rows={entries}
              columns={columns}
              columnVisibilityModel={hiddenColumns}
              setColumnVisibilityModel={() => {}}
              handleAdd={null}
              pagination={false}
              paginationMode="client"
              page={0}
              onPageChange={() => {}}
              pageSize={entries.length}
              onPageSizeChange={() => {}}
              rowCount={entries.length}
              sortingMode="client"
              sortModel={[]}
              sortingOrder={['asc', 'desc']}
              onSortModelChange={() => {}}
              showGoToPage={false}
              fixedHeight={false}
            />
          </Paper>
          <Paper sx={{ p: 3, mt: 4 }} elevation={3}>
            <Typography variant="h6" mb={2} align="center">Statistics</Typography>
            <Statistics stats={stats} renderInsights={false} />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Entity;
