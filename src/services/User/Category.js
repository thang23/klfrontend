import apiClient from "../apiClient";


// Lấy danh sách danh mục
export const getCategoryUser = async () => {
    try {
        const response = await apiClient.get('api/category/');
        console.log("Danh sách danh mục:", response.data);
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        throw error.response?.data || error;
    }
};