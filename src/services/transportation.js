import { toast } from "react-toastify";
import apiClient from "./apiClient"

export const GetAlltransportation = async () => {
    try {
        const response = await apiClient.get("/admin/transportation");
        return response.data.res;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}