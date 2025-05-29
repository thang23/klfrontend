import { toast } from "react-toastify";
import apiClient from "../apiClient"

export const GetLocationUser = async () => {
    try {
        const response = await apiClient.get("/api/location/");
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
};

export const GetLocationType = async () => {
    try {
        const response = await apiClient.get("/api/location/locationtype");
        console.log("chekc ", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}

export const GetActitivyUser = async () => {
    try {
        const response = await apiClient.get("api/location/activity");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}

export const GetLocationById = async (locationId) => {
    console.log(locationId);
    try {
        const response = await apiClient.get(`/api/location/${locationId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}

export const GetLocationByCategory = async (id) => {
    console.log(id);
    try {
        const response = await apiClient.get(`/api/location/bycategory/${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}
