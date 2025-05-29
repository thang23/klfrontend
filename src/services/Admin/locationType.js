import { toast } from "react-toastify";
import apiClient from "../apiClient";


export const GetAllLocationType = async () => {
    let entity = null;
    try {
        const response = await apiClient.get('/admin/LocationType');
        entity = response;
    } catch (error) {
        toast.error(entity.data.message);
        throw error;
    }
    return entity;
}

export const CreateLocationType = async (locationTypeData) => {
    let createdLocationType = null;
    try {
        const response = await apiClient.post('/admin/LocationType/create', locationTypeData);
        createdLocationType = response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
    return createdLocationType;
}

export const UpdateLocationType = async (id, locationTypeData) => {
    let updatedLocationType = null;
    try {
        const response = await apiClient.put(`/admin/LocationType/update/${id}`, locationTypeData);
        updatedLocationType = response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
    return updatedLocationType;
}

export const DeleteLocationType = async (id) => {
    try {
        const response = await apiClient.delete(`/admin/LocationType/delete/${id}`);
        console.log(response);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}