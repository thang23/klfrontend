import { toast } from "react-toastify";
import apiClient from "../apiClient"

export const GetAllLocations = async () => {
    try {
        const response = await apiClient.get("/admin/location/");
        console.log(response);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const CreateLocation = async (param) => {
    try {
        const response = await apiClient.post("/admin/location/create", param);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }

}

export const UpdateLocation = async (id, param) => {
    try {
        const response = await apiClient.put(`/admin/location/update/${id}`, param);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const DeleteLocation = async (id) => {
    try {
        const response = await apiClient.delete(`/admin/location/delete/${id}`);
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const GetDetailLocation = async (id) => {
    try {
        const response = await apiClient.get(`/admin/location/getdetailbyid/${id}`);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lấy chi tiết địa điểm.");
        throw error;
    }
}



export const AddTranSportLocation = async (idLocation, idTransport) => {
    try {
        const response = await apiClient.post(`/admin/location/${idLocation}/transportations/${idTransport}`);
        console.log(response);
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}


export const DeleteTransprotLocation = async (idLocation, idTransportation) => {

    try {
        const response = await apiClient.delete(`/admin/location/${idLocation}/transportations/${idTransportation}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const AddLocationType = async (idLocation, idLocationType) => {
    console.log("skfhfkjf ", idLocation, idLocationType);
    try {
        const response = await apiClient.post(`/admin/location/${idLocation}/addlocationtype/${idLocationType}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const DeleteLocationType = async (idLocation, idLocationType) => {
    console.log("idLocation, idLocationType", idLocation, idLocationType);
    try {
        const response = await apiClient.delete(`/admin/location/${idLocation}/deletelocationtype/${idLocationType}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const AddActivity = async (idLocation, idActivity) => {
    try {
        const response = await apiClient.post(`/admin/location/${idLocation}/addactivity/${idActivity}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const DeleteActivityLocation = async (idLocation, idActivity) => {
    try {
        const response = await apiClient.delete(`/admin/location/${idLocation}/deleteactivity/${idActivity}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const DeleteLocationReview = async (idReview) => {
    try {
        const response = await apiClient.delete(`/admin/location/deletelocationreview/${idReview}`);
        return response;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}
