// components/StockManagementDialog.jsx
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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const StockManagementDialog = ({ open, onClose, product, onSave }) => {
    const [sizes, setSizes] = useState([]);
    const [newSize, setNewSize] = useState({ size: '', stock: 0 });
    const [error, setError] = useState('');

    // Initialize sizes when dialog opens with a product
    useEffect(() => {
        if (product && product.sizes) {
            setSizes(product.sizes);
        }
    }, [product]);

    const handleAddSize = () => {
        setError('');
        if (!newSize.size || newSize.stock < 0) {
            setError('Please enter valid size and stock values');
            return;
        }

        // Check if size already exists
        if (sizes.some(s => s.size === newSize.size)) {
            setError('This size already exists');
            return;
        }

        setSizes([...sizes, { ...newSize, stock: Number(newSize.stock) }]);
        setNewSize({ size: '', stock: 0 });
    };

    const handleDeleteSize = (sizeToDelete) => {
        const sizeItem = sizes.find(s => s.size === sizeToDelete);
        if (sizeItem && Number(sizeItem.stock) > 0) {
            setError(`Cannot delete size ${sizeToDelete} because it has stock. Please set stock to 0 first.`);
            return;
        }

        setError('');
        setSizes(sizes.filter(size => size.size !== sizeToDelete));
    };

    const handleStockChange = (sizeToUpdate, newStock) => {
        setSizes(sizes.map(size =>
            size.size === sizeToUpdate
                ? { ...size, stock: Number(newStock) }
                : size
        ));
    };

    const handleSave = () => {
        onSave(sizes);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Manage Stock by Size - {product?.name}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Size</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sizes.map((sizeItem) => (
                                <TableRow key={sizeItem.size}>
                                    <TableCell>{sizeItem.size}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={sizeItem.stock}
                                            onChange={(e) => handleStockChange(sizeItem.size, e.target.value)}
                                            inputProps={{ min: 0 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleDeleteSize(sizeItem.size)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={newSize.size}
                                        onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                                        placeholder="Size"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={newSize.stock}
                                        onChange={(e) => setNewSize({ ...newSize, stock: e.target.value })}
                                        placeholder="Stock"
                                        inputProps={{ min: 0 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={handleAddSize}
                                        color="primary"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StockManagementDialog;