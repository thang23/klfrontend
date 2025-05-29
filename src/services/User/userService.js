// src/services/User/userService.js
import apiClient from "../apiClient";

export const getUserProfile = async () => {
    try {
        const response = await apiClient.get("/api/user/profile");
        return response.data;
    } catch (error) {
        throw new Error("Lỗi khi gọi API lấy thông tin người dùng: " + error.message);
    }
};

export const getUserProfileById = async (id) => {
    try {
        const response = await apiClient.get(`/api/user/profile/${id}`);
        return response.data;
    } catch (error) {
        throw new Error("Lỗi khi gọi API lấy thông tin người dùng: " + error.message);
    }
};

export const updateUserProfile = async (data) => {
    console.log("Dữ liệu gửi đi:", data); // Thêm log để kiểm tra
    try {
        const response = await apiClient.put("/api/user/profile", data);
        return response.data;
    } catch (error) {
        throw new Error("Lỗi khi gọi API cập nhật thông tin người dùng: " + error.message);
    }
};

export const uploadImagePost = async (formData) => {
    try {
        const response = await apiClient.post("/upload/uploadPost", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw new Error("Lỗi khi gọi API upload ảnh: " + error.message);
    }
};