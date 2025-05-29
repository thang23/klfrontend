import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { getUserProfileById } from "../../../services/User/userService";

const ModalDetailUser = ({ show, handleClose, id }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUserDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await getUserProfileById(id);
            if (response.code === 200 && response.res) {
                setUser(response.res);
            } else {
                throw new Error(response.message || "Không thể tải chi tiết người dùng!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết người dùng:", error);
            toast.error(error.message || "Không thể tải chi tiết người dùng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchUserDetails();
        }
    }, [show, id]);

    // Hàm định dạng ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "Không có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <p>Đang tải...</p>
                ) : user ? (
                    <div>
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Tên đăng nhập:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Số điện thoại:</strong> {user.phoneNumber || "Không có"}</p>
                        <p><strong>Ngày sinh:</strong> {formatDate(user.dateOfBirth)}</p>
                        <p>
                            <strong>Ảnh đại diện:</strong>{" "}
                            {user.imageAvatar ? (
                                <img
                                    src={user.imageAvatar}
                                    alt="Ảnh đại diện"
                                    style={{ maxWidth: "100px", borderRadius: "5px" }}
                                    onError={(e) => (e.target.src = "https://via.placeholder.com/100?text=Không+tải+được")}
                                />
                            ) : (
                                "Không có"
                            )}
                        </p>
                        <p><strong>Trạng thái:</strong> {user.enabled ? "Đã kích hoạt" : "Bị khóa"}</p>
                    </div>
                ) : (
                    <p>Không tìm thấy thông tin người dùng.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalDetailUser;