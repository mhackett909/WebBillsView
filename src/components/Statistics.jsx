import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material';
import '../styles/tabs.css';

const currency = (amount) => amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '$0.00';

const dummyEntries = [
    { entryId: 1, id: 1001, name: 'Acme Corp', date: '2024-05-01', flow: 'outbound', amount: 1200, status: false, services: 'Consulting', archived: false, paymentType: 'ACH' },
    { entryId: 2, id: 1002, name: 'Beta LLC', date: '2024-05-03', flow: 'inbound', amount: 2500, status: false, services: 'Web Dev', archived: false, paymentType: 'Wire' },
    { entryId: 3, id: 1003, name: 'Acme Corp', date: '2024-05-05', flow: 'outbound', amount: 800, status: true, services: 'Supplies', archived: false, paymentType: 'Check' },
    { entryId: 4, id: 1004, name: 'Delta Inc', date: '2024-05-07', flow: 'inbound', amount: 1800, status: true, services: 'Design', archived: false, paymentType: 'ACH' },
    { entryId: 5, id: 1005, name: 'Gamma Ltd', date: '2024-05-09', flow: 'outbound', amount: 500, status: false, services: 'Maintenance', archived: false, paymentType: 'ACH' },
    { entryId: 6, id: 1006, name: 'Beta LLC', date: '2024-05-10', flow: 'inbound', amount: 3200, status: false, services: 'Consulting', archived: false, paymentType: 'Wire' },
    { entryId: 7, id: 1007, name: 'Acme Corp', date: '2024-05-12', flow: 'outbound', amount: 950, status: true, services: 'Hardware', archived: false, paymentType: 'Card' },
    { entryId: 8, id: 1008, name: 'Delta Inc', date: '2024-05-13', flow: 'inbound', amount: 2100, status: false, services: 'Support', archived: false, paymentType: 'ACH' },
];

const Statistics = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setEntries(dummyEntries);
            setLoading(false);
        }, 400); // Simulate loading
    }, []);

    // Helper filters
    const outgoing = entries.filter(e => e.flow === 'outbound');
    const incoming = entries.filter(e => e.flow === 'inbound');
    const paid = e => e.status === false;
    const unpaid = e => e.status === true;

    // 1. Total Outgoing Expenses
    const totalOutgoing = outgoing.reduce((sum, e) => sum + (e.amount || 0), 0);
    // 2. Total Incoming Revenue
    const totalIncoming = incoming.reduce((sum, e) => sum + (e.amount || 0), 0);
    // 3. Total Payments Made (Outgoing, paid only)
    const totalPaymentsMade = outgoing.filter(paid).reduce((sum, e) => sum + (e.amount || 0), 0);
    // 4. Total Payments Received (Incoming, paid only)
    const totalPaymentsReceived = incoming.filter(paid).reduce((sum, e) => sum + (e.amount || 0), 0);
    // 5. Maximum Outgoing Payment
    const maxOutgoing = outgoing.length ? Math.max(...outgoing.map(e => e.amount || 0)) : 0;
    // 6. Maximum Incoming Payment
    const maxIncoming = incoming.length ? Math.max(...incoming.map(e => e.amount || 0)) : 0;
    // 7. Total Unpaid Outgoing Expenses
    const unpaidOutgoing = outgoing.filter(unpaid).reduce((sum, e) => sum + (e.amount || 0), 0);
    // 8. Total Unpaid Incoming Revenue
    const unpaidIncoming = incoming.filter(unpaid).reduce((sum, e) => sum + (e.amount || 0), 0);
    // 9. Number of Outgoing Entries by party (Top 5)
    const outgoingByParty = Object.entries(
        outgoing.reduce((acc, e) => { acc[e.name] = (acc[e.name] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // 10. Number of Incoming Entries by party (Top 5)
    const incomingByParty = Object.entries(
        incoming.reduce((acc, e) => { acc[e.name] = (acc[e.name] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // 11. Total Payments by Type (Outgoing, paid only)
    const outgoingByType = Object.entries(
        outgoing.filter(paid).reduce((acc, e) => { acc[e.paymentType] = (acc[e.paymentType] || 0) + (e.amount || 0); return acc; }, {})
    );
    // 12. Total Payments by Type (Incoming, paid only)
    const incomingByType = Object.entries(
        incoming.filter(paid).reduce((acc, e) => { acc[e.paymentType] = (acc[e.paymentType] || 0) + (e.amount || 0); return acc; }, {})
    );
    // 13. Average Payment Amount (Outgoing)
    const avgOutgoing = outgoing.length ? totalOutgoing / outgoing.length : 0;
    // 14. Average Payment Amount (Incoming)
    const avgIncoming = incoming.length ? totalIncoming / incoming.length : 0;

    if (loading) {
        return (
            <Box className="tabs-container" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="tabs-container" sx={{ overflowY: 'auto', padding: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#333' }}>Statistics</Typography>
            <Grid container spacing={2}>
                {/* Main Stat Cards */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography variant="subtitle2">Total Outgoing Expenses</Typography>
                            <Typography variant="h6">{currency(totalOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="subtitle2">Total Incoming Revenue</Typography>
                            <Typography variant="h6">{currency(totalIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ bgcolor: '#fffde7' }}>
                        <CardContent>
                            <Typography variant="subtitle2">Total Payments Made (Outgoing)</Typography>
                            <Typography variant="h6">{currency(totalPaymentsMade)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ bgcolor: '#fce4ec' }}>
                        <CardContent>
                            <Typography variant="subtitle2">Total Payments Received (Incoming)</Typography>
                            <Typography variant="h6">{currency(totalPaymentsReceived)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Max/Unpaid/Average Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Maximum Outgoing Expense</Typography>
                            <Typography variant="h6">{currency(maxOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Maximum Incoming Revenue</Typography>
                            <Typography variant="h6">{currency(maxIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Average Outgoing Payment</Typography>
                            <Typography variant="h6">{currency(avgOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Average Incoming Payment</Typography>
                            <Typography variant="h6">{currency(avgIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Total Unpaid Outgoing Expenses</Typography>
                            <Typography variant="h6">{currency(unpaidOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Total Unpaid Incoming Revenue</Typography>
                            <Typography variant="h6">{currency(unpaidIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            {/* Top 5 Parties */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Top 5 Outgoing Entries by Party</Typography>
                            {outgoingByParty.length === 0 ? <Typography>No data</Typography> : (
                                outgoingByParty.map(([party, count]) => (
                                    <Typography key={party}>{party}: {count}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Top 5 Incoming Entries by Party</Typography>
                            {incomingByParty.length === 0 ? <Typography>No data</Typography> : (
                                incomingByParty.map(([party, count]) => (
                                    <Typography key={party}>{party}: {count}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            {/* Payments by Type */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Total Payments by Type (Outgoing)</Typography>
                            {outgoingByType.length === 0 ? <Typography>No data</Typography> : (
                                outgoingByType.map(([type, amt]) => (
                                    <Typography key={type}>{type}: {currency(amt)}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2">Total Payments by Type (Incoming)</Typography>
                            {incomingByType.length === 0 ? <Typography>No data</Typography> : (
                                incomingByType.map(([type, amt]) => (
                                    <Typography key={type}>{type}: {currency(amt)}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Statistics;