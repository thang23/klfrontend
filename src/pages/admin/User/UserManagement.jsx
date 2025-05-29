import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalDetailUser from "./ModalDetailUser";
import { deleteUser, getAllUser, toggleUserEnabled } from "../../../services/Admin/user";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("");
    const [filterType, setFilterType] = useState("username");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;
    const [detailModalInfo, setDetailModalInfo] = useState({ show: false, id: null });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUser();
            if (response.code === 200 && response.res) {
                setUsers(response.res);
                setFilteredUsers(response.res);
            } else {
                throw new Error(response.message || "Không thể lấy danh sách người dùng");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            toast.error("Không thể tải danh sách người dùng. Vui lòng thử lại!");
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Lọc users
        if (!filter.trim()) {
            setFilteredUsers(users);
        } else {
            const lowerFilter = filter.toLowerCase();
            const filtered = users.filter((user) => {
                switch (filterType) {
                    case "username":
                        return user.username?.toLowerCase().includes(lowerFilter);
                    case "email":
                        return user.email?.toLowerCase().includes(lowerFilter);
                    case "phoneNumber":
                        return user.phoneNumber?.toLowerCase().includes(lowerFilter) || false;
                    default:
                        return false;
                }
            });
            setFilteredUsers(filtered);
        }
        setPage(0);
    }, [filter, filterType, users]);

    useEffect(() => {
        // Phân trang sau lọc
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedUsers(filteredUsers.slice(start, end));
        setTotalPages(Math.ceil(filteredUsers.length / pageSize) || 1);
    }, [filteredUsers, page, pageSize]);

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

    const startEntry = displayedUsers.length > 0 ? page * pageSize + 1 : 0;
    const endEntry = page * pageSize + displayedUsers.length;
    const showingText = `Hiển thị ${startEntry} đến ${endEntry} của ${filteredUsers.length} mục`;

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

    const handleDetail = (id) => {
        setDetailModalInfo({ show: true, id });
    };

    const handleCloseDetail = () => {
        setDetailModalInfo({ show: false, id: null });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
        try {
            const response = await deleteUser(id);
            if (response.code === 200) {
                const updatedUsers = users.filter((user) => user.id !== id);
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);
                const totalItems = updatedUsers.length;
                const newTotalPages = Math.ceil(totalItems / pageSize) || 1;
                if (page >= newTotalPages) {
                    setPage(newTotalPages - 1);
                } else {
                    const start = page * pageSize;
                    const end = start + pageSize;
                    setDisplayedUsers(updatedUsers.slice(start, end));
                    setTotalPages(newTotalPages);
                }
                toast.success("Xóa người dùng thành công!");
            } else {
                throw new Error(response.message || "Xóa người dùng thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            toast.error(error.message || "Không thể xóa người dùng!");
        }
    };

    const handleToggleEnabled = async (id, enabled) => {
        if (!window.confirm(`Bạn có chắc muốn ${enabled ? "khóa" : "mở khóa"} tài khoản này?`)) return;
        try {
            const response = await toggleUserEnabled(id, !enabled);
            if (response.code === 200) {
                const updatedUsers = users.map((user) =>
                    user.id === id ? { ...user, enabled: !enabled } : user
                );
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);
                toast.success(`${enabled ? "Khóa" : "Mở khóa"} tài khoản thành công!`);
            } else {
                throw new Error(response.message || "Cập nhật trạng thái tài khoản thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
            toast.error(error.message || "Không thể cập nhật trạng thái tài khoản!");
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Quản lý người dùng</h1>
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
                        <option value="username">Tên đăng nhập</option>
                        <option value="email">Email</option>
                        <option value="phoneNumber">Số điện thoại</option>
                    </select>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <p>Đang tải...</p>
                        </div>
                    ) : displayedUsers.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Không tìm thấy người dùng.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>ID</th>
                                        <th>Tên đăng nhập</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUsers.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{page * pageSize + index + 1}</td>
                                            <td>{user.id}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phoneNumber || "Không có"}</td>
                                            <td>{user.enabled ? "Đã kích hoạt" : "Bị khóa"}</td>
                                            <td className="text-center">
                                                <div className="d-inline-flex justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDetail(user.id)}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn ${user.enabled ? "btn-warning" : "btn-success"}`}
                                                        onClick={() => handleToggleEnabled(user.id, user.enabled)}
                                                    >
                                                        {user.enabled ? "Khóa" : "Mở khóa"}
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
                                        Trước
                                    </button>
                                    {renderPageNumbers()}
                                    <button
                                        onClick={handleNext}
                                        disabled={page >= totalPages - 1}
                                        className="btn btn-outline-primary mx-1"
                                    >
                                        Tiếp
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {detailModalInfo.id && (
                <ModalDetailUser
                    show={detailModalInfo.show}
                    handleClose={handleCloseDetail}
                    id={detailModalInfo.id}
                />
            )}
        </div>
    );
};

export default UserManagement;