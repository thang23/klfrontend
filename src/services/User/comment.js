import { toast } from "react-toastify";
import apiClient from "../apiClient";

export const CreatComment = async (commentPostRequest) => {
    console.log(commentPostRequest);
    try {
        const response = await apiClient.post('/api/comment/create', commentPostRequest);
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi tạo bình luận.");
        throw error;
    }
}

export const DeleteComment = async (commentId) => {

    const response = await apiClient.delete(`/api/comment/delete/${commentId}`);
    return response.data;
}

export const UpdateComment = async (commentId, content) => {
    if (!commentId || !content) {
        toast.error("Không được để trống");
        return;
    }

    try {
        const response = await apiClient.put(`/api/comment/update/${commentId}`, { content });
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật bình luận.");
        throw error;
    }
};
