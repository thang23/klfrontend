import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateCategory } from '../../services/Admin/Categories';


const BASE_URL = "http://localhost:8080";


const ModalCreateCategory = ({ show, handleClose, onEditSuccess }) => {

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        file: null
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            file: e.target.files[0]
        }));
    };
    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Please enter category name!");
            return;
        }

        try {
            const categoryRequest = {
                name: formData.name,
                description: formData.description
            };

            const response = await CreateCategory(categoryRequest, formData.file);
            if (response) {
                await onEditSuccess();
                toast.success("Tạo danh mục thành công!");
                handleClose(); // Đóng modal
                setFormData({ name: '', description: '', file: null }); // Reset form
            }
        } catch (error) {
            const errorMessage = error.message || "Đã có lỗi xảy ra khi tạo danh mục";
            toast.error(errorMessage);
            console.error("Lỗi trong handleSubmit:", error);
        }


    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>

                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name}
                            onChange={handleChange} required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}

                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formFile">Chọn ảnh (nếu muốn thay đổi)</label>
                        <input
                            type="file"
                            className="form-control"
                            id="formFile"
                            onChange={handleFileChange}
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCreateCategory;