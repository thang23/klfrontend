import { toast } from "react-toastify";
import apiClient from "../apiClient";

export const CreateReviewLocation = async (ratingData) => {
    console.log("Creating review for location:", ratingData);
    try {
        const response = await apiClient.post('/api/locationReview/create', ratingData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
}