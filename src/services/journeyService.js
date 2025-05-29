import apiClient from "./apiClient";

export const getJourneysByUser = async (userId) => {
    try {
        const response = await apiClient.get(`/api/journeys/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getJourneyById = async (id) => {
    try {
        const response = await apiClient.get(`/api/journeys/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteJourney = async (journeyId) => {
    try {
        const response = await apiClient.delete(`/api/journeys/${journeyId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getJourneyDetail = async (journeyId) => {
    try {
        const response = await apiClient.get(`/api/journeys/${journeyId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi khi lấy chi tiết hành trình");
    }
};