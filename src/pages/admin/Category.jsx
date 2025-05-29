import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { getCachedData, setCachedData, clearCache } from "../../utils/cacheUtils";
import ModalEditCategory from "./modalEditCategory";
import ModalCreateCategory from "./modalCreateCategory";
import { DeleteCategory, getCategory } from "../../services/Admin/Categories";

const Category = () => {
    const CACHE_KEY = "category_cache";

    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [filterType, setFilterType] = useState("name");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editModalInfo, setEditModalInfo] = useState({ show: false, category: null });

    const fetchCategories = async () => {
        const cachedData = getCachedData(CACHE_KEY);
        if (cachedData && Array.isArray(cachedData)) {
            console.log("Using cached data");
            setCategories(cachedData);
            setFilteredCategories(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Calling getAllCategories");
            const res = await getCategory();
            console.log("API response:", res.data);
            if (res.data.res && Array.isArray(res.data.res)) {
                setCategories(res.data.res);
                setFilteredCategories(res.data.res);
                setCachedData(CACHE_KEY, res.data.res);
            } else {
                setCategories([]);
                setFilteredCategories([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
            toast.error("Không thể tải danh mục. Vui lòng thử lại!");
            setCategories([]);
            setFilteredCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!filter.trim()) {
            setFilteredCategories(categories);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = categories.filter(item => {
                switch (filterType) {
                    case "name":
                        return item.name?.toLowerCase().includes(lowerFilter);
                    case "description":
                        return item.description?.toLowerCase().includes(lowerFilter);
                    default:
                        return false;
                }
            });
            setFilteredCategories(filtered);
        }
        setPage(0);
    }, [filter, filterType, categories]);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedCategories(filteredCategories.slice(start, end));
        setTotalPages(Math.ceil(filteredCategories.length / pageSize) || 1);
    }, [filteredCategories, page, pageSize]);

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

    const startEntry = displayedCategories.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedCategories.length;
    const showingText = `Showing ${startEntry} to ${endEntry} of ${filteredCategories.length} entries`;

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
        if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        try {
            await DeleteCategory(id);
            toast.success("Xóa danh mục thành công");
            clearCache(CACHE_KEY);
            await fetchCategories();
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
            toast.error(error.message);
        }
    };

    const handleEdit = (category) => {
        setEditModalInfo({ show: true, category });
    };

    const handleCloseEdit = () => {
        setEditModalInfo({ show: false, category: null });
    };


    const handleEditSuccess = async () => {
        clearCache(CACHE_KEY);
        await fetchCategories();
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Danh sách danh mục</h1>
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
                        <option value="description">Mô tả</option>
                    </select>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <button type="button" onClick={handleCreate} className="btn btn-success">
                        Tạo danh mục
                    </button>
                    <ModalCreateCategory
                        show={showCreateModal}
                        handleClose={handleCloseCreate}
                        onEditSuccess={handleEditSuccess}
                    />
                </div>
                {loading ? (
                    <div className="text-center">
                        <p>Đang tải...</p>
                    </div>
                ) : displayedCategories.length === 0 ? (
                    <div className="text-center">
                        <p>Không tìm thấy danh mục nào.</p>
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
                                        <th className="text-center">Ảnh</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedCategories.map((c, index) => (
                                        <tr key={c.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{c.id}</td>
                                            <td>{c.name}</td>
                                            <td title={c.description}>
                                                {c.description?.length > 40
                                                    ? c.description.substring(0, 40) + "..."
                                                    : c.description}
                                            </td>
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



            {editModalInfo.category && (
                <ModalEditCategory
                    show={editModalInfo.show}
                    handleClose={handleCloseEdit}
                    category={editModalInfo.category}
                    onEditSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default Category;