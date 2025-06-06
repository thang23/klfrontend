import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../../services/publicPost";
import { ToastContainer, toast } from "react-toastify";

const EditPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        thumbnail: null,
        tags: [],
        contents: [{ type: "text", value: "", orderIndex: 1, file: null }],
    });
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await getPostById(postId);
                setFormData({
                    name: post.name,
                    description: post.description,
                    thumbnail: null, // Không tải lại file, chỉ URL
                    tags: post.tags,
                    contents: post.contents.map((content) => ({
                        type: content.type,
                        value: content.value,
                        orderIndex: content.orderIndex,
                        file: null, // Không tải lại file, chỉ URL
                    })),
                });
            } catch (error) {
                toast.error("Lấy thông tin bài viết thất bại: " + error.message);
            }
        };
        fetchPost();
    }, [postId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleThumbnailChange = (e) => {
        setFormData({ ...formData, thumbnail: e.target.files[0] });
    };

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()],
            });
            setTagInput("");
        }
    };

    const removeTag = (index) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, i) => i !== index),
        });
    };

    const handleContentChange = (index, field, value) => {
        const newContents = [...formData.contents];
        newContents[index] = { ...newContents[index], [field]: value };
        setFormData({ ...formData, contents: newContents });
    };

    const handleContentFileChange = (index, e) => {
        const newContents = [...formData.contents];
        newContents[index] = { ...newContents[index], file: e.target.files[0] };
        setFormData({ ...formData, contents: newContents });
    };

    const addContent = () => {
        setFormData({
            ...formData,
            contents: [
                ...formData.contents,
                {
                    type: "text",
                    value: "",
                    orderIndex: formData.contents.length + 1,
                    file: null,
                },
            ],
        });
    };

    const removeContent = (index) => {
        setFormData({
            ...formData,
            contents: formData.contents
                .filter((_, i) => i !== index)
                .map((content, i) => ({ ...content, orderIndex: i + 1 })),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const postData = {
            name: formData.name,
            description: formData.description,
            tags: formData.tags,
            thumbnail: formData.thumbnail,
            contents: formData.contents,
        };

        try {
            const response = await updatePost(postId, postData);
            toast.success("Cập nhật bài viết thành công!");
            navigate(`/post/${postId}`); // Chuyển về trang chi tiết sau khi cập nhật
        } catch (error) {
            toast.error("Cập nhật bài viết thất bại: " + error.message);
        }
    };

    return (
        <div className="page-content">
            <div className="container">
                <nav className="breadcrumb-nav">
                    <div className="container">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/">Trang</a></li>
                            <li className="breadcrumb-item"><a href="/bai-viet-cua-toi">Blog</a></li>
                            <li className="breadcrumb-item active">Chỉnh sửa bài viết</li>
                        </ol>
                    </div>
                </nav>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <h2 className="page-header-title">Chỉnh sửa bài viết</h2>
                        <form onSubmit={handleSubmit} className="mb-6">
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                    Tiêu đề<span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="description">
                                    Mô tả
                                </label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="thumbnail">
                                    Thumbnail<span className="text-danger">*</span>
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="thumbnail"
                                    onChange={handleThumbnailChange}
                                />
                                {formData.thumbnail && <p>Hiện tại: {formData.thumbnail.name || "Không có file"}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="tags">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="tags"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Nhập tag và nhấn Enter"
                                />
                                <div className="tag-container mt-2">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="tag-item mr-2">
                                            {tag}
                                            <button
                                                type="button"
                                                className="btn-remove-tag"
                                                onClick={() => removeTag(index)}
                                            >
                                                <i className="icon-close"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nội dung</label>
                                {formData.contents.map((content, index) => (
                                    <div key={index} className="content-block mb-4 p-3 border rounded">
                                        <div className="form-group">
                                            <label className="form-label">Loại nội dung</label>
                                            <select
                                                className="form-control"
                                                value={content.type}
                                                onChange={(e) =>
                                                    handleContentChange(index, "type", e.target.value)
                                                }
                                            >
                                                <option value="text">Text</option>
                                                <option value="image">Image</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                {content.type === "text" ? "Nội dung" : "File ảnh"}
                                                <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                value={content.value}
                                                onChange={(e) =>
                                                    handleContentChange(index, "value", e.target.value)
                                                }
                                                rows="3"
                                                required={content.type === "text"}
                                                disabled={content.type === "image"}
                                            ></textarea>
                                            {content.type === "image" && (
                                                <input
                                                    type="file"
                                                    className="form-control mt-2"
                                                    onChange={(e) => handleContentFileChange(index, e)}
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeContent(index)}
                                            disabled={formData.contents.length === 1}
                                        >
                                            <i className="icon-trash"></i> Xóa nội dung
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline-primary-2 btn-sm mb-4"
                                    onClick={addContent}
                                >
                                    <i className="icon-plus"></i> Thêm nội dung
                                </button>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Cập nhật bài viết
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default EditPost;