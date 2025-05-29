import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCachedData, setCachedData, clearCache } from "../../../utils/cacheUtils";
import { DeleteLocation, GetAllLocations } from "../../../services/Admin/location";
import ModalCreateLocation from "./ModalCreateLocation";
import ModalEditLocation from "./ModalUpdateLocation";
import ModalDetailLocation from "./ModalLocationDetail";

const Location = () => {
    const CACHE_KEY = "location_cache";
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [displayedLocations, setDisplayedLocations] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [filterType, setFilterType] = useState("name");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editModalInfo, setEditModalInfo] = useState({ show: false, location: null });
    const [detailModalInfo, setDetailModalInfo] = useState({ show: false, id: null });

    const fetchLocations = async () => {
        const cachedData = getCachedData(CACHE_KEY);

        if (cachedData && Array.isArray(cachedData)) {
            setLocations(cachedData);
            setFilteredLocations(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await GetAllLocations();
            if (res.data.res && Array.isArray(res.data.res)) {
                setLocations(res.data.res);
                setFilteredLocations(res.data.res);
                setCachedData(CACHE_KEY, res.data.res);
            } else {
                setLocations([]);
                setFilteredLocations([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách địa điểm:", error);
            toast.error("Không thể tải danh sách địa điểm. Vui lòng thử lại!");
            setLocations([]);
            setFilteredLocations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // clearCache(CACHE_KEY); // Xóa cache khi tải lại
        fetchLocations();
    }, []);

    useEffect(() => {
        // Lọc locations
        if (!filter.trim()) {
            setFilteredLocations(locations);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = locations.filter((item) => {
                switch (filterType) {
                    case "name":
                        return item.name?.toLowerCase().includes(lowerFilter);
                    case "address":
                        return item.address?.toLowerCase().includes(lowerFilter);
                    default:
                        return false;
                }
            });
            setFilteredLocations(filtered);
        }
        setPage(0); // Reset về trang đầu khi lọc
    }, [filter, filterType, locations]);

    useEffect(() => {
        // Phân trang sau lọc
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedLocations(filteredLocations.slice(start, end));
        setTotalPages(Math.ceil(filteredLocations.length / pageSize) || 1);
    }, [filteredLocations, page, pageSize]);

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

    const startEntry = displayedLocations.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedLocations.length;
    const showingText = `Showing ${startEntry} to ${endEntry} of ${filteredLocations.length} entries`;

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

    // Xóa địa điểm (giả định có API DeleteLocation)
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
        try {
            const response = await DeleteLocation(id);
            if (response.code === 200) {
                // Lọc địa điểm vừa xóa khỏi state
                const updatedLocations = locations.filter((location) => location.id !== id);
                setLocations(updatedLocations);

                // Cập nhật filteredLocations
                const updatedFilteredLocations = filteredLocations.filter((location) => location.id !== id);
                setFilteredLocations(updatedFilteredLocations);

                // Cập nhật phân trang
                const totalItems = updatedFilteredLocations.length;
                const newTotalPages = Math.ceil(totalItems / pageSize) || 1;

                // Nếu trang hiện tại vượt quá số trang mới, giảm page
                if (page >= newTotalPages) {
                    setPage(newTotalPages - 1);
                } else {
                    // Cập nhật displayedLocations cho trang hiện tại
                    const start = page * pageSize;
                    const end = start + pageSize;
                    setDisplayedLocations(updatedFilteredLocations.slice(start, end));
                    setTotalPages(newTotalPages);
                }

                // Xóa cache
                clearCache(CACHE_KEY);
                toast.success("Xóa địa điểm thành công!");
            } else {
                throw new Error(response.data?.message || "Xóa địa điểm thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa địa điểm:", error);
            toast.error(error.message || "Không thể xóa địa điểm!");
        }
    };

    // Mở modal edit
    const handleEdit = (location) => {
        setEditModalInfo({ show: true, location: location });
    };

    const handleCloseEdit = () => {
        setEditModalInfo({ show: false, location: null });
    };

    // Mở modal detail
    const handleDetail = (id) => {
        console.log("check id " + id);
        setDetailModalInfo({ show: true, id });
    };

    const handleCloseDetail = () => {
        setDetailModalInfo({ show: false, id: null });
    };

    // Xóa cache sau khi cập nhật
    const handleEditSuccess = async () => {
        clearCache(CACHE_KEY);
        await fetchLocations();
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Danh sách địa điểm</h1>
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
                        <option value="name">Tên</option>
                        <option value="address">Địa chỉ</option>
                    </select>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <button type="button" onClick={handleCreate} className="btn btn-success">
                        Tạo địa điểm
                    </button>
                    <ModalCreateLocation
                        show={showCreateModal}
                        handleClose={handleCloseCreate}
                        onEditSuccess={handleEditSuccess}
                    />
                </div>
                {loading ? (
                    <div className="text-center py-4">
                        <p>Đang tải...</p>
                    </div>
                ) : displayedLocations.length === 0 ? (
                    <div className="text-center py-4">
                        <p>Không tìm thấy địa điểm.</p>
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
                                        <th>Tính phí(VND)</th>
                                        <th>Địa chỉ</th>
                                        <th>Các hoạt động</th>
                                        <th>Loại địa điểm</th>
                                        <th>Cấp độ</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedLocations.map((location, index) => (
                                        <tr key={location.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{location.id}</td>
                                            <td>{location.name}</td>
                                            <td>{location.price ?? 'Miễn phí'}</td>
                                            <td title={location.address}>
                                                {location.address?.length > 40
                                                    ? location.address.substring(0, 40) + "..."
                                                    : location.address || "N/A"}
                                            </td>
                                            <td>
                                                {location.activities?.length > 0
                                                    ? location.activities.map((act) => act.name).join(", ")
                                                    : "Không có hoạt động"}
                                            </td>
                                            <td>
                                                {location.locationTypes?.length > 0
                                                    ? location.locationTypes.map((type) => type.name).join(", ")
                                                    : "Không có loại địa điểm"}
                                            </td>
                                            <td>{location.difficultyLevel}</td>

                                            <td className="text-center">
                                                <div className="d-inline-flex justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDetail(location.id)}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(location.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => handleEdit(location)}
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

            {/* Modal chi tiết */}
            {detailModalInfo.id && (
                // Giả định bạn sẽ thêm ModalDetailLocation sau
                <ModalDetailLocation
                    show={detailModalInfo.show}
                    handleClose={handleCloseDetail}
                    id={detailModalInfo.id}
                />
            )}

            {/* Modal chỉnh sửa */}
            {editModalInfo.location && (
                // Giả định bạn sẽ thêm ModalEditLocation sau
                <ModalEditLocation
                    show={editModalInfo.show}
                    handleClose={handleCloseEdit}
                    location={editModalInfo.location}
                    onEditSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default Location;