import { toast } from "react-toastify";
import apiClient from "../apiClient";

export const getUserProfileById = async (id) => {

    try {
        const response = await apiClient.get(`/api/user/profile/${id}`);

        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error(error.response?.data?.message || "Không thể tải thông tin người dùng.");
        return { code: 500, res: null };
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await apiClient.delete(`/api/user/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        throw new Error(error.response?.data?.message || "Không thể xóa người dùng!");
    }
};

export const getAllUser = async () => {
    try {
        const response = await apiClient.get('/api/user/all');
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        toast.error(error.response?.data?.message || "Không thể tải danh sách người dùng.");
    }
}

export const toggleUserEnabled = async (id, enabled) => {
    try {
        const response = await apiClient.put(`/api/user/toggle-enabled/${id}`, enabled, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
        throw new Error(error.response?.data?.message || "Không thể cập nhật trạng thái tài khoản!");
    }
};