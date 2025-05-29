import { toast } from "react-toastify";
import apiClient from "./apiClient"
import { DeleteImage, UploadImage } from '../services/uploadImage';
export const GetNewPost = async () => {
    console.log("Fetching new posts...");
    try {
        const response = await apiClient.get('/api/post/newpost');
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message);

    }
}

export const GetPostById = async (id) => {
    try {
        const response = await apiClient.get(`/api/post/byid/${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lấy chi tiết bài viết.");
        throw error;
    }
}

export const getPostByIdAll = async (id) => {
    try {
        const response = await apiClient.get(`/api/post/byidall/${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lấy chi tiết bài viết.");
        throw error;
    }
}
export const GetPostPublic = async () => {
    try {
        const response = await apiClient.get('/api/post/public');
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message);
        throw error;
    }
}

export const countComments = (comments) => {
    let count = comments.length;
    comments.forEach(comment => {
        if (comment.replies) {
            count += comment.replies.length;
        }
    });
    return count;
}

export const GetPostViewTop = async () => {
    try {
        const response = await apiClient.get('/api/post/viewtop');
        return response.data;
    } catch (error) {
        toast.error(error.response.data.message);
    }
}

export const GetPostSearch = async (keyword) => {
    try {
        const response = await apiClient.get("/api/post/search", {
            params: { keyword: keyword },
        });

        return response.data; // Giả định backend trả về { code, res }
    } catch (error) {
        console.error("Lỗi khi gọi API search:", error);
        toast.error(error.response?.data?.message || "Lỗi khi tìm kiếm bài viết");
        return { code: 500, res: [] }; // Trả về đối tượng mặc định khi lỗi
    }
};
export const UploadImagePost = async (typeEntity, file) => {
    try {
        const formData = new FormData();
        formData.append("typeEntity", typeEntity);
        formData.append("file", file);
        const response = await apiClient.post("/upload/uploadPost", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Đảm bảo gửi đúng định dạng
            },
        });
        console.log("API upload post response:", response.data);
        if (response.data.code === 200) {
            toast.success(response.data.message || "Upload ảnh thành công!");
            return response.data;
        } else {
            throw new Error(response.data.message || "Upload ảnh thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi gọi API upload ảnh:", error.message, error.response?.data);
        toast.error(error.response?.data?.message || "Không thể upload ảnh!");
        throw error; // Ném lỗi để CreatePosts xử lý
    }
}


export const CreatePosts = async (postData) => {
    try {
        // Bước 1: Upload thumbnail nếu có
        let thumbnailUrl = null;
        if (postData.thumbnail) {
            const thumbnailResponse = await UploadImagePost("post", postData.thumbnail);
            thumbnailUrl = thumbnailResponse.res; // Lấy URL từ response
        }

        // Bước 2: Upload contents loại image nếu có và cập nhật value
        const updatedContents = await Promise.all(postData.contents.map(async (content) => {
            if (content.type === "image" && content.file) {
                const contentResponse = await UploadImagePost("post_content", content.file);
                return { ...content, value: contentResponse.res }; // Cập nhật value với URL
            }
            return content; // Giữ nguyên content type text
        }));

        // Bước 3: Tạo bài viết với URL ảnh
        const postDataToSend = {
            name: postData.name,
            description: postData.description,
            tags: postData.tags,
            thumbnail: thumbnailUrl,
            contents: updatedContents,
        };
        console.log("Gọi API tạo bài viết...", postDataToSend);
        const response = await apiClient.post("/api/post/create", postDataToSend);
        console.log("API create post response:", response.data);

        if (response.data.code === 200) {
            toast.success(response.data.message || "Tạo bài viết thành công!");
            return response.data;
        } else {
            throw new Error(response.data.message || "Tạo bài viết thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi gọi API tạo bài viết:", error.message, error.response?.data);
        toast.error(error.response?.data?.message || "Không thể tạo bài viết!");
        return { code: 500, message: "Không thể tạo bài viết!" };
    }
};

// Hàm UpdatePost (cần thêm vào file services/publicPost.js)
export const UpdatePost = async (postId, postData) => {
    try {
        let thumbnailUrl = null;
        if (postData.thumbnail) {
            const thumbnailResponse = await UploadImagePost("post", postData.thumbnail);
            thumbnailUrl = thumbnailResponse.res;
        }

        const updatedContents = await Promise.all(
            postData.contents.map(async (content) => {
                if (content.type === "image" && content.file) {
                    const contentResponse = await UploadImagePost("post_content", content.file);
                    return { ...content, value: contentResponse.res };
                }
                return content;
            })
        );

        const postDataToSend = {
            name: postData.name,
            description: postData.description,
            tags: postData.tags,
            thumbnail: thumbnailUrl || postData.thumbnail, // Giữ nguyên nếu không upload mới
            contents: updatedContents,
        };

        const response = await apiClient.put(`/api/post/update/${postId}`, postDataToSend);
        if (response.data.code === 200) {

            return response.data;
        } else {
            throw new Error(response.data.message || "Cập nhật bài viết thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi gọi API cập nhật bài viết:", error.message, error.response?.data);
        toast.error(error.response?.data?.message || "Không thể cập nhật bài viết!");
        throw error;
    }
};
export const GetPostsByUserId = async (userid) => {

    try {
        const response = await apiClient.get(`/api/post/userid/${userid}`);

        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message);
    }
}

export const DeletePost = async (postid) => {
    try {
        const response = await apiClient.delete(`/api/post/delete/${postid}`);

        return response.data;
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message);
    }
}

export const getAllPostsByUser = async (userid) => {

    try {
        const response = await apiClient.get(`/api/post/user/${userid}`);

        return response.data;
    } catch (error) {
        console.log(error);

    }
}