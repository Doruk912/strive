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
    DialogContentText,
    DialogTitle,
    TextField,
    Box,
    IconButton,
    MenuItem,
    Alert,
    Snackbar,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    InputAdornment,
    OutlinedInput
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';

const ManagerEmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openUserSelectionDialog, setOpenUserSelectionDialog] = useState(false);
    const [openRoleSelectionDialog, setOpenRoleSelectionDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('CUSTOMER');
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'CUSTOMER'
    });
    const [formErrors, setFormErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Filter users based on search query
        if (allUsers.length > 0) {
            const filtered = allUsers.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const email = user.email.toLowerCase();
                const query = searchQuery.toLowerCase();
                
                return fullName.includes(query) || email.includes(query);
            });
            
            setFilteredUsers(filtered);
        }
    }, [searchQuery, allUsers]);

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
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load employees');
            }
        } catch (error) {
            showSnackbar(error.message || 'Error loading employees', 'error');
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            // Try the /api/users/all endpoint first
            let response = await fetch('http://localhost:8080/api/users/all', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            // If it fails, try the /api/users endpoint as fallback
            if (!response.ok) {
                response = await fetch('http://localhost:8080/api/users', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
            }

            if (response.ok) {
                const data = await response.json();
                setAllUsers(data);
                setFilteredUsers(data); // Initialize filtered users with all users
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showSnackbar(error.message || 'Error loading users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenDialog = (employee = null) => {
        setFormErrors({});
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
        setFormErrors({});
    };

    const handleOpenUserSelectionDialog = async () => {
        setSearchQuery(''); // Reset search query
        setOpenUserSelectionDialog(true);
        await fetchAllUsers();
    };

    const handleCloseUserSelectionDialog = () => {
        setOpenUserSelectionDialog(false);
        setSearchQuery(''); // Clear search when closing
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleUserSelect = (selectedUser) => {
        setSelectedUser(selectedUser);
        setOpenUserSelectionDialog(false);
        setSelectedRole(selectedUser.role || 'CUSTOMER'); // Default to current role or CUSTOMER
        setOpenRoleSelectionDialog(true);
    };

    const handleCloseRoleSelectionDialog = () => {
        setOpenRoleSelectionDialog(false);
        setSelectedUser(null);
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    const handleAssignRole = async () => {
        if (!selectedUser) {
            showSnackbar('Please select a user', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ role: selectedRole })
            });

            if (response.ok) {
                showSnackbar('User role successfully updated', 'success');
                fetchEmployees();
                handleCloseRoleSelectionDialog();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to assign role');
            }
        } catch (error) {
            showSnackbar(error.message || 'Error assigning role', 'error');
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

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
                        ? 'Employee successfully updated'
                        : 'Employee successfully added',
                    'success'
                );
                fetchEmployees();
                handleCloseDialog();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            showSnackbar(
                error.message || (selectedEmployee ? 'Error updating employee' : 'Error adding employee'),
                'error'
            );
        }
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setOpenDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!employeeToDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/users/${employeeToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                showSnackbar('Employee successfully deleted', 'success');
                fetchEmployees();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Delete operation failed');
            }
        } catch (error) {
            showSnackbar(error.message || 'Error deleting employee', 'error');
        } finally {
            setOpenDeleteDialog(false);
            setEmployeeToDelete(null);
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
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Employee Management
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleOpenUserSelectionDialog}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1,
                                px: 3,
                            }}
                        >
                            Add New Employee
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Full Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.map((employee) => (
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
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(employee)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Regular Edit Employee Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 2 }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                        {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                error={!!formErrors.firstName}
                                helperText={formErrors.firstName}
                                fullWidth
                                size="medium"
                            />
                            <TextField
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                error={!!formErrors.lastName}
                                helperText={formErrors.lastName}
                                fullWidth
                                size="medium"
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                fullWidth
                                size="medium"
                            />
                            <TextField
                                select
                                label="Role"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                fullWidth
                                size="medium"
                            >
                                <MenuItem value="CUSTOMER">Customer</MenuItem>
                                <MenuItem value="MANAGER">Manager</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            onClick={handleCloseDialog}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{ px: 3, borderRadius: 1 }}
                        >
                            {selectedEmployee ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* User Selection Dialog with Search */}
                <Dialog
                    open={openUserSelectionDialog}
                    onClose={handleCloseUserSelectionDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 2 }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                        Select a User to Assign as Employee
                    </DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        {/* Enhanced Search Bar */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                Search for users by name or email
                            </Typography>
                            <FormControl fullWidth variant="outlined">
                                <OutlinedInput
                                    placeholder="Type to search..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        searchQuery ? (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="clear search"
                                                    onClick={clearSearch}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null
                                    }
                                    sx={{
                                        borderRadius: 1,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.87)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                            borderWidth: 2,
                                        },
                                    }}
                                />
                            </FormControl>
                        </Box>
                        
                        <Box sx={{ height: '450px', overflow: 'auto' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : filteredUsers.length === 0 ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    borderRadius: 1
                                }}>
                                    <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        {searchQuery ? "No users found matching your search" : "No users found"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {searchQuery 
                                            ? "Try using different keywords or check for spelling errors" 
                                            : "Please check your connection or try again later"}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="caption" color="text.secondary" sx={{ pl: 2, mb: 1, display: 'block' }}>
                                        Found {filteredUsers.length} users
                                    </Typography>
                                    <List>
                                        {filteredUsers.map((user) => (
                                            <React.Fragment key={user.id}>
                                                <ListItem
                                                    button
                                                    onClick={() => handleUserSelect(user)}
                                                    sx={{
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="subtitle1">
                                                                {user.firstName} {user.lastName}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="text.secondary">
                                                                {user.email}
                                                            </Typography>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Current role: {user.role || 'None'}
                                                        </Typography>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                <Divider />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            onClick={handleCloseUserSelectionDialog}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Role Selection Dialog */}
                <Dialog
                    open={openRoleSelectionDialog}
                    onClose={handleCloseRoleSelectionDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 2 }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                        Assign Role
                    </DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        {selectedUser && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Selected User: {selectedUser.firstName} {selectedUser.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Email: {selectedUser.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Current Role: {selectedUser.role || 'None'}
                                </Typography>
                            </Box>
                        )}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Select Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedRole}
                                label="Select Role"
                                onChange={handleRoleChange}
                            >
                                <MenuItem value="CUSTOMER">Customer</MenuItem>
                                <MenuItem value="MANAGER">Manager</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            onClick={handleCloseRoleSelectionDialog}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignRole}
                            variant="contained"
                            sx={{ px: 3, borderRadius: 1 }}
                        >
                            Assign Role
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 2 }
                    }}
                >
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {employeeToDelete && `Are you sure you want to delete ${employeeToDelete.firstName} ${employeeToDelete.lastName}?`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button
                            onClick={() => setOpenDeleteDialog(false)}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="contained"
                            color="error"
                            sx={{ px: 3, borderRadius: 1 }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default ManagerEmployeeManagement;