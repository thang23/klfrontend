import apiClient from "../apiClient";

export const GetActivity = async () => {
    try {
        const response = await apiClient.get('/admin/activity/');
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getActivityDetail = async (id) => {
    let entity = null;
    try {
        const response = await apiClient.get(`/admin/activity/detail/${id}`);
        entity = response.data.res;
    } catch (error) {
        console.log(error);
        throw error;
    }
    return entity;
}
export const DeleteActivity = async (id) => {

    try {
        const response = await apiClient.delete(`/admin/activity/delete/${id}`);
        console.log(id);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

export const CreateActivity = async (activityData, file) => {
    let createdActivity = null;
    try {
        console.log(activityData);
        const response = await apiClient.post('/admin/activity/create', activityData);
        createdActivity = response.data;
        const id = createdActivity?.res?.id; // Lấy ID  vừa tạo

        if (!id) {
            throw new Error("Không thể lấy ID của hoạt động vừa tạo.");
        }

        if (file) {
            const formData = new FormData();
            formData.append("typeEntity", "activity");
            formData.append("file", file);

            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            await apiClient.post(`/upload/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }

        return createdActivity;
    } catch (error) {
        // Xử lý lỗi chi tiết
        let errorMessage = "Lỗi khi tạo hoạt động hoặc tải lên file";
        if (error.response) {
            // Lỗi từ server
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
            // Không nhận được phản hồi
            errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.";
        } else {
            // Lỗi khác
            errorMessage = error.message || errorMessage;
        }

        throw new Error(errorMessage); // Ném lỗi với thông điệp cụ thể
    }
};

export const EditActivity = async (id, activityData, file) => {
    try {
        let updatedActivityData = { ...activityData }; // Sao chép dữ liệu để không thay đổi nguyên bản

        // Upload file nếu có
        if (file) {
            const formData = new FormData();
            formData.append("typeEntity", "activity");
            formData.append("file", file);

            const uploadResponse = await apiClient.post("/upload/uploadPost", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (uploadResponse.data.code === 200) {
                updatedActivityData.imageUrl = uploadResponse.data.res; // Lấy URL ảnh từ response
            } else {
                throw new Error("Upload ảnh thất bại: " + uploadResponse.data.message);
            }
        }

        // Gửi request PUT với dữ liệu JSON
        const response = await apiClient.put(`/admin/activity/update/${id}`, updatedActivityData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data; // Trả về dữ liệu từ response
    } catch (error) {
        let errorMessage = "Lỗi khi chỉnh sửa hoạt động hoặc tải lên file";
        if (error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
            errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.";
        } else {
            errorMessage = error.message || errorMessage;
        }
        throw new Error(errorMessage);
    }
};