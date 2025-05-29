import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateLocationType } from '../../../services/Admin/locationType';


const ModalCreateLocationType = ({ show, handleClose, onEditSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

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

            const response = await CreateLocationType(locationTypeRequest);
            if (response) {
                await onEditSuccess();
                toast.success("Tạo loại địa điểm thành công!");
                handleClose();
                setFormData({ name: '', description: '' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Đã có lỗi xảy ra khi tạo loại địa điểm";
            toast.error(errorMessage);
            console.error("Lỗi trong handleSubmit:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Tạo loại địa điểm mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Tên</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Mô tả</label>
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
                    Lưu
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCreateLocationType;