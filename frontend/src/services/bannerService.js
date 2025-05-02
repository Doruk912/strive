import axios from 'axios';

const API_URL = 'http://localhost:8080/api/banners';

export const bannerService = {
  /**
   * Get all promotional banners
   * @returns {Promise<Array>} Array of banner objects
   */
  getAllBanners: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  /**
   * Get only active promotional banners
   * @returns {Promise<Array>} Array of active banner objects
   */
  getActiveBanners: async () => {
    try {
      const response = await axios.get(`${API_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active banners:', error);
      throw error;
    }
  },

  /**
   * Create a new promotional banner
   * @param {Object} bannerData - The banner data to create
   * @returns {Promise<Object>} Created banner object
   */
  createBanner: async (bannerData) => {
    try {
      const response = await axios.post(API_URL, bannerData);
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  /**
   * Update an existing promotional banner
   * @param {number} id - The banner ID to update
   * @param {Object} bannerData - The updated banner data
   * @returns {Promise<Object>} Updated banner object
   */
  updateBanner: async (id, bannerData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, bannerData);
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  /**
   * Delete a promotional banner
   * @param {number} id - The banner ID to delete
   * @returns {Promise<Object>} Response object
   */
  deleteBanner: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  /**
   * Update banner display order
   * @param {number} id - The banner ID
   * @param {number} newOrder - The new display order
   * @returns {Promise<Object>} Updated banner object
   */
  updateBannerOrder: async (id, newOrder) => {
    try {
      // Send the order as an object if it's not already one
      const orderData = typeof newOrder === 'object' 
        ? newOrder 
        : { displayOrder: newOrder };
        
      const response = await axios.patch(`${API_URL}/${id}/order`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating banner order:', error);
      throw error;
    }
  },

  /**
   * Toggle banner active status
   * @param {number} id - The banner ID
   * @param {boolean} active - The new active status
   * @returns {Promise<Object>} Updated banner object
   */
  toggleBannerActive: async (id, active) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/active`, { active });
      return response.data;
    } catch (error) {
      console.error('Error toggling banner status:', error);
      throw error;
    }
  }
}; 