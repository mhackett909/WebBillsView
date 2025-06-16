import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { mapPaymentTypeMedium } from '../utils/Mappers';
import '../styles/tabs.css';

const Statistics = ({ stats, renderInsights= true }) => {
    const s = stats || {};
    const loading = stats === null;

    // Helper for currency formatting
    const currency = (amount) => {
        if (amount === null || amount === undefined) return '$0.00';
        if (typeof amount === 'object' && amount.hasOwnProperty('toLocaleString')) {
            return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
        return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const top5 = (obj) => obj ? Object.entries(obj).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 5) : [];

    if (loading) {
        return (
            <Box className="tabs-container" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="tabs-container" sx={{ overflowY: 'auto' }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ bgcolor: '#f4fbf6', borderRadius: 2, p: 2, boxShadow: 2 }}>
                        {/* Income Breakdown */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#e8f5e9', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                            Income Breakdown
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 700 }}>Total Income</Typography>
                                        <Typography variant="h6">{currency(s.totalIncomeAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Received</Typography>
                                        <Typography variant="h6" sx={{ color: 'success.main' }}>
                                            {(s.totalIncomeOverpaid && s.totalIncomeOverpaid > 0) ? (
                                                <>
                                                    <span style={{ color: '#111' }}>{currency(s.totalReceivedPaymentAmount)}</span>{' '}
                                                    <span style={{ color: '#0288d1', fontWeight: 500 }}>{`(+${currency(s.totalIncomeOverpaid)})`}</span>
                                                  </>
                                            ) : (
                                                currency(s.totalReceivedPaymentAmount)
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff' }}>Outstanding</Typography>
                                        <Typography variant="h6" sx={{ color: '#111' }}>{s.totalIncomeOutstanding > 0 ? `-${currency(s.totalIncomeOutstanding)}` : currency(s.totalIncomeOutstanding)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 700 }}>Avg Payment Received</Typography>
                                        <Typography variant="h6">{currency(s.avgReceivedPaymentAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 700 }}>Max Payment Received</Typography>
                                        <Typography variant="h6">{currency(s.maxReceivedPaymentAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ bgcolor: '#f4f8fd', borderRadius: 2, p: 2, boxShadow: 2 }}>
                        {/* Expenses Breakdown */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#e3f2fd', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                            Expenses Breakdown
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ color: '#ed6c02', fontWeight: 700 }}>Total Expenses</Typography>
                                        <Typography variant="h6">{currency(s.totalExpenseAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Paid</Typography>
                                        <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                            {(s.totalExpenseOverpaid && s.totalExpenseOverpaid > 0) ? (
                                                <>
                                                    <span style={{ color: '#111' }}>{currency(s.totalSentPaymentAmount)}</span>{' '}
                                                    <span style={{ color: '#ed6c02', fontWeight: 500 }}>{`(+${currency(s.totalExpenseOverpaid)})`}</span>
                                                </>
                                            ) : (
                                                currency(s.totalSentPaymentAmount)
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>Balance</Typography>
                                        <Typography variant="h6">{s.totalExpenseUnpaid > 0 ? `-${currency(s.totalExpenseUnpaid)}` : currency(s.totalExpenseUnpaid)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 700 }}>Avg Payment Made</Typography>
                                        <Typography variant="h6">{currency(s.avgSentPaymentAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 700 }}>Max Payment Made</Typography>
                                        <Typography variant="h6">{currency(s.maxSentPaymentAmount)}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            {/* Top Payment Insights */}
            {renderInsights && (
                <Box sx={{ bgcolor: '#f7f3fa', borderRadius: 2, p: 2, boxShadow: 2, mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1, bgcolor: '#ede7f6', borderRadius: 1, py: 0.5, boxShadow: 1 }}>
                        Top Payment Insights
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Top 5 Income Sources</Typography>
                                    {top5(s.topIncomeSources).length > 0 ? (
                                        top5(s.topIncomeSources).map(([party, amt]) => (
                                            <Typography key={party}>
                                                <span style={{ color: '#111' }}>{party}</span>: <span style={{ color: '#0288d1', fontWeight: 500 }}>{currency(amt)}</span>
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">No data available</Typography>
                                    )}
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ mt: 2 }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>Top 5 Income by Type</Typography>
                                    {top5(s.topIncomeTypes).length > 0 ? (
                                        top5(s.topIncomeTypes).map(([type, amt]) => (
                                            <Typography key={type}>
                                                <span style={{ color: '#111' }}>{mapPaymentTypeMedium(type)}</span>: <span style={{ color: '#0288d1', fontWeight: 500 }}>{currency(amt)}</span>
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">No data available</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Top 5 Expense Recipients</Typography>
                                    {top5(s.topExpenseRecipients).length > 0 ? (
                                        top5(s.topExpenseRecipients).map(([party, amt]) => (
                                            <Typography key={party}>
                                                <span style={{ color: '#111' }}>{party}</span>: <span style={{ color: '#ed6c02', fontWeight: 500 }}>{currency(amt)}</span>
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">No data available</Typography>
                                    )}
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ mt: 2 }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>Top 5 Expenses by Type</Typography>
                                    {top5(s.topExpenseTypes).length > 0 ? (
                                        top5(s.topExpenseTypes).map(([type, amt]) => (
                                            <Typography key={type}>
                                                <span style={{ color: '#111' }}>{mapPaymentTypeMedium(type)}</span>: <span style={{ color: '#ed6c02', fontWeight: 500 }}>{currency(amt)}</span>
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">No data available</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default Statistics;