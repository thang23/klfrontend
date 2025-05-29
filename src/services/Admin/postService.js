import { toast } from "react-toastify";
import apiClient from "../apiClient";

export const getAllPosts = async () => {
    try {
        const response = await apiClient.get('/api/post/all');
        console.log("API response:", response.data);
        if (response.data.res && Array.isArray(response.data.res)) {
            return response.data;
        } else {
            throw new Error("Dữ liệu không hợp lệ từ API!");
        }
    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        toast.error(error.response?.data?.message || "Không thể tải bài viết. Vui lòng thử lại!");
        return { code: 500, res: [] };
    }
};

export const deleteComment = async (id) => {
    try {
        const response = await apiClient.delete(`/api/comment/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error);
        throw new Error(error.response?.data?.message || "Không thể xóa bình luận!");
    }
};



export const deletePost = async (id) => {
    try {
        const response = await apiClient.delete(`/api/post/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        throw new Error(error.response?.data?.message || "Không thể xóa bài viết!");
    }
};

export const togglePostStatus = async (id, isPublished) => {

    try {
        const response = await apiClient.post(`/api/post/toggle-status/${id}`, isPublished, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái bài viết:", error);
        throw new Error(error.response?.data?.message || "Không thể thay đổi trạng thái bài viết!");
    }
};