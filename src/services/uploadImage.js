
import { toast } from 'react-toastify';
import apiClient from './apiClient';


export const UploadImage = async (id, params) => {
    console.log(params);
    try {
        const response = await apiClient.post(`/upload/${id}`, params, {
            headers: {
                'Content-Type': 'multipart/form-data', // Đảm bảo gửi đúng định dạng
            },
        });
        console.log(response);
        return response;

    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }

}

// xoa

export const DeleteImage = async (id, type_entity, image_path) => {
    console.log("checkk id " + id);
    console.log("param " + type_entity);
    console.log("fs " + image_path);
    try {
        const response = await apiClient.delete(`/upload/${id}`, {
            data: { type_entity, image_path },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}
