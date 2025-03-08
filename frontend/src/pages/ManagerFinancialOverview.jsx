import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Button,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    ShowChart,
    Download as DownloadIcon,
    AccountBalance,
    Receipt,
} from '@mui/icons-material';

const FinancialOverview = () => {
    const financialData = {
        totalRevenue: 250000,
        monthlyRevenue: 25000,
        expenses: 15000,
        profit: 10000,
        recentTransactions: [
            { id: 1, date: '2024-01-15', description: 'Product Sales', amount: 5000, type: 'income' },
            { id: 2, date: '2024-01-14', description: 'Employee Salaries', amount: 8000, type: 'expense' },
            { id: 3, date: '2024-01-13', description: 'Online Orders', amount: 3000, type: 'income' },
            { id: 4, date: '2024-01-12', description: 'Utilities', amount: 1000, type: 'expense' },
        ],
    };

    const StatCard = ({ title, value, icon, trend, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        {title}
                    </Typography>
                    {icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    ${value.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {trend > 0 ? (
                        <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                        <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                    )}
                    <Typography
                        variant="body2"
                        color={trend > 0 ? 'success.main' : 'error.main'}
                    >
                        {Math.abs(trend)}% from last month
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Financial Overview</Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => alert('Downloading report...')}
                >
                    Download Report
                </Button>
            </Box>

            {/* Financial Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={financialData.totalRevenue}
                        icon={<AttachMoney sx={{ color: 'primary.main' }} />}
                        trend={12}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Monthly Revenue"
                        value={financialData.monthlyRevenue}
                        icon={<ShowChart sx={{ color: 'success.main' }} />}
                        trend={8}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Expenses"
                        value={financialData.expenses}
                        icon={<AccountBalance sx={{ color: 'error.main' }} />}
                        trend={-5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Net Profit"
                        value={financialData.profit}
                        icon={<Receipt sx={{ color: 'info.main' }} />}
                        trend={15}
                    />
                </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {financialData.recentTransactions.map((transaction) => (
                                <TableRow
                                    key={transaction.id}
                                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                                >
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                                        >
                                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            ${transaction.amount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default FinancialOverview;