import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { DeleteActivity, GetActivity } from "../../services/Admin/Activity";
import { getCachedData, setCachedData, clearCache } from "../../utils/cacheUtils";
import ModalCreateActivity from "./activity/modalCreateActivity";
import ModalEditActivity from "./activity/modalEditActivity";
import ModalDetailActivity from "./activity/modalActivityDetail";

const Activity = () => {
    const CACHE_KEY = "activity_cache";
    const pageSize = 6;

    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [displayedActivities, setDisplayedActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editModalInfo, setEditModalInfo] = useState({ show: false, activity: null });
    const [detailModalInfo, setDetailModalInfo] = useState({ show: false, id: null });

    const fetchActivities = async () => {
        const cachedData = getCachedData(CACHE_KEY);
        if (cachedData && Array.isArray(cachedData)) {
            console.log("Using cached data");
            setActivities(cachedData);
            setFilteredActivities(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Calling GetAllActivity");
            const res = await GetActivity();
            console.log("API response:", res.data);
            if (res.data.res && Array.isArray(res.data.res)) {
                setActivities(res.data.res);
                setFilteredActivities(res.data.res);
                setCachedData(CACHE_KEY, res.data.res);
            } else {
                setActivities([]);
                setFilteredActivities([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hoạt động:", error);
            toast.error("Không thể tải danh sách hoạt động. Vui lòng thử lại!");
            setActivities([]);
            setFilteredActivities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        if (!filter.trim()) {
            setFilteredActivities(activities);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = activities.filter(item =>
                item.name?.toLowerCase().includes(lowerFilter)
            );
            setFilteredActivities(filtered);
        }
        setPage(0);
    }, [filter, activities]);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedActivities(filteredActivities.slice(start, end));
        setTotalPages(Math.ceil(filteredActivities.length / pageSize) || 1);
    }, [filteredActivities, page, pageSize]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
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

    const startEntry = displayedActivities.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedActivities.length;
    const showingText = `Showing ${startEntry} to ${endEntry} of ${filteredActivities.length} entries`;

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

    const handleCreate = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreate = () => {
        setShowCreateModal(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa hoạt động này?")) return;
        try {
            const response = await DeleteActivity(id);
            toast.success(response.message);
            clearCache(CACHE_KEY);
            await fetchActivities();
        } catch (error) {
            console.error("Lỗi khi xóa hoạt động:", error);
            toast.error(error.message);
        }
    };

    const handleEdit = (activity) => {
        setEditModalInfo({ show: true, activity });
    };

    const handleCloseEdit = () => {
        setEditModalInfo({ show: false, activity: null });
    };

    const handleDetail = (id) => {
        console.log("check id:", id);
        setDetailModalInfo({ show: true, id });
    };

    const handleCloseDetail = () => {
        setDetailModalInfo({ show: false, id: null });
    };

    const handleEditSuccess = async () => {
        clearCache(CACHE_KEY);
        await fetchActivities();
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Danh sách hoạt động</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên..."
                    value={filter}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <button type="button" onClick={handleCreate} className="btn btn-success">
                        Tạo mới hoạt động
                    </button>
                    <ModalCreateActivity
                        show={showCreateModal}
                        handleClose={handleCloseCreate}
                        onEditSuccess={handleEditSuccess}
                    />
                </div>
                {loading ? (
                    <div className="text-center">
                        <p>Đang tải...</p>
                    </div>
                ) : displayedActivities.length === 0 ? (
                    <div className="text-center">
                        <p>Không tìm thấy hoạt động nào.</p>
                    </div>
                ) : (
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>ID</th>
                                        <th>Tên</th>
                                        <th>Mô tả</th>
                                        <th>Loại danh mục</th>
                                        <th className="text-center">Ảnh</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedActivities.map((c, index) => (
                                        <tr key={c.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{c.id}</td>
                                            <td>{c.name}</td>
                                            <td title={c.description}>
                                                {c.description?.length > 40
                                                    ? c.description.substring(0, 40) + "..."
                                                    : c.description}
                                            </td>
                                            <td>{c.categoryId}</td>
                                            <td className="text-center">
                                                {c.imageUrl ? (
                                                    <img
                                                        src={c.imageUrl}
                                                        alt={c.name}
                                                        style={{ width: "70px", height: "auto" }}
                                                    />
                                                ) : (
                                                    "No image"
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-inline-flex justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDetail(c.id)}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(c.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => handleEdit(c)}
                                                    >
                                                        Sửa
                                                    </button>
                                                </div>
                                            </td>
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
                <ModalDetailActivity
                    show={detailModalInfo.show}
                    handleClose={handleCloseDetail}
                    id={detailModalInfo.id}
                />
            )}

            {editModalInfo.activity && (
                <ModalEditActivity
                    show={editModalInfo.show}
                    handleClose={handleCloseEdit}
                    activity={editModalInfo.activity}
                    onEditSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default Activity;