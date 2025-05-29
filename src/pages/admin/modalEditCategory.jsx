import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UpdateCategory } from '../../services/Admin/Categories';

const ModalEditCategory = ({ show, handleClose, category, onEditSuccess }) => {
    // State để quản lý dữ liệu form
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        file: null, // File ảnh mới
    });

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Xử lý chọn file
    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    // Hàm cập nhật category
    const updateCategory = async () => {
        try {
            // 1. Nếu có file ảnh mới, upload ảnh trước
            let imageUrl = category.imageUrl;


            // 2. Cập nhật thông tin category
            const categoryData = {
                name: formData.name,
                description: formData.description,
                imageUrl: imageUrl, // Sử dụng URL mới nếu có, hoặc giữ nguyên URL cũ
            };

            await UpdateCategory(category.id, categoryData, formData.file);

            await onEditSuccess(); // Gọi lại API để lấy danh sách mới
            toast.success("Category update successful");
            handleClose();

        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label htmlFor="categoryId">ID danh mục</label>
                        <input
                            type="text"
                            className="form-control"
                            id="categoryId"
                            defaultValue={category?.id || ''}
                            readOnly
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name} // Sử dụng value thay vì defaultValue để quản lý state
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryImage">Ảnh danh mục hiện tại</label>
                        <div className="text-center">
                            <img
                                id="categoryImage"
                                src={category.imageUrl}
                                alt="Ảnh danh mục"
                                style={{ maxWidth: "200px", height: "auto" }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="formFile">Chọn ảnh mới (nếu muốn thay đổi)</label>
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
                <Button variant="primary" onClick={updateCategory}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEditCategory;