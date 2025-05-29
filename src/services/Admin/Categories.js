import { toast } from "react-toastify";
import apiClient from "../apiClient";

// Hàm xử lý lỗi chung
const handleError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;

    if (error.response) {
        // Lỗi từ server
        errorMessage = error.response.data?.message || defaultMessage;
    } else if (error.request) {
        // Không nhận được phản hồi
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.";
    } else {
        // Lỗi khác
        errorMessage = error.message || defaultMessage;
    }

    console.error(errorMessage, error);
    toast.error(errorMessage);
    throw new Error(errorMessage);
};

// Lấy danh sách danh mục
export const getCategory = async () => {
    try {
        const response = await apiClient.get('admin/category/');
        return response; // Trả về dữ liệu từ API
    } catch (error) {
        handleError(error, "Lỗi khi lấy danh sách danh mục");
    }
};

// Lấy tất cả danh mục
export const getAllCategory = async () => {
    try {
        const response = await apiClient.get('admin/category/all');
        return response || []; // Trả về mảng rỗng nếu không có dữ liệu
    } catch (error) {
        handleError(error, "Lỗi khi lấy danh sách danh mục");
    }
};

// Xóa danh mục
export const DeleteCategory = async (id) => {
    try {
        const response = await apiClient.delete(`admin/category/delete/${id}`);
        return response;
    } catch (error) {
        handleError(error, "Lỗi khi xóa danh mục");
    }
};

// Tạo danh mục
export const CreateCategory = async (categoryData, file) => {
    console.log(categoryData);
    try {
        // Bước 1: Tạo danh mục
        const createResponse = await apiClient.post('admin/category/create', categoryData);
        const categoryId = createResponse.data.res.id // Lấy ID của danh mục vừa tạo

        if (!categoryId) {
            throw new Error("Không thể lấy ID của danh mục vừa tạo.");
        }

        // Bước 2: Tải lên file (nếu có)
        if (file) {
            await uploadFile(categoryId, file);
        }
        return createResponse;
    } catch (error) {
        handleError(error, "Lỗi khi tạo danh mục hoặc tải lên file");
    }
};

// Hàm tải lên file
const uploadFile = async (categoryId, file) => {
    try {
        const formData = new FormData();
        formData.append("typeEntity", "category");
        formData.append("file", file);

        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        await apiClient.post(`/upload/${categoryId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        toast.success("Tải lên file thành công");
    } catch (error) {
        handleError(error, "Lỗi khi tải lên file");
    }
};

export const UpdateCategory = async (categoryId, categoryData, file) => {
    try {
        // Bước 1: Cập nhật danh mục
        const updateResponse = await apiClient.put(`admin/category/update/${categoryId}`, categoryData);

        // Bước 2: Tải lên file (nếu có)
        if (file) {
            await uploadFile(categoryId, file);
        }
        return updateResponse;
    } catch (error) {
        console.error("UpdateCategory error:", error); // log full error ra console
        toast.error(error.response?.data?.message || error.message || "Lỗi khi cập nhật danh mục hoặc tải lên file");
        handleError(error, "Lỗi khi cập nhật danh mục hoặc tải lên file");
    }
}