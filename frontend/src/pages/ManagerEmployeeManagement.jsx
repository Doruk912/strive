import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'John Doe', position: 'Sales', salary: 50000 },
        { id: 2, name: 'Jane Smith', position: 'Marketing', salary: 55000 },
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        salary: '',
    });

    const handleAddEmployee = () => {
        setEmployees([
            ...employees,
            {
                id: employees.length + 1,
                ...newEmployee,
                salary: Number(newEmployee.salary),
            },
        ]);
        setOpenDialog(false);
        setNewEmployee({ name: '', position: '', salary: '' });
    };

    const handleRemoveEmployee = (id) => {
        setEmployees(employees.filter(emp => emp.id !== id));
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Employee Management</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                >
                    Add Employee
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Salary</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>${employee.salary}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveEmployee(employee.id)}
                                    >
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Position"
                        fullWidth
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Salary"
                        type="number"
                        fullWidth
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddEmployee} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeManagement;