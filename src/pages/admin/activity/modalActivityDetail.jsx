import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getActivityDetail } from '../../../services/Admin/Activity';



const ModalDetailActivity = ({ show, id, handleClose }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivityDetail = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getActivityDetail(id);
            setActivity(response);
        } catch (error) {
            setError(error.message || "Lỗi khi lấy chi tiết hoạt động");
            toast.error(error.message || "Lỗi khi lấy chi tiết hoạt động");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && id != null) {
            fetchActivityDetail();
        }
    }, [show, id]);

    const renderRow = (label, content) => (
        <div className="mb-2 d-flex">
            <strong style={{ minWidth: "140px" }}>{label}:</strong>
            <span>{content}</span>
        </div>
    );

    const renderDate = (date) =>
        date ? new Date(date).toLocaleString() : "Không có dữ liệu";

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết hoạt động</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <p>Đang tải...</p>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : !activity ? (
                    <p>Không có dữ liệu để hiển thị</p>
                ) : (
                    <>
                        {renderRow("ID", activity.id || "Không có dữ liệu")}
                        {renderRow("Tên hoạt động", activity.name || "Không có dữ liệu")}
                        {renderRow("Người tạo", activity.createdBy || "Không có dữ liệu")}
                        {renderRow("Ngày tạo", renderDate(activity.createdDate))}
                        {renderRow("Người sửa", activity.modifiedBy || "Không có dữ liệu")}
                        {renderRow("Ngày sửa", renderDate(activity.modifiedDate))}
                        {renderRow("Mô tả", activity.description || "Không có dữ liệu")}
                        {renderRow("Danh mục", activity.categoryDTO?.name || "Không có dữ liệu")}
                        <div className="mb-2 d-flex align-items-start">
                            <strong style={{ minWidth: "140px" }}>Ảnh:</strong>
                            {activity.imageUrl ? (
                                <div>
                                    <img className='center'
                                        src={activity.imageUrl}
                                        alt={activity.name}
                                        style={{ maxWidth: "200px", height: "auto" }}
                                    />
                                </div>
                            ) : (
                                <span>Không có ảnh</span>
                            )}
                        </div>
                    </>
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

export default ModalDetailActivity;
