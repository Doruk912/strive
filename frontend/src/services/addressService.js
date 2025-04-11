import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const addressService = {
    getUserAddresses: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/addresses/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to load addresses');
            }
            throw error;
        }
    },

    createAddress: async (addressData, token) => {
        try {
            const response = await axios.post(`${API_URL}/addresses`, {
                ...addressData,
                recipientName: addressData.recipientName || addressData.name,
                recipientPhone: addressData.recipientPhone || '',
                isDefault: addressData.isDefault || false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating address:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to create address');
            }
            throw error;
        }
    },

    updateAddress: async (id, addressData, token) => {
        try {
            const response = await axios.put(`${API_URL}/addresses/${id}`, {
                ...addressData,
                recipientName: addressData.recipientName || addressData.name,
                recipientPhone: addressData.recipientPhone || '',
                isDefault: addressData.isDefault || false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating address:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to update address');
            }
            throw error;
        }
    },

    deleteAddress: async (id, userId, token) => {
        try {
            await axios.delete(`${API_URL}/addresses/${id}/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error deleting address:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to delete address');
            }
            throw error;
        }
    }
}; 