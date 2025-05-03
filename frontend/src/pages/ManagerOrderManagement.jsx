import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
    useTheme,
    Grid,
    Card,
    CardContent,
    TablePagination,
} from '@mui/material';
import {
    LocalShipping,
    CheckCircle,
    Cancel,
    Pending,
    Inventory,
    Search as SearchIcon,
    FilterList,
    Refresh,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import { useAuth } from '../context/AuthContext';

const ManagerOrderManagement = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [orderCounts, setOrderCounts] = useState({
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0
    });
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);

            // Calculate order counts by status
            const counts = {
                PENDING: 0,
                PROCESSING: 0,
                SHIPPED: 0,
                DELIVERED: 0,
                CANCELLED: 0
            };
            
            data.forEach(order => {
                if (order.status && counts.hasOwnProperty(order.status)) {
                    counts[order.status]++;
                }
            });
            
            setOrderCounts(counts);
            
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStatusDialog = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setOpenStatusDialog(true);
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
        setSelectedOrder(null);
        setNewStatus('');
    };

    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };

    const handleUpdateStatus = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/orders/${selectedOrder.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            const updatedOrder = await response.json();
            
            // Update orders list with the updated order
            setOrders(orders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
            ));
            
            // Update the order counts
            setOrderCounts(prev => ({
                ...prev,
                [selectedOrder.status]: prev[selectedOrder.status] - 1,
                [newStatus]: prev[newStatus] + 1
            }));
            
            setSnackbar({
                open: true,
                message: `Order #${selectedOrder.id} status updated to ${getStatusInfo(newStatus).label}`,
                severity: 'success'
            });
            
            handleCloseStatusDialog();
        } catch (error) {
            console.error('Error updating order status:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update order status',
                severity: 'error'
            });
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page on search
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DELIVERED':
                return {
                    label: 'Delivered',
                    color: theme.palette.success.main,
                    icon: <CheckCircle />,
                    textColor: theme.palette.success.contrastText,
                    bgColor: theme.palette.success.light
                };
            case 'PROCESSING':
                return {
                    label: 'Processing',
                    color: theme.palette.warning.main,
                    icon: <Inventory />,
                    textColor: theme.palette.warning.contrastText,
                    bgColor: theme.palette.warning.light
                };
            case 'SHIPPED':
                return {
                    label: 'Shipped',
                    color: theme.palette.info.main,
                    icon: <LocalShipping />,
                    textColor: theme.palette.info.contrastText,
                    bgColor: theme.palette.info.light
                };
            case 'CANCELLED':
                return {
                    label: 'Cancelled',
                    color: theme.palette.error.main,
                    icon: <Cancel />,
                    textColor: theme.palette.error.contrastText,
                    bgColor: theme.palette.error.light
                };
            case 'PENDING':
                return {
                    label: 'Pending',
                    color: theme.palette.grey[500],
                    icon: <Pending />,
                    textColor: theme.palette.grey[800],
                    bgColor: theme.palette.grey[200]
                };
            default:
                return {
                    label: status,
                    color: theme.palette.grey[500],
                    icon: null,
                    textColor: theme.palette.grey[800],
                    bgColor: theme.palette.grey[200]
                };
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatPaymentMethod = (method) => {
        if (!method) return '';
        if (method === 'CREDIT_CARD') return 'Credit Card';
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order.id.toString().includes(searchTerm) ||
            formatDate(order.createdAt).toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Apply pagination to filtered orders
    const paginatedOrders = filteredOrders.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ pt: 0 }}>
            <Helmet>
                <title>Order Management | Strive Admin</title>
            </Helmet>
            
            <Box sx={{ mb: 2, mt: -10 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    View and manage all customer orders
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Order Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatsCard 
                        title="Pending" 
                        count={orderCounts.PENDING}
                        icon={<Pending />}
                        color={theme.palette.grey[500]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatsCard 
                        title="Processing" 
                        count={orderCounts.PROCESSING}
                        icon={<Inventory />}
                        color={theme.palette.warning.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatsCard 
                        title="Shipped" 
                        count={orderCounts.SHIPPED}
                        icon={<LocalShipping />}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatsCard 
                        title="Delivered" 
                        count={orderCounts.DELIVERED}
                        icon={<CheckCircle />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatsCard 
                        title="Cancelled" 
                        count={orderCounts.CANCELLED}
                        icon={<Cancel />}
                        color={theme.palette.error.main}
                    />
                </Grid>
            </Grid>
            
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search orders..."
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={statusFilter}
                            label="Status"
                            onChange={handleStatusFilterChange}
                        >
                            <MenuItem value="ALL">All Statuses</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="PROCESSING">Processing</MenuItem>
                            <MenuItem value="SHIPPED">Shipped</MenuItem>
                            <MenuItem value="DELIVERED">Delivered</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                
                <Button 
                    startIcon={<Refresh />} 
                    onClick={fetchOrders}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Paper>
            
            {/* Orders Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Payment Method</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" sx={{ py: 2 }}>
                                                No orders found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedOrders.map((order) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        
                                        return (
                                            <TableRow key={order.id} hover>
                                                <TableCell>#{order.id}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>{order.userId}</TableCell>
                                                <TableCell>${order.totalAmount}</TableCell>
                                                <TableCell>{formatPaymentMethod(order.paymentMethod)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={statusInfo.icon}
                                                        label={statusInfo.label}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: statusInfo.bgColor,
                                                            color: statusInfo.color,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleOpenStatusDialog(order)}
                                                    >
                                                        Update Status
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                {/* Pagination Component */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            
            {/* Update Status Dialog */}
            <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent sx={{ minWidth: 300 }}>
                    {selectedOrder && (
                        <>
                            <Box sx={{ mb: 3, mt: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Order #{selectedOrder.id}
                                </Typography>
                                <Typography variant="body2">
                                    Current Status: {getStatusInfo(selectedOrder.status).label}
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth>
                                <InputLabel id="new-status-label">New Status</InputLabel>
                                <Select
                                    labelId="new-status-label"
                                    id="new-status"
                                    value={newStatus}
                                    label="New Status"
                                    onChange={handleStatusChange}
                                >
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="PROCESSING">Processing</MenuItem>
                                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog}>Cancel</Button>
                    <Button 
                        onClick={handleUpdateStatus} 
                        variant="contained" 
                        color="primary"
                        disabled={!selectedOrder || selectedOrder.status === newStatus}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// Stats Card Component
const StatsCard = ({ title, count, icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center', 
            textAlign: 'center',
            p: 2
        }}>
            <Box sx={{ 
                color: color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 1,
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: `${color}15`
            }}>
                {icon}
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </CardContent>
    </Card>
);

export default ManagerOrderManagement; 