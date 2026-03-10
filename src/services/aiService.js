import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/ai';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };
};

export const analyzeFaceAndHair = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await axios.post(`${API_URL}/analyze`, formData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("AI Analysis API Error:", error);
        throw error.response?.data || { message: "Server unreachable" };
    }
};

export const getAIHistory = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("AI History API Error:", error);
        throw error.response?.data || { message: "Server unreachable" };
    }
};
