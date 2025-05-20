import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import '../styles/tabs.css';

const currency = (amount) => amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '$0.00';

const dummyEntries = [
    // Outbound (Expenses)
    { entryId: 1, id: 1001, name: 'Acme Corp', date: '2024-05-01', flow: 'outbound', amount: 1200, status: false, services: 'Consulting', archived: false, paymentType: 'ACH' },
    { entryId: 2, id: 1002, name: 'Beta LLC', date: '2024-05-03', flow: 'outbound', amount: 900, status: true, services: 'Supplies', archived: false, paymentType: 'Wire' }, // unpaid expense
    { entryId: 3, id: 1003, name: 'Gamma Ltd', date: '2024-05-05', flow: 'outbound', amount: 800, status: false, services: 'Maintenance', archived: false, paymentType: 'Check' },
    { entryId: 4, id: 1004, name: 'Delta Inc', date: '2024-05-07', flow: 'outbound', amount: 1500, status: true, services: 'Hardware', archived: false, paymentType: 'Card' }, // unpaid expense
    { entryId: 5, id: 1005, name: 'Omega Inc', date: '2024-05-09', flow: 'outbound', amount: 1100, status: false, services: 'Consulting', archived: false, paymentType: 'Credit' },
    { entryId: 6, id: 1006, name: 'Sigma LLC', date: '2024-05-10', flow: 'outbound', amount: 950, status: false, services: 'Supplies', archived: false, paymentType: 'ACH' },
    { entryId: 7, id: 1007, name: 'Theta Group', date: '2024-05-12', flow: 'outbound', amount: 700, status: false, services: 'Maintenance', archived: false, paymentType: 'Wire' },
    { entryId: 8, id: 1008, name: 'Lambda Inc', date: '2024-05-13', flow: 'outbound', amount: 600, status: false, services: 'Hardware', archived: false, paymentType: 'Check' },
    { entryId: 9, id: 1009, name: 'Zeta Group', date: '2024-05-15', flow: 'outbound', amount: 1300, status: false, services: 'Consulting', archived: false, paymentType: 'Card' },
    { entryId: 10, id: 1010, name: 'Epsilon Ltd', date: '2024-05-16', flow: 'outbound', amount: 1050, status: false, services: 'Supplies', archived: false, paymentType: 'Credit' },
    // Inbound (Income)
    { entryId: 11, id: 1011, name: 'Client A', date: '2024-05-17', flow: 'inbound', amount: 2500, status: false, services: 'Web Dev', archived: false, paymentType: 'Wire' },
    { entryId: 12, id: 1012, name: 'Client B', date: '2024-05-18', flow: 'inbound', amount: 1800, status: true, services: 'Design', archived: false, paymentType: 'ACH' }, // income outstanding
    { entryId: 13, id: 1013, name: 'Client C', date: '2024-05-19', flow: 'inbound', amount: 3200, status: false, services: 'Consulting', archived: false, paymentType: 'Wire' },
    { entryId: 14, id: 1014, name: 'Client D', date: '2024-05-20', flow: 'inbound', amount: 2100, status: true, services: 'Support', archived: false, paymentType: 'ACH' }, // income outstanding
    { entryId: 15, id: 1015, name: 'Client E', date: '2024-05-21', flow: 'inbound', amount: 1800, status: false, services: 'Consulting', archived: false, paymentType: 'Wire' },
    { entryId: 16, id: 1016, name: 'Client F', date: '2024-05-22', flow: 'inbound', amount: 2700, status: false, services: 'Design', archived: false, paymentType: 'ACH' },
    { entryId: 17, id: 1017, name: 'Client G', date: '2024-05-23', flow: 'inbound', amount: 1950, status: false, services: 'Web Dev', archived: false, paymentType: 'Wire' },
    { entryId: 18, id: 1018, name: 'Client H', date: '2024-05-24', flow: 'inbound', amount: 2200, status: false, services: 'Support', archived: false, paymentType: 'ACH' },
    { entryId: 19, id: 1019, name: 'Client I', date: '2024-05-25', flow: 'inbound', amount: 1600, status: false, services: 'Consulting', archived: false, paymentType: 'Wire' },
    { entryId: 20, id: 1020, name: 'Client J', date: '2024-05-26', flow: 'inbound', amount: 2000, status: false, services: 'Design', archived: false, paymentType: 'ACH' },
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
    // 9. Top 5 Expenses Paid by party (sum of paid outgoing by party)
    const topExpensesPaidByParty = Object.entries(
        outgoing.filter(paid).reduce((acc, e) => {
            acc[e.name] = (acc[e.name] || 0) + (e.amount || 0);
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // 10. Top 5 Incomes Received by party (sum of paid incoming by party)
    const topIncomesReceivedByParty = Object.entries(
        incoming.filter(paid).reduce((acc, e) => {
            acc[e.name] = (acc[e.name] || 0) + (e.amount || 0);
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // 11. Total Payments by Type (Outgoing, paid only)
    const outgoingByType = Object.entries(
        outgoing.filter(paid).reduce((acc, e) => { acc[e.paymentType] = (acc[e.paymentType] || 0) + (e.amount || 0); return acc; }, {})
    );
    // 12. Total Payments by Type (Incoming, paid only)
    const incomingByType = Object.entries(
        incoming.filter(paid).reduce((acc, e) => { acc[e.paymentType] = (acc[e.paymentType] || 0) + (e.amount || 0); return acc; }, {})
    );
    // 13. Average Payment Amount (Outgoing, paid only)
    const paidOutgoing = outgoing.filter(paid);
    const avgPaidOutgoing = paidOutgoing.length ? paidOutgoing.reduce((sum, e) => sum + (e.amount || 0), 0) / paidOutgoing.length : 0;
    const maxPaidOutgoing = paidOutgoing.length ? Math.max(...paidOutgoing.map(e => e.amount || 0)) : 0;
    // 14. Average Payment Amount (Incoming, paid only)
    const paidIncoming = incoming.filter(paid);
    const avgPaidIncoming = paidIncoming.length ? paidIncoming.reduce((sum, e) => sum + (e.amount || 0), 0) / paidIncoming.length : 0;
    const maxPaidIncoming = paidIncoming.length ? Math.max(...paidIncoming.map(e => e.amount || 0)) : 0;

    // Top 5 Expenses by Type (paid only)
    const topExpensesByType = outgoingByType
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    // Top 5 Income by Type (paid only)
    const topIncomeByType = incomingByType
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

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
            {/* Totals Overview section and its payment cards removed for clarity */}

            {/* Grouped Section: Income Breakdown */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#e8f5e9', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Income Breakdown
            </Typography>
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Income Received</Typography>
                            <Typography variant="h6">{currency(totalPaymentsReceived)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 700 }}>Income Outstanding</Typography>
                            <Typography variant="h6">{currency(unpaidIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 700 }}>Total Income</Typography>
                            <Typography variant="h6">{currency(totalIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 700 }}>Avg Payment Received</Typography>
                            <Typography variant="h6">{currency(avgPaidIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 700 }}>Max Payment Received</Typography>
                            <Typography variant="h6">{currency(maxPaidIncoming)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Grouped Section: Expenses Breakdown */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#e3f2fd', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Expenses Breakdown
            </Typography>
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Paid Expenses</Typography>
                            <Typography variant="h6">{currency(totalPaymentsMade)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>Unpaid Expenses</Typography>
                            <Typography variant="h6">{currency(unpaidOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 700 }}>Total Expenses</Typography>
                            <Typography variant="h6">{currency(totalOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 700 }}>Avg Payment Made</Typography>
                            <Typography variant="h6">{currency(avgPaidOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 700 }}>Max Payment Made</Typography>
                            <Typography variant="h6">{currency(maxPaidOutgoing)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Top Payment Insights */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#ede7f6', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                Top Payment Insights
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Top 5 Expense Recipients</Typography>
                            {(topExpensesPaidByParty && topExpensesPaidByParty.length > 0) ? (
                                topExpensesPaidByParty.map(([party, amt]) => (
                                    <Typography key={party}>{party}: {currency(amt)}</Typography>
                                ))
                            ) : (
                                [1,2,3,4,5].map(i => (
                                    <Typography key={i}>Vendor {i}: $1,000.00</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Top 5 Expenses by Type</Typography>
                            {(topExpensesByType && topExpensesByType.length > 0) ? (
                                topExpensesByType.map(([type, amt]) => (
                                    <Typography key={type}>{type}: {currency(amt)}</Typography>
                                ))
                            ) : (
                                [1,2,3,4,5].map(i => (
                                    <Typography key={i}>Type {i}: $500.00</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Top 5 Income Sources</Typography>
                            {(topIncomesReceivedByParty && topIncomesReceivedByParty.length > 0) ? (
                                topIncomesReceivedByParty.map(([party, amt]) => (
                                    <Typography key={party}>{party}: {currency(amt)}</Typography>
                                ))
                            ) : (
                                [1,2,3,4,5].map(i => (
                                    <Typography key={i}>Client {i}: $2,000.00</Typography>
                                ))
                            )}
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Top 5 Income by Type</Typography>
                            {(topIncomeByType && topIncomeByType.length > 0) ? (
                                topIncomeByType.map(([type, amt]) => (
                                    <Typography key={type}>{type}: {currency(amt)}</Typography>
                                ))
                            ) : (
                                [1,2,3,4,5].map(i => (
                                    <Typography key={i}>Type {i}: $1,200.00</Typography>
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