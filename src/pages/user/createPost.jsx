import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePosts, DeletePost } from "../../services/publicPost";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify"; // Giả định dùng react-toastify để thông báo
Modal.setAppElement("#root"); // Đặt root element cho modal (cần điều chỉnh theo cấu trúc app của bạn)

const CreatePost = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        thumbnail: null,
        tags: [],
        contents: [{ type: "text", value: "", orderIndex: 1, file: null }],
    });
    const [tagInput, setTagInput] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false); // State để điều khiển modal
    const [newPost, setNewPost] = useState(null); // Lưu thông tin bài viết vừa tạo

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


        const response = await CreatePosts(postData);
        if (response.code === 200) {
            setNewPost(response.res); // Lưu thông tin bài viết vừa tạo
            setModalIsOpen(true); // Mở modal
        }
    };

    const handleEdit = () => {
        // Chuyển đến trang chỉnh sửa (chưa triển khai, bạn có thể tạo EditPost component)
        navigate(`/edit-post/${newPost.id}`);
        setModalIsOpen(false); // Đóng modal sau khi chuyển trang
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
            const response = await DeletePost(newPost.id);
            if (response.code === 200) {
                toast.success("Xóa bài viết thành công!");
                setModalIsOpen(false); // Đóng modal sau khi xóa
            }
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        navigate("/profile"); // Chuyển về danh sách bài viết sau khi đóng modal
    };

    return (
        <div className="page-content">
            <div className="container">
                <nav className="breadcrumb-nav">
                    <div className="container">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/">Trang</a></li>
                            <li className="breadcrumb-item"><a href="/bai-viet-cua-toi">Blog</a></li>
                            <li className="breadcrumb-item active">Tạo bài viết mới</li>
                        </ol>
                    </div>
                </nav>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <h2 className="page-header-title">Tạo bài viết mới</h2>
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
                                    required
                                />
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
                                                    required
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
                                Tạo bài viết
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal hiển thị bài viết vừa tạo */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                    content: {
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        marginRight: "-50%",
                        transform: "translate(-50%, -50%)",
                        width: "80%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    },
                }}
            >
                {newPost && (
                    <div>
                        <h2>{newPost.name}</h2>
                        <p><strong>Tác giả:</strong> {newPost.createdBy} - <strong>Ngày tạo:</strong> {new Date(newPost.createdDate).toLocaleDateString()}</p>
                        <img src={newPost.thumbnail} alt={newPost.name} style={{ maxWidth: "100%", height: "auto" }} />
                        <p>{newPost.description}</p>
                        <div>
                            <strong>Tags:</strong> {newPost.tags.map((tag, index) => (
                                <span key={index} className="badge bg-primary mr-1">{tag}</span>
                            ))}
                        </div>
                        <div>
                            <strong>Nội dung:</strong>
                            {newPost.contents.sort((a, b) => a.orderIndex - b.orderIndex).map((content, index) => (
                                <div key={index} className="mb-3">
                                    {content.type === "text" ? (
                                        <p>{content.value}</p>
                                    ) : (
                                        <img src={content.value} alt={`Content ${index}`} style={{ maxWidth: "100%", height: "auto" }} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3">

                            <button className="btn btn-danger mr-2" onClick={handleDelete}>
                                Xóa
                            </button>
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


        </div>
    );
};

export default CreatePost;