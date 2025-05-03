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
    TablePagination,
    TextField,
    InputAdornment,
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
    Search as SearchIcon,
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
        weeklyRevenueGrowthRate: 0,
    });
    const [activeTab, setActiveTab] = useState(0);
    const [allTransactions, setAllTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [weeklyMetrics, setWeeklyMetrics] = useState([]);
    
    // Pagination for transactions
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        fetchFinancialData();
        fetchAllTransactions();
    }, []);
    
    // Process daily metrics into weekly metrics
    useEffect(() => {
        if (financialData.recentMetrics && financialData.recentMetrics.length > 0) {
            // Group metrics by week
            const weekMap = new Map();
            
            financialData.recentMetrics.forEach(metric => {
                const date = new Date(metric.date);
                // Get the start of the week (Sunday)
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];
                
                if (!weekMap.has(weekKey)) {
                    weekMap.set(weekKey, {
                        weekStart: weekKey,
                        weekLabel: `Week of ${formatDate(weekStart)}`,
                        revenue: 0,
                        orders: 0
                    });
                }
                
                const weekData = weekMap.get(weekKey);
                weekData.revenue += Number(metric.dailyRevenue);
                weekData.orders += metric.ordersCount;
            });
            
            // Convert map to array and sort by date (newest first)
            const weeklyData = Array.from(weekMap.values())
                .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
            
            setWeeklyMetrics(weeklyData);
        }
    }, [financialData.recentMetrics]);
    
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
    
    const fetchAllTransactions = async () => {
        setTransactionsLoading(true);
        try {
            // Using the new endpoint to get all transactions
            const transactions = await financialService.getAllTransactions();
            setAllTransactions(transactions);
        } catch (err) {
            console.error('Error fetching all transactions:', err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page when searching
    };
    
    // Filter transactions based on search term
    const filteredTransactions = allTransactions
        // Sort by order ID from highest to lowest
        .sort((a, b) => {
            // First ensure we're comparing numbers
            const orderIdA = parseInt(a.orderId) || 0;
            const orderIdB = parseInt(b.orderId) || 0;
            // Sort highest to lowest (descending)
            return orderIdB - orderIdA;
        })
        .filter(transaction => 
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.orderId?.toString().includes(searchTerm) ||
            transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    // Get displayed transactions for the current page
    const displayedTransactions = filteredTransactions
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Format date to day-month-year format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleDownloadReport = () => {
        // Generate detailed CSV data
        const metrics = financialData.recentMetrics;
        const transactions = allTransactions;
        
        // Create a timestamp for the report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Create financial metrics data
        const metricRows = metrics.map(metric => 
            `${formatDate(metric.date)},${metric.dailyRevenue},${metric.ordersCount},${metric.averageOrderValue}`
        );
        
        // Weekly metrics data
        const weeklyRows = weeklyMetrics.map(week => 
            `${week.weekLabel},${week.revenue.toFixed(2)},${week.orders},${(week.revenue / week.orders).toFixed(2)}`
        );
        
        const metricsCSV = [
            "FINANCIAL METRICS REPORT",
            `Generated on: ${formatDate(new Date())} ${new Date().toLocaleTimeString()}`,
            "",
            "SUMMARY",
            `Total Revenue:,${financialData.totalRevenue.toFixed(2)}`,
            `Monthly Revenue:,${financialData.monthlyRevenue.toFixed(2)}`,
            `Weekly Revenue:,${financialData.weeklyRevenue.toFixed(2)}`,
            `Daily Revenue:,${financialData.dailyRevenue.toFixed(2)}`,
            `Total Orders:,${financialData.totalOrders}`,
            `Average Order Value:,${financialData.averageOrderValue?.toFixed(2)}`,
            `Monthly Revenue Growth Rate:,${financialData.revenueGrowthRate}%`,
            `Weekly Revenue Growth Rate:,${financialData.weeklyRevenueGrowthRate}%`,
            `Order Growth Rate:,${financialData.orderGrowthRate}%`,
            "",
            "WEEKLY METRICS",
            "Week,Revenue,Orders,Average Order Value",
            ...weeklyRows,
            "",
            "DAILY METRICS",
            "Date,Revenue,Orders,Average Order Value",
            ...metricRows,
            "",
            "TRANSACTION DETAILS",
            "Date,Order ID,Description,Type,Amount",
            ...transactions
                // Sort by order ID from highest to lowest
                .sort((a, b) => {
                    // First ensure we're comparing numbers
                    const orderIdA = parseInt(a.orderId) || 0;
                    const orderIdB = parseInt(b.orderId) || 0;
                    // Sort highest to lowest (descending)
                    return orderIdB - orderIdA;
                })
                .map(t => {
                    const date = formatDate(t.createdAt);
                    const amount = (t.transactionType === 'ORDER' ? '+' : '-') + t.amount.toFixed(2);
                    return `${date},${t.orderId || ''},${t.description},${t.transactionType},${amount}`;
                })
        ].join("\n");
        
        // Create the download
        const blob = new Blob([metricsCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial_report_detailed_${timestamp}.csv`;
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

    const WeeklyRevenueChart = () => {
        // Use weekly aggregated data
        const chartData = {
            labels: weeklyMetrics.slice(0, 10).map(week => week.weekLabel).reverse(),
            datasets: [
                {
                    label: 'Weekly Revenue',
                    data: weeklyMetrics.slice(0, 10).map(week => week.revenue).reverse(),
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
                    text: 'Weekly Revenue Trend',
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

    const WeeklyOrdersChart = () => {
        // Use weekly aggregated data
        const chartData = {
            labels: weeklyMetrics.slice(0, 10).map(week => week.weekLabel).reverse(),
            datasets: [
                {
                    label: 'Weekly Orders',
                    data: weeklyMetrics.slice(0, 10).map(week => week.orders).reverse(),
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
                    text: 'Weekly Orders Trend',
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
                        Download Detailed Report
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => {
                            fetchFinancialData();
                            fetchAllTransactions();
                        }}
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
                        trend={financialData.weeklyRevenueGrowthRate}
                        subtitle="Current week"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg. Order Value"
                        value={financialData.averageOrderValue}
                        icon={<Receipt sx={{ color: 'info.main', fontSize: 30 }} />}
                        trend={financialData.orderGrowthRate}
                        subtitle={`Total Orders: ${financialData.totalOrders}`}
                    />
                </Grid>
            </Grid>

            {/* Tabs for Charts and Transactions */}
            <Paper sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab icon={<BarChart />} label="Revenue Analysis" />
                    <Tab icon={<CalendarToday />} label="All Transactions" />
                </Tabs>
                <Divider />
                
                {activeTab === 0 && (
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>Weekly Revenue Trend</Typography>
                                    <WeeklyRevenueChart />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>Weekly Orders Trend</Typography>
                                    <WeeklyOrdersChart />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {activeTab === 1 && (
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">All Transactions</Typography>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ width: 250 }}
                            />
                        </Box>
                        
                        {transactionsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress size={40} />
                            </Box>
                        ) : (
                            <>
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
                                            {displayedTransactions.map((transaction) => (
                                                <TableRow
                                                    key={transaction.id}
                                                    sx={{ 
                                                        '&:hover': { backgroundColor: 'grey.50' },
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                >
                                                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
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
                                
                                <TablePagination
                                    component="div"
                                    count={filteredTransactions.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                />
                            </>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default FinancialOverview;