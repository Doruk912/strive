import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Tabs,
    Tab,
    Divider,
    IconButton,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    ShowChart,
    Download as DownloadIcon,
    Receipt,
    CalendarToday,
    BarChart,
    DateRange,
    Refresh,
    Info,
} from '@mui/icons-material';
import financialService from '../services/financialService';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend);

const FinancialOverview = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        dailyRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        recentMetrics: [],
        recentTransactions: [],
        revenueGrowthRate: 0,
        orderGrowthRate: 0,
    });
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await financialService.getFinancialOverview();
            setFinancialData(data);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError('Failed to load financial data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleDownloadReport = () => {
        // Generate CSV data
        const metrics = financialData.recentMetrics;
        const rows = metrics.map(metric => 
            `${metric.date},${metric.dailyRevenue},${metric.ordersCount},${metric.averageOrderValue}`
        );
        
        const csvContent = [
            "Date,Revenue,Orders,Average Order Value",
            ...rows
        ].join("\n");
        
        // Create the download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial_report_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const StatCard = ({ title, value, icon, trend, color, subtitle }) => (
        <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        {title}
                    </Typography>
                    {icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        {trend > 0 ? (
                            <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                        ) : trend < 0 ? (
                            <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                        ) : (
                            <TrendingUp sx={{ color: 'text.secondary', mr: 1 }} />
                        )}
                        <Typography
                            variant="body2"
                            color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
                        >
                            {Math.abs(trend)}% from last month
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const RevenueChart = () => {
        const chartData = {
            labels: financialData.recentMetrics.map(metric => new Date(metric.date).toLocaleDateString()).reverse(),
            datasets: [
                {
                    label: 'Daily Revenue',
                    data: financialData.recentMetrics.map(metric => metric.dailyRevenue).reverse(),
                    backgroundColor: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                }
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Revenue Trend',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `$${value}`
                    }
                }
            }
        };

        return (
            <Box sx={{ height: 300, p: 2 }}>
                <Line data={chartData} options={options} />
            </Box>
        );
    };

    const OrdersChart = () => {
        const chartData = {
            labels: financialData.recentMetrics.map(metric => new Date(metric.date).toLocaleDateString()).reverse(),
            datasets: [
                {
                    label: 'Daily Orders',
                    data: financialData.recentMetrics.map(metric => metric.ordersCount).reverse(),
                    backgroundColor: theme.palette.info.main,
                    borderColor: theme.palette.info.main,
                    borderWidth: 2,
                }
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Orders Trend',
                },
            },
        };

        return (
            <Box sx={{ height: 300, p: 2 }}>
                <Bar data={chartData} options={options} />
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography color="error" variant="h6">{error}</Typography>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }} 
                    onClick={fetchFinancialData}
                    startIcon={<Refresh />}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Financial Overview</Typography>
                    <Tooltip title="This dashboard shows all financial metrics from completed orders">
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <Info fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReport}
                        sx={{ mr: 1 }}
                    >
                        Download Report
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchFinancialData}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Financial Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={financialData.totalRevenue}
                        icon={<AttachMoney sx={{ color: 'primary.main', fontSize: 30 }} />}
                        trend={financialData.revenueGrowthRate}
                        subtitle="Lifetime earnings"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Monthly Revenue"
                        value={financialData.monthlyRevenue}
                        icon={<ShowChart sx={{ color: 'success.main', fontSize: 30 }} />}
                        trend={financialData.revenueGrowthRate}
                        subtitle="Current month"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Weekly Revenue"
                        value={financialData.weeklyRevenue}
                        icon={<DateRange sx={{ color: 'warning.main', fontSize: 30 }} />}
                        trend={0}
                        subtitle="Current week"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg. Order Value"
                        value={financialData.averageOrderValue}
                        icon={<Receipt sx={{ color: 'info.main', fontSize: 30 }} />}
                        trend={0}
                        subtitle={`Total Orders: ${financialData.totalOrders}`}
                    />
                </Grid>
            </Grid>

            {/* Tabs for Charts and Transactions */}
            <Paper sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab icon={<BarChart />} label="Revenue Analysis" />
                    <Tab icon={<CalendarToday />} label="Recent Transactions" />
                </Tabs>
                <Divider />
                
                {activeTab === 0 && (
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
                                    <RevenueChart />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>Orders Trend</Typography>
                                    <OrdersChart />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {activeTab === 1 && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>
                        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {financialData.recentTransactions.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            sx={{ 
                                                '&:hover': { backgroundColor: 'grey.50' },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{transaction.orderId}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    sx={{ 
                                                        display: 'inline-block',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        bgcolor: transaction.transactionType === 'ORDER' ? 'success.light' : 'error.light',
                                                        color: transaction.transactionType === 'ORDER' ? 'success.dark' : 'error.dark',
                                                    }}
                                                >
                                                    {transaction.transactionType}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    sx={{ fontWeight: 'bold' }}
                                                    color={transaction.transactionType === 'ORDER' ? 'success.main' : 'error.main'}
                                                >
                                                    {transaction.transactionType === 'ORDER' ? '+' : '-'}
                                                    ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default FinancialOverview;