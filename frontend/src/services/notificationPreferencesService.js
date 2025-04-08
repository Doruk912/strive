import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notification-preferences';

export const notificationPreferencesService = {
    getUserPreferences: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            throw error;
        }
    },

    updatePreferences: async (userId, preferences, token) => {
        try {
            const response = await axios.put(`${API_URL}/user/${userId}`, preferences, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
}; 