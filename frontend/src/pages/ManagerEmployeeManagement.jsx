import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Box,
    IconButton,
    MenuItem,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';

const ManagerEmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'CUSTOMER'
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/employees', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            showSnackbar('Failed to fetch employees', 'error');
        }
    };

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setSelectedEmployee(employee);
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: employee.role
            });
        } else {
            setSelectedEmployee(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                role: 'CUSTOMER'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEmployee(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            role: 'CUSTOMER'
        });
    };

    const handleSubmit = async () => {
        try {
            const url = selectedEmployee
                ? `http://localhost:8080/api/users/${selectedEmployee.id}`
                : 'http://localhost:8080/api/users';

            const response = await fetch(url, {
                method: selectedEmployee ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showSnackbar(
                    selectedEmployee
                        ? 'Employee updated successfully'
                        : 'Employee created successfully',
                    'success'
                );
                fetchEmployees();
                handleCloseDialog();
            } else {
                throw new Error('Operation failed');
            }
        } catch (error) {
            showSnackbar(
                selectedEmployee
                    ? 'Failed to update employee'
                    : 'Failed to create employee',
                'error'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                showSnackbar('Employee deleted successfully', 'success');
                fetchEmployees();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            showSnackbar('Failed to delete employee', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Helmet>
                <title>Strive - Employee Management</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Employee Management
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => handleOpenDialog()}
                            sx={{ textTransform: 'none' }}
                        >
                            Add New Employee
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>
                                            {employee.firstName} {employee.lastName}
                                        </TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleOpenDialog(employee)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(employee.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                fullWidth
                            />
                            <TextField
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                fullWidth
                            />
                            <TextField
                                select
                                label="Role"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                fullWidth
                            >
                                <MenuItem value="CUSTOMER">Customer</MenuItem>
                                <MenuItem value="MANAGER">Manager</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            {selectedEmployee ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default ManagerEmployeeManagement;