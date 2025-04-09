import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Box,
    Typography,
    Divider,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const StockManagementDialog = ({ open, onClose, product, onSave }) => {
    const [stocks, setStocks] = useState([]);
    const [newStock, setNewStock] = useState({ size: '', stock: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        if (product && product.stocks) {
            setStocks(product.stocks.map(stock => ({
                ...stock,
                stock: stock.stock || 0
            })));
        }
    }, [product]);

    const handleAddStock = () => {
        setError('');
        if (!newStock.size) {
            setError('Please enter a size');
            return;
        }

        if (newStock.stock < 0) {
            setError('Stock cannot be negative');
            return;
        }

        // Check if size already exists
        if (stocks.some(s => s.size.toLowerCase() === newStock.size.toLowerCase())) {
            setError('This size already exists');
            return;
        }

        setStocks([...stocks, { ...newStock, stock: Number(newStock.stock) }]);
        setNewStock({ size: '', stock: 0 });
    };

    const handleUpdateStock = (index, value) => {
        const updatedStocks = [...stocks];
        if (value >= 0) {
            updatedStocks[index] = { ...updatedStocks[index], stock: Number(value) };
            setStocks(updatedStocks);
        }
    };

    const handleDeleteStock = (index) => {
        const stockToDelete = stocks[index];
        if (stockToDelete.id && Number(stockToDelete.stock) > 0) {
            setError(`Cannot delete size ${stockToDelete.size} because it has stock. Please set stock to 0 first.`);
            return;
        }

        setError('');
        setStocks(stocks.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (stocks.some(stock => !stock.size)) {
            setError('All sizes must have a name');
            return;
        }

        if (stocks.some(stock => stock.stock < 0)) {
            setError('Stock cannot be negative');
            return;
        }

        onSave(stocks);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6">Stock Management</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {product?.name}
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Add New Size
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            label="Size"
                            value={newStock.size}
                            onChange={(e) => setNewStock({ ...newStock, size: e.target.value })}
                            size="small"
                            sx={{ width: 120 }}
                        />
                        <TextField
                            label="Stock"
                            type="number"
                            value={newStock.stock}
                            onChange={(e) => setNewStock({ ...newStock, stock: e.target.value })}
                            size="small"
                            sx={{ width: 120 }}
                            inputProps={{ min: "0" }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddStock}
                        >
                            Add Size
                        </Button>
                    </Box>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Size</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stocks.map((stock, index) => (
                                <TableRow key={index}>
                                    <TableCell>{stock.size}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={stock.stock}
                                            onChange={(e) => handleUpdateStock(index, e.target.value)}
                                            size="small"
                                            inputProps={{ min: "0" }}
                                            sx={{ width: 100 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleDeleteStock(index)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {stocks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography color="text.secondary">
                                            No sizes added yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StockManagementDialog;