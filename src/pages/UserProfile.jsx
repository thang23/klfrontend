import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, uploadImagePost } from "../services/User/userService";
import { GetPostsByUserId, UpdatePost, DeletePost, getAllPostsByUser, getPostByIdAll } from "../services/publicPost";
import Modal from "react-modal";

Modal.setAppElement('#root');

const PAGE_SIZE = 6;

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: "",
        name: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        imageAvatar: "",
        currentPassword: "",
        newPassword: "",
        username: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [editPostModal, setEditPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [contentFiles, setContentFiles] = useState([]);

    const fetchUserProfile = async () => {

        try {
            setLoadingUser(true);
            const response = await getUserProfile();
            if (response.code === 200) {
                const { id, name, email, phoneNumber, dateOfBirth, imageAvatar, username } = response.res;
                if (!id) {
                    throw new Error("ID người dùng không hợp lệ!");
                }
                setUser({
                    id: id || "",
                    name: name || "",
                    username: username || "",
                    email: email || "",
                    phoneNumber: phoneNumber || "",
                    dateOfBirth: dateOfBirth || "",
                    imageAvatar: imageAvatar || "",
                    currentPassword: "",
                    newPassword: "",


                });

            } else {
                setError(response.message);
                toast.error(response.message);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError("Không thể tải thông tin người dùng. Vui lòng thử lại!");
            toast.error("Lỗi khi tải thông tin người dùng.");
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchUserPosts = async () => {
        if (!user.id) return;
        try {
            setLoadingPosts(true);
            const response = await getAllPostsByUser(user.id);
            if (response.code === 200 && Array.isArray(response.res)) {
                setPosts(response.res);
            } else {
                setPosts([]);
                toast.error("Dữ liệu bài viết không hợp lệ!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài viết:", error);
            toast.error("Không thể tải danh sách bài viết!");
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    const openEditModal = (post) => {
        setSelectedPost(post || { id: null, name: "", description: "", tags: [], contents: [] });
        setContentFiles(new Array((post?.contents || []).length).fill(null));
        setThumbnailFile(null);
        setEditPostModal(true);
    };

    const handleSavePost = async (e) => {
        e.preventDefault();
        if (!selectedPost || !selectedPost.id || !user.id) return;

        try {
            // Upload thumbnail nếu có file mới
            let thumbnailUrl = selectedPost.thumbnail || "";
            if (thumbnailFile) {
                const formData = new FormData();
                formData.append("typeEntity", "post");
                formData.append("file", thumbnailFile);
                const uploadResponse = await uploadImagePost(formData);
                if (uploadResponse.code === 200) {
                    // eslint-disable-next-line no-unused-vars
                    thumbnailUrl = uploadResponse.res;
                } else {
                    throw new Error("Upload ảnh thumbnail thất bại: " + uploadResponse.message);
                }
            }

            // Upload ảnh cho từng content nếu có file mới
            const updatedContents = await Promise.all(
                (selectedPost.contents || []).map(async (content, index) => {
                    if (content.type === "image" && contentFiles[index]) {
                        const formData = new FormData();
                        formData.append("typeEntity", "post_content");
                        formData.append("file", contentFiles[index]);
                        const uploadResponse = await uploadImagePost(formData);
                        if (uploadResponse.code === 200) {
                            return { ...content, value: uploadResponse.res };
                        } else {
                            throw new Error("Upload ảnh nội dung thất bại: " + uploadResponse.message);
                        }
                    }
                    return content;
                })
            );

            const updatedPostData = {
                name: selectedPost.name || "",
                description: selectedPost.description || "",
                userId: user.id, // Thêm userId từ state user
                tags: selectedPost.tags || [],
                contents: updatedContents.map((content) => ({
                    type: content.type || "text",
                    value: content.value || "",
                    caption: content.caption || "",
                    orderIndex: content.orderIndex || 0,
                })),
            };



            const response = await UpdatePost(selectedPost.id, updatedPostData);
            if (response.code === 200) {
                toast.success("Cập nhật bài viết thành công!");
                setEditPostModal(false);
                fetchUserPosts();
            } else {
                throw new Error(response.message || "Cập nhật bài viết thất bại!");
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật bài viết: " + error.message);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user.id) fetchUserPosts();
    }, [user.id]);

    useEffect(() => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setDisplayedPosts(posts.slice(start, end));
        setTotalPages(Math.ceil(posts.length / PAGE_SIZE) || 1);
    }, [posts, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ảnh đại diện không được lớn hơn 5MB!");
                return;
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Vui lòng chọn một file ảnh!");
                return;
            }
            setAvatarFile(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingUser(true);
        try {
            let updatedUser = { ...user };
            if (avatarFile) {
                const formData = new FormData();
                formData.append("typeEntity", "user");
                formData.append("file", avatarFile);
                const uploadResponse = await uploadImagePost(formData);
                if (uploadResponse.code === 200) {
                    updatedUser.imageAvatar = uploadResponse.res;
                    setUser((prev) => ({ ...prev, imageAvatar: uploadResponse.res }));
                } else {
                    throw new Error("Upload ảnh thất bại: " + uploadResponse.message);
                }
            }
            const requestData = {
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                dateOfBirth: updatedUser.dateOfBirth,
                imageAvatar: updatedUser.imageAvatar,
                currentPassword: updatedUser.currentPassword,
                newPassword: updatedUser.newPassword,
            };
            if (updatedUser.newPassword && !updatedUser.currentPassword) {
                throw new Error("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới!");
            }
            const response = await updateUserProfile(requestData);
            if (response.code === 200) {
                toast.success("Cập nhật thông tin thành công!");
                setEditMode(false);
                setAvatarFile(null);
                setUser((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
            } else {
                setError(response.message);
                toast.error(response.message);
            }
        } catch (err) {
            setError(err.message || "Cập nhật thông tin thất bại. Vui lòng thử lại!");
            toast.error(err.message || "Lỗi khi cập nhật thông tin.");
        } finally {
            setLoadingUser(false);
        }
    };

    const handleUpdatePost = async (postId) => {
        try {
            const response = await getPostByIdAll(postId);
            if (response.code === 200 && response.res) {
                openEditModal(response.res);
            } else {
                toast.error("Không thể lấy chi tiết bài viết: " + response.message);
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết bài viết:", error);
            toast.error("Lỗi khi tải thông tin bài viết!");
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
            try {
                const response = await DeletePost(postId);
                if (response.code === 200) {
                    toast.success("Xóa bài viết thành công!");
                    fetchUserPosts();
                } else {
                    toast.error(response.message || "Xóa bài viết thất bại!");
                }
            } catch (error) {
                toast.error("Lỗi khi xóa bài viết: " + error.message);
            }
        }
    };

    const handlePrevious = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
                    <a className="page-link" href="#" onClick={() => setPage(i)}>
                        {i + 1}
                    </a>
                </li>
            );
        }
        return pageNumbers;
    };

    const addNewContent = () => {
        const newContent = {
            type: "text",
            value: "",
            caption: "",
            orderIndex: (selectedPost.contents || []).length + 1,
        };
        setSelectedPost({
            ...selectedPost,
            contents: [...(selectedPost.contents || []), newContent],
        });
        setContentFiles([...contentFiles, null]);
    };

    const removeContent = (index) => {
        const newContents = (selectedPost.contents || []).filter((_, i) => i !== index);
        const newContentFiles = contentFiles.filter((_, i) => i !== index);
        setSelectedPost({ ...selectedPost, contents: newContents });
        setContentFiles(newContentFiles);
    };

    const handleContentFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ảnh nội dung không được lớn hơn 5MB!");
                return;
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Vui lòng chọn một file ảnh!");
                return;
            }
            const newContentFiles = [...contentFiles];
            newContentFiles[index] = file;
            setContentFiles(newContentFiles);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div
                className="page-header text-center mb-4"
                style={{
                    backgroundImage: "url('https://cdn.eva.vn/upload/2-2024/images/2024-05-17/image_oaf1638238969-1715916816-479-width1600height900.jpg')",
                    padding: "50px 0",
                    borderRadius: "8px",
                }}
            >
                <div className="container">
                    <h1 className="page-title text-white">
                        Hồ sơ <span className="text-primary">{user.name || "Người dùng"}</span>
                    </h1>
                </div>
            </div>

            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-4">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Hồ sơ
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="dashboard row">
                    <aside className="col-md-4 col-lg-3 mb-4">
                        <ul className="nav nav-dashboard flex-column mb-3 mb-md-0" role="tablist">
                            <li className="nav-item">
                                <a
                                    className="nav-link active"
                                    id="tab-profile-link"
                                    data-toggle="tab"
                                    href="#tab-profile"
                                    role="tab"
                                    aria-controls="tab-profile"
                                    aria-selected="true"
                                >
                                    Thông tin cá nhân
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="tab-posts-link"
                                    data-toggle="tab"
                                    href="#tab-posts"
                                    role="tab"
                                    aria-controls="tab-posts"
                                    aria-selected="false"
                                >
                                    Bài viết của tôi
                                </a>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/create-posts" role="tab">
                                    Đăng bài viết
                                </Link>
                            </li>
                        </ul>
                    </aside>

                    <div className="col-md-8 col-lg-9">
                        <div className="tab-content">
                            <div
                                className="tab-pane fade show active"
                                id="tab-profile"
                                role="tabpanel"
                                aria-labelledby="tab-profile-link"
                            >
                                <div className="row mb-4">
                                    <div className="col-12 text-center">
                                        {user.imageAvatar ? (
                                            <img
                                                src={user.imageAvatar}
                                                alt="Avatar"
                                                className="rounded-circle"
                                                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                style={{ width: "150px", height: "150px", fontSize: "50px", color: "#ccc" }}
                                            >
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                        <h3 className="mt-3">{user.username || "Người dùng"}</h3>
                                    </div>
                                </div>

                                {loadingUser ? (
                                    <div className="loading text-center" style={{ padding: "20px" }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                        <p>Đang tải thông tin...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger" role="alert">{error}</div>
                                ) : (
                                    <form onSubmit={handleUpdateProfile} className="card card-dashboard p-4">
                                        <div className="card-body">
                                            <h3 className="card-title mb-4">Thông tin cá nhân</h3>
                                            {!editMode && (
                                                <button
                                                    className="btn btn-primary float-end mb-3"
                                                    onClick={() => setEditMode(true)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                            )}
                                            <div className="mb-3">
                                                <label className="form-label">Họ tên</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={user.name}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    required
                                                    minLength={3}
                                                    maxLength={50}
                                                    placeholder="Nhập tên người dùng"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={user.email}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    required
                                                    placeholder="Nhập email"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phoneNumber"
                                                    value={user.phoneNumber || ""}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    placeholder="Nhập số điện thoại (bắt đầu bằng 0, 10-11 số)"
                                                    pattern="^0[0-9]{9,10}$"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="dateOfBirth"
                                                    value={user.dateOfBirth || ""}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    max={new Date().toISOString().split("T")[0]}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Ảnh đại diện</label>
                                                {editMode ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                        />
                                                        {avatarFile && (
                                                            <div className="mt-2">
                                                                <small>Ảnh đã chọn: {avatarFile.name}</small>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={user.imageAvatar || ""}
                                                        disabled
                                                        placeholder="URL ảnh đại diện"
                                                    />
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Mật khẩu hiện tại (nhập nếu muốn đổi mật khẩu)</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="currentPassword"
                                                    value={user.currentPassword}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Mật khẩu mới (để trống nếu không đổi)</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="newPassword"
                                                    value={user.newPassword}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                                                    minLength={8}
                                                />
                                            </div>
                                            {editMode && (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success"
                                                        disabled={loadingUser}
                                                    >
                                                        {loadingUser && (
                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                        )}
                                                        Lưu thay đổi
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setEditMode(false);
                                                            setAvatarFile(null);
                                                            setUser((prev) => ({
                                                                ...prev,
                                                                currentPassword: "",
                                                                newPassword: "",
                                                            }));
                                                        }}
                                                        disabled={loadingUser}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div
                                className="tab-pane fade"
                                id="tab-posts"
                                role="tabpanel"
                                aria-labelledby="tab-posts-link"
                            >
                                {loadingPosts ? (
                                    <div className="loading text-center" style={{ padding: "20px" }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                        <p>Đang tải bài viết...</p>
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="card card-dashboard p-4">
                                        <div className="card-body text-center">
                                            <p>Bạn chưa có bài viết nào.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {displayedPosts.map((post) => (
                                            <article key={post.id} className="entry entry-list mb-4 p-3 border rounded">
                                                <div className="row align-items-center">
                                                    <div className="col-md-5">
                                                        <figure className="entry-media">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    navigate(`/bai-viet/${post.id}`);
                                                                }}
                                                            >
                                                                <img
                                                                    src={post.thumbnail || "https://via.placeholder.com/150"}
                                                                    alt={post.name}
                                                                    className="img-fluid rounded"
                                                                />
                                                            </a>
                                                        </figure>
                                                    </div>
                                                    <div className="col-md-7">
                                                        <div className="entry-body">
                                                            <div className="entry-meta mb-2">
                                                                <span className="entry-author">
                                                                    by{" "}
                                                                    <Link to={`/profile/${post.user.id}`}>
                                                                        {post.user.name}
                                                                    </Link>
                                                                </span>
                                                                <span className="meta-separator"> | </span>
                                                                <span>{post.published ? "Đã duyệt" : "Chưa duyệt"}</span>
                                                                <span className="meta-separator"> | </span>
                                                                <a href="#">{post.commentCount} Comments</a>
                                                            </div>
                                                            <h2 className="entry-title mb-2">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        navigate(`/bai-viet/${post.id}`);
                                                                    }}
                                                                >
                                                                    {post.name}
                                                                </a>
                                                            </h2>
                                                            <div className="entry-cats mb-2">
                                                                in{" "}
                                                                {post.tags.length > 0 ? (
                                                                    post.tags.map((tag, index) => (
                                                                        <span key={index}>
                                                                            <a href="#" className="text-decoration-none">
                                                                                {tag}
                                                                            </a>
                                                                            {index < post.tags.length - 1 && ", "}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <a href="#" className="text-decoration-none">Không có tag</a>
                                                                )}
                                                            </div>
                                                            <div className="entry-content">
                                                                <p>
                                                                    {post.description.length > 100
                                                                        ? `${post.description.substring(0, 100)}...`
                                                                        : post.description}
                                                                </p>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-warning btn-sm"
                                                                        onClick={() => handleUpdatePost(post.id)}
                                                                    >
                                                                        Sửa
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleDeletePost(post.id)}
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}

                                        {posts.length > 0 && (
                                            <nav aria-label="Page navigation" className="mt-4">
                                                <ul className="pagination justify-content-center">
                                                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                                                        <a
                                                            className="page-link page-link-prev"
                                                            href="#"
                                                            onClick={handlePrevious}
                                                            aria-label="Previous"
                                                        >
                                                            <span aria-hidden="true">
                                                                <i className="icon-long-arrow-left"></i>
                                                            </span>
                                                            Prev
                                                        </a>
                                                    </li>
                                                    {renderPageNumbers()}
                                                    <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                                                        <a
                                                            className="page-link page-link-next"
                                                            href="#"
                                                            onClick={handleNext}
                                                            aria-label="Next"
                                                        >
                                                            Next{" "}
                                                            <span aria-hidden="true">
                                                                <i className="icon-long-arrow-right"></i>
                                                            </span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </nav>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={editPostModal}
                onRequestClose={() => setEditPostModal(false)}
                style={{
                    content: {
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        marginRight: "-50%",
                        transform: "translate(-50%, -50%)",
                        width: "800px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: "30px",
                    },
                }}
                contentLabel="Edit Post Modal"
            >
                <h2 className="mb-4">Chỉnh sửa bài viết</h2>
                {selectedPost && (
                    <form onSubmit={handleSavePost}>
                        <div className="mb-3">
                            <label className="form-label">Tiêu đề</label>
                            <input
                                type="text"
                                className="form-control"
                                value={selectedPost.name || ""}
                                onChange={(e) => setSelectedPost({ ...selectedPost, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={selectedPost.description || ""}
                                onChange={(e) => setSelectedPost({ ...selectedPost, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Tags (cách nhau bởi dấu phẩy)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={(selectedPost.tags || []).join(", ") || ""}
                                onChange={(e) => setSelectedPost({ ...selectedPost, tags: e.target.value.split(", ").filter(tag => tag) })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Thumbnail</label>
                            <div className="mb-2">
                                {selectedPost.thumbnail && !thumbnailFile ? (
                                    <img
                                        src={selectedPost.thumbnail}
                                        alt="Thumbnail"
                                        style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                                    />
                                ) : thumbnailFile ? (
                                    <img
                                        src={URL.createObjectURL(thumbnailFile)}
                                        alt="Thumbnail Preview"
                                        style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                                    />
                                ) : null}
                            </div>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                            toast.error("Ảnh thumbnail không được lớn hơn 5MB!");
                                            return;
                                        }
                                        if (!file.type.startsWith("image/")) {
                                            toast.error("Vui lòng chọn một file ảnh!");
                                            return;
                                        }
                                        setThumbnailFile(file);
                                    }
                                }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nội dung</label>
                            {(selectedPost.contents || []).map((content, index) => (
                                <div key={index} className="mb-3 border p-3 rounded position-relative">
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm position-absolute"
                                        style={{ top: "10px", right: "10px" }}
                                        onClick={() => removeContent(index)}
                                    >
                                        Xóa
                                    </button>
                                    <div className="mb-2">
                                        <label className="form-label">Loại nội dung</label>
                                        <select
                                            className="form-control"
                                            value={content.type || "text"}
                                            onChange={(e) => {
                                                const newContents = [...(selectedPost.contents || [])];
                                                newContents[index] = { ...newContents[index], type: e.target.value, value: "" };
                                                setSelectedPost({ ...selectedPost, contents: newContents });
                                            }}
                                        >
                                            <option value="text">Text</option>
                                            <option value="image">Image</option>
                                        </select>
                                    </div>
                                    {content.type === "image" ? (
                                        <>
                                            <div className="mb-2">
                                                {content.value && !contentFiles[index] ? (
                                                    <img
                                                        src={content.value}
                                                        alt={`Content ${index}`}
                                                        style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                                                    />
                                                ) : contentFiles[index] ? (
                                                    <img
                                                        src={URL.createObjectURL(contentFiles[index])}
                                                        alt={`Content Preview ${index}`}
                                                        style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                                                    />
                                                ) : null}
                                            </div>
                                            <input
                                                type="file"
                                                className="form-control mb-2"
                                                accept="image/*"
                                                onChange={(e) => handleContentFileChange(index, e)}
                                            />
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Chú thích (caption)"
                                                value={content.caption || ""}
                                                onChange={(e) => {
                                                    const newContents = [...(selectedPost.contents || [])];
                                                    newContents[index] = { ...newContents[index], caption: e.target.value };
                                                    setSelectedPost({ ...selectedPost, contents: newContents });
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <textarea
                                            className="form-control"
                                            placeholder="Nội dung văn bản"
                                            value={content.value || ""}
                                            onChange={(e) => {
                                                const newContents = [...(selectedPost.contents || [])];
                                                newContents[index] = { ...newContents[index], value: e.target.value };
                                                setSelectedPost({ ...selectedPost, contents: newContents });
                                            }}
                                            rows="3"
                                        />
                                    )}
                                    <div className="mt-2">
                                        <label className="form-label">Thứ tự</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={content.orderIndex || 0}
                                            onChange={(e) => {
                                                const newContents = [...(selectedPost.contents || [])];
                                                newContents[index] = { ...newContents[index], orderIndex: parseInt(e.target.value) || 0 };
                                                setSelectedPost({ ...selectedPost, contents: newContents });
                                            }}
                                            placeholder="Thứ tự"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-primary mb-3"
                                onClick={addNewContent}
                            >
                                Thêm nội dung
                            </button>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-success">Lưu</button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditPostModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default UserProfile;