import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { UpdateLocationType } from '../../../services/Admin/locationType';


const ModalEditLocationType = ({ show, handleClose, locationType, onEditSuccess }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: ''
    });

    useEffect(() => {
        if (show && locationType) {
            console.log('Cập nhật formData với locationType:', locationType);
            setFormData({
                id: locationType.id || '',
                name: locationType.name || '',
                description: locationType.description || ''
            });
        }
    }, [show, locationType]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Vui lòng nhập tên loại địa điểm!");
            return;
        }

        try {
            const locationTypeRequest = {
                name: formData.name,
                description: formData.description
            };
            await UpdateLocationType(formData.id, locationTypeRequest);
            toast.success("Cập nhật loại địa điểm thành công!");
            await onEditSuccess();
            handleClose();
            setFormData({ id: '', name: '', description: '' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Đã có lỗi xảy ra khi cập nhật loại địa điểm";
            toast.error(errorMessage);
            console.error("Lỗi trong handleSubmit:", error);
        }
    };

    if (!locationType) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa loại địa điểm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group mb-3">
                        <label htmlFor="id">ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="id"
                            value={formData.id}
                            readOnly
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="name">Tên loại địa điểm</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            className="form-control"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Lưu thay đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEditLocationType;