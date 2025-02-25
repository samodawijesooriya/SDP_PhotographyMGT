// src/services/packageService.js
import axios from 'axios';

// Get the base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with base configuration
const apiClient = axios.create({
    baseURL: `${BASE_URL}/packages`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add authorization token
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Package Service
const PackageService = {
    // Fetch all packages
    getAllPackages: async () => {
        try {
            const response = await apiClient.get('/');
            return response.data;
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw error;
        }
    },

    // Fetch package form data (events, tiers, items, details)
    getPackageFormData: async () => {
        try {
            const response = await apiClient.get('/form-data');
            return response.data;
        } catch (error) {
            console.error('Error fetching package form data:', error);
            throw error;
        }
    },

    // Create a new package
    createPackage: async (packageData) => {
        try {
            const response = await apiClient.post('/', packageData);
            return response.data;
        } catch (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    },

    // Update an existing package
    updatePackage: async (packageId, packageData) => {
        try {
            const response = await apiClient.put(`/${packageId}`, packageData);
            return response.data;
        } catch (error) {
            console.error('Error updating package:', error);
            throw error;
        }
    },

    // Delete a package
    deletePackage: async (packageId) => {
        try {
            const response = await apiClient.delete(`/${packageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting package:', error);
            throw error;
        }
    }
};

export default PackageService;