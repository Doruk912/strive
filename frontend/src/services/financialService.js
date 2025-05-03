import axios from 'axios';
import authHeader from './authHeader';

const API_URL = 'http://localhost:8080/api/finances';

class FinancialService {
    getFinancialOverview() {
        return axios
            .get(`${API_URL}/overview`, { headers: authHeader() })
            .then(response => response.data);
    }

    getFinancialMetrics(startDate, endDate) {
        return axios
            .get(`${API_URL}/metrics`, {
                headers: authHeader(),
                params: { startDate, endDate }
            })
            .then(response => response.data);
    }

    getRecentTransactions(limit = 10) {
        return axios
            .get(`${API_URL}/transactions`, {
                headers: authHeader(),
                params: { limit }
            })
            .then(response => response.data);
    }
    
    getAllTransactions() {
        return axios
            .get(`${API_URL}/transactions/all`, { headers: authHeader() })
            .then(response => response.data);
    }
}

// Create an instance of the class before exporting
const financialService = new FinancialService();
export default financialService;