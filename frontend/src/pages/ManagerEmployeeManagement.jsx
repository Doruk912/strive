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
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import CommonDialog from '../components/AdminDialog';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'John Doe', position: 'Sales', salary: 50000 },
        { id: 2, name: 'Jane Smith', position: 'Marketing', salary: 55000 },
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        salary: '',
    });

    const handleAdd = () => {
        setSelectedEmployee(null);
        setFormData({
            name: '',
            position: '',
            salary: '',
        });
        setOpenDialog(true);
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setFormData(employee);
        setOpenDialog(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.position || !formData.salary) {
            alert('Please fill in all fields');
            return;
        }

        if (selectedEmployee) {
            setEmployees(employees.map(emp =>
                emp.id === selectedEmployee.id
                    ? { ...emp, ...formData }
                    : emp
            ));
        } else {
            setEmployees([
                ...employees,
                {
                    id: employees.length + 1,
                    ...formData,
                    salary: Number(formData.salary),
                }
            ]);
        }
        setOpenDialog(false);
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Employee Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Add Employee
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Salary</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow
                                key={employee.id}
                                sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                            >
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>${employee.salary.toLocaleString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleEdit(employee)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(employee.id)}
                                        size="small"
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

            <CommonDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                type="employee"
            />
        </Box>
    );
};

export default EmployeeManagement;