import { useEffect, useState } from "react";
import { toast } from "react-toastify";;

import ModalDetailPost from "./ModalDetailPost";
import { deletePost, getAllPosts, togglePostStatus } from "../../../services/Admin/postService";
import { clearCache } from "../../../utils/cacheUtils";

const PostManagement = () => {
    const [activeTab, setActiveTab] = useState("all"); // Tab hiện tại: "all" hoặc "unapproved"
    const [allPosts, setAllPosts] = useState([]);
    const [unapprovedPosts, setUnapprovedPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [filterType, setFilterType] = useState("title");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;
    const [detailModalInfo, setDetailModalInfo] = useState({ show: false, id: null });

    const fetchPosts = async () => {
        setLoading(true);
        try {
            clearCache('posts_cache');
            const allPostsRes = await getAllPosts();
            if (allPostsRes.code === 200 && Array.isArray(allPostsRes.res)) {
                setAllPosts(allPostsRes.res);
                if (activeTab === "all") setFilteredPosts(allPostsRes.res);
            } else {
                setUnapprovedPosts([]);
                if (activeTab === "unapproved") setFilteredPosts([]);
                toast.error("Dữ liệu bài viết chưa duyệt không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài viết:", error);
            toast.error("Không thể tải danh sách bài viết. Vui lòng thử lại!");
            setAllPosts([]);
            setUnapprovedPosts([]);
            setFilteredPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (activeTab === "all") {
            setFilteredPosts(allPosts);
        } else {
            setFilteredPosts(unapprovedPosts);
        }
        setPage(0);
    }, [activeTab, allPosts, unapprovedPosts]);

    useEffect(() => {
        // Lọc posts
        const dataSource = activeTab === "all" ? allPosts : unapprovedPosts;
        if (!filter.trim()) {
            setFilteredPosts(dataSource);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = dataSource.filter((item) => {
                switch (filterType) {
                    case "title":
                        return item.title?.toLowerCase().includes(lowerFilter);
                    case "description":
                        return item.description?.toLowerCase().includes(lowerFilter);
                    default:
                        return false;
                }
            });
            setFilteredPosts(filtered);
        }
        setPage(0);
    }, [filter, filterType, allPosts, unapprovedPosts, activeTab]);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedPosts(filteredPosts.slice(start, end));
        setTotalPages(Math.ceil(filteredPosts.length / pageSize) || 1);
    }, [filteredPosts, page, pageSize]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const handlePrevious = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const startEntry = displayedPosts.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedPosts.length;
    const showingText = `Showing ${startEntry} to ${endEntry} of ${filteredPosts.length} entries`;

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
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={`btn mx-1 ${page === i ? "btn-primary" : "btn-outline-primary"}`}
                    disabled={page === i}
                >
                    {i + 1}
                </button>
            );
        }
        return pageNumbers;
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
        try {
            const response = await deletePost(id);
            if (response.code === 200) {
                const updatedAllPosts = allPosts.filter((post) => post.id !== id);
                const updatedUnapprovedPosts = unapprovedPosts.filter((post) => post.id !== id);
                setAllPosts(updatedAllPosts);
                setUnapprovedPosts(updatedUnapprovedPosts);
                const updatedFilteredPosts = filteredPosts.filter((post) => post.id !== id);
                setFilteredPosts(updatedFilteredPosts);
                const totalItems = updatedFilteredPosts.length;
                const newTotalPages = Math.ceil(totalItems / pageSize) || 1;
                if (page >= newTotalPages) {
                    setPage(newTotalPages - 1);
                } else {
                    const start = page * pageSize;
                    const end = start + pageSize;
                    setDisplayedPosts(updatedFilteredPosts.slice(start, end));
                    setTotalPages(newTotalPages);
                }
                toast.success("Xóa bài viết thành công!");
            } else {
                throw new Error(response.data?.message || "Xóa bài viết thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            toast.error(error.message || "Không thể xóa bài viết!");
        }
    };

    const handleToggleStatus = async (id, isPublished) => {
        const action = isPublished ? "ẩn" : "phê duyệt";
        if (!window.confirm(`Bạn có chắc muốn ${action} bài viết này?`)) return;
        try {
            const response = await togglePostStatus(id, !isPublished); // Đảo trạng thái
            if (response.code === 200) {
                await fetchPosts(); // Tải lại toàn bộ dữ liệu từ server
                toast.success(response.message || `${action} bài viết thành công!`);
            } else {
                throw new Error(response.message || "Thay đổi trạng thái bài viết thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái bài viết:", error);
            toast.error(error.message || "Không thể thay đổi trạng thái bài viết!");
        }
    };

    const handleDetail = (id) => {
        setDetailModalInfo({ show: true, id });
    };

    const handleCloseDetail = () => {
        setDetailModalInfo({ show: false, id: null });
    };



    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Quản lý bài đăng</h1>
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả bài viết
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "unapproved" ? "active" : ""}`}
                        onClick={() => setActiveTab("unapproved")}
                    >
                        Bài viết chưa duyệt
                    </button>
                </li>
            </ul>

            <div className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={filter}
                        onChange={handleFilterChange}
                    />
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={handleFilterTypeChange}
                    >
                        <option value="title">Tiêu đề</option>
                        <option value="description">Mô tả</option>
                    </select>
                </div>
            </div>

            <div className="card shadow mb-4">

                {loading ? (
                    <div className="text-center py-4">
                        <p>Đang tải...</p>
                    </div>
                ) : displayedPosts.length === 0 ? (
                    <div className="text-center py-4">
                        <p>Không tìm thấy bài viết.</p>
                    </div>
                ) : (
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>ID</th>
                                        <th>Tiêu đề</th>
                                        <th>Mô tả</th>
                                        <th>Lượt xem</th>
                                        <th>Đã phê duyệt</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedPosts.map((post, index) => (
                                        <tr key={post.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{post.id}</td>
                                            <td>{post.title}</td>
                                            <td title={post.description}>
                                                {post.description?.length > 40
                                                    ? post.description.substring(0, 40) + "..."
                                                    : post.description || "N/A"}
                                            </td>
                                            <td>{post.views}</td>
                                            <td>{post.published ? "Có" : "Chưa"}</td>
                                            <th className="text-center">
                                                <div className="d-inline-flex justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDetail(post.id)}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(post.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn ${post.published ? "btn-warning" : "btn-success"}`}
                                                        onClick={() => handleToggleStatus(post.id, post.published)}
                                                    >
                                                        {post.published ? "Ẩn" : "Phê duyệt"}
                                                    </button>

                                                </div>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div className="text-muted">{showingText}</div>
                                <div>
                                    <button
                                        onClick={handlePrevious}
                                        disabled={page === 0}
                                        className="btn btn-outline-primary mx-1"
                                    >
                                        Previous
                                    </button>
                                    {renderPageNumbers()}
                                    <button
                                        onClick={handleNext}
                                        disabled={page >= totalPages - 1}
                                        className="btn btn-outline-primary mx-1"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {detailModalInfo.id && (
                <ModalDetailPost
                    show={detailModalInfo.show}
                    handleClose={handleCloseDetail}
                    id={detailModalInfo.id}
                />
            )}

            {/* {editModalInfo.post !== undefined && (
                <ModalEditPost
                    show={editModalInfo.show}
                    handleClose={handleCloseEdit}
                    post={editModalInfo.post}
                    onEditSuccess={handleEditSuccess}
                />
            )} */}
        </div>
    );
};

export default PostManagement;