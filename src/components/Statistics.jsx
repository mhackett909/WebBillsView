import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
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
    { entryId: 9, id: 1009, name: 'Omega Inc', date: '2024-05-15', flow: 'outbound', amount: 650, status: false, services: 'Consulting', archived: false, paymentType: 'Credit' },
    { entryId: 10, id: 1010, name: 'Zeta Group', date: '2024-05-16', flow: 'inbound', amount: 1800, status: false, services: 'Consulting', archived: false, paymentType: 'Wire' }, // Added dummy incoming entry for top 5 incoming by party
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
        <Box className="tabs-container" sx={{ overflowY: 'auto' }}>
            {/* Removed the old 'Statistics' label at the top */}
            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#bbdefb', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Totals Overview
            </Typography>
            {/* Totals Row */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Total Outgoing</Typography>
                            <Typography variant="h6">{currency(totalOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Total Incoming</Typography>
                            <Typography variant="h6">{currency(totalIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 700 }}>Payments Made</Typography>
                            <Typography variant="h6">{currency(totalPaymentsMade)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700 }}>Payments Received</Typography>
                            <Typography variant="h6">{currency(totalPaymentsReceived)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grouped Section: Averages & Maximums */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#ede7f6', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Averages & Maximums
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Avg Outgoing</Typography>
                            <Typography variant="h6">{currency(avgOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Avg Incoming</Typography>
                            <Typography variant="h6">{currency(avgIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Max Outgoing</Typography>
                            <Typography variant="h6">{currency(maxOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Max Incoming</Typography>
                            <Typography variant="h6">{currency(maxIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grouped Section: Unpaid */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#ffe0b2', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Unpaid
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>Unpaid Outgoing</Typography>
                            <Typography variant="h6">{currency(unpaidOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>Unpaid Incoming</Typography>
                            <Typography variant="h6">{currency(unpaidIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Payment Insights */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#b3e5fc', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Top Payment Insights
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Top 5 Outgoing by Party</Typography>
                            {outgoingByParty.length === 0 ? <Typography>No data</Typography> : (
                                outgoingByParty.map(([party, count]) => (
                                    <Typography key={party}>{party}: {count}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 700 }}>Payments by Type (Outgoing)</Typography>
                            {outgoingByType.length === 0 ? <Typography>No data</Typography> : (
                                outgoingByType.map(([type, amt]) => (
                                    <Typography key={type}>{type}: {currency(amt)}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Top 5 Incoming by Party</Typography>
                            {incomingByParty.length === 0 ? <Typography>No data</Typography> : (
                                incomingByParty.map(([party, count]) => (
                                    <Typography key={party}>{party}: {count}</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700 }}>Payments by Type (Incoming)</Typography>
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