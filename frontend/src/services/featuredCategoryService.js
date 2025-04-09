import axios from 'axios';

const API_URL = 'http://localhost:8080/api/featured-categories';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const featuredCategoryService = {
    getAllFeaturedCategories: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching featured categories:', error);
            throw error;
        }
    }
}; 