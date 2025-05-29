import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import ModalCreateLocationType from "./ModalCreateLocationType";
import { clearCache, getCachedData, setCachedData } from "../../../utils/cacheUtils";
import { DeleteLocationType, GetAllLocationType } from "../../../services/Admin/locationType";
import ModalEditLocationType from "./ModalEditLocationType";

const LocationType = () => {
    const CACHE_KEY = "locationType_cache";

    const pageSize = 6;

    const [locationTypes, setLocationTypes] = useState([]);
    const [filteredLocationTypes, setFilteredLocationTypes] = useState([]);
    const [displayedLocationTypes, setDisplayedLocationTypes] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editModalInfo, setEditModalInfo] = useState({ show: false, locationType: null });

    const fetchLocationTypes = async () => {
        const cachedData = getCachedData(CACHE_KEY);
        if (cachedData && Array.isArray(cachedData)) {
            console.log("Using cached data");
            setLocationTypes(cachedData);
            setFilteredLocationTypes(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Calling GetAllLocationType");
            const res = await GetAllLocationType();
            console.log("API response:", res);
            console.log("API response:", res.data);
            if (res.data.res && Array.isArray(res.data.res)) {
                setLocationTypes(res.data.res);
                setFilteredLocationTypes(res.data.res);
                setCachedData(CACHE_KEY, res.data.res);
            } else {
                setLocationTypes([]);
                setFilteredLocationTypes([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại địa điểm:", error);
            toast.error("Không thể tải danh sách loại địa điểm. Vui lòng thử lại!");
            setLocationTypes([]);
            setFilteredLocationTypes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationTypes();
    }, []);

    useEffect(() => {
        if (!filter.trim()) {
            setFilteredLocationTypes(locationTypes);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = locationTypes.filter(item =>
                item.name?.toLowerCase().includes(lowerFilter)
            );
            setFilteredLocationTypes(filtered);
        }
        setPage(0);
    }, [filter, locationTypes]);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedLocationTypes(filteredLocationTypes.slice(start, end));
        setTotalPages(Math.ceil(filteredLocationTypes.length / pageSize) || 1);
    }, [filteredLocationTypes, page, pageSize]);

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

    const startEntry = displayedLocationTypes.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedLocationTypes.length;
    const showingText = `Showing ${startEntry} to ${endEntry} of ${filteredLocationTypes.length} entries`;

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
        if (!window.confirm("Bạn có chắc muốn xóa loại địa điểm này?")) return;
        try {
            await DeleteLocationType(id);
            toast.success("Xóa loại địa điểm thành công");
            clearCache(CACHE_KEY);
            await fetchLocationTypes();
        } catch (error) {
            console.error("Lỗi khi xóa loại địa điểm:", error);
            toast.error(error.message || "Không thể xóa loại địa điểm!");
        }
    };

    const handleEdit = (locationType) => {
        setEditModalInfo({ show: true, locationType });
    };

    const handleCloseEdit = () => {
        setEditModalInfo({ show: false, locationType: null });
    };


    const handleEditSuccess = async () => {
        clearCache(CACHE_KEY);
        await fetchLocationTypes();
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Danh sách loại địa điểm</h1>
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
                        Tạo loại địa điểm
                    </button>
                    <ModalCreateLocationType
                        show={showCreateModal}
                        handleClose={handleCloseCreate}
                        onEditSuccess={handleEditSuccess}
                    />
                </div>
                {loading ? (
                    <div className="text-center">
                        <p>Đang tải...</p>
                    </div>
                ) : displayedLocationTypes.length === 0 ? (
                    <div className="text-center">
                        <p>Không tìm thấy loại địa điểm nào.</p>
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
                                        <th>Người tạo</th>
                                        <th>Ngày tạo</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedLocationTypes.map((c, index) => (
                                        <tr key={c.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{c.id}</td>
                                            <td>{c.name}</td>
                                            <td title={c.description}>
                                                {c.description?.length > 40
                                                    ? c.description.substring(0, 40) + "..."
                                                    : c.description}
                                            </td>
                                            <td>{c.createdBy}</td>
                                            <td>{new Date(c.createdDate).toLocaleString()}</td>
                                            <td className="text-center">
                                                <div className="d-inline-flex justify-content-center gap-2">

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

            {editModalInfo.locationType && (
                <ModalEditLocationType
                    show={editModalInfo.show}
                    handleClose={handleCloseEdit}
                    locationType={editModalInfo.locationType}
                    onEditSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default LocationType;