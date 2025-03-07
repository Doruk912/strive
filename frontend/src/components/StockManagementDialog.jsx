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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                backgroundColor: 'primary.main',
                color: 'white'
            }}>
                <Typography variant="h6" component="div">
                    Stock Management
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    {product?.name}
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                {error && (
                    <Box sx={{ mb: 3 }}>
                        <Alert
                            severity="error"
                            variant="filled"
                            sx={{ borderRadius: 1 }}
                        >
                            {error}
                        </Alert>
                    </Box>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: 2,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sizes.map((sizeItem) => (
                                <TableRow
                                    key={sizeItem.size}
                                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                                >
                                    <TableCell>
                                        <Typography variant="body1">
                                            {sizeItem.size}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={sizeItem.stock}
                                            onChange={(e) => handleStockChange(sizeItem.size, e.target.value)}
                                            inputProps={{
                                                min: 0,
                                                sx: { textAlign: 'center' }
                                            }}
                                            sx={{ width: '100px' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleDeleteSize(sizeItem.size)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={newSize.size}
                                        onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                                        placeholder="Enter size"
                                        sx={{ width: '120px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={newSize.stock}
                                        onChange={(e) => setNewSize({ ...newSize, stock: e.target.value })}
                                        placeholder="Enter stock"
                                        inputProps={{
                                            min: 0,
                                            sx: { textAlign: 'center' }
                                        }}
                                        sx={{ width: '100px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={handleAddSize}
                                        color="primary"
                                        size="small"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ mr: 1 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StockManagementDialog;