// frontend/src/services/employeeService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/employees';

export const employeeService = {
    getAllEmployees: async (token) => {
        const response = await axios.get(BASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateEmployee: async (employeeId, employeeData, token) => {
        const response = await axios.put(`${BASE_URL}/${employeeId}`, employeeData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteEmployee: async (employeeId, token) => {
        await axios.delete(`${BASE_URL}/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};