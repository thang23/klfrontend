import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateActivity } from '../../../services/Admin/Activity';
import { getCategory } from '../../../services/Admin/Categories';
import { useState, useEffect } from 'react';


const BASE_URL = "http://localhost:8080";


const ModalCreateActivity = ({ show, handleClose, onEditSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        file: null
    });

    const listCategory = async () => {
        setLoadingCategories(true);
        try {
            const response = await getCategory();
            setCategories(response.data.res); // response giờ là mảng danh mục

        } catch (error) {
            toast.error('Lỗi khi lấy danh sách danh mục');
            console.error('Lỗi khi lấy danh sách danh mục:', error);
        } finally {
            setLoadingCategories(false);
        }
    };
    useEffect(() => {
        if (show) {
            console.log('Gọi listCategory');
            listCategory();
        }
    }, [show]);
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
            toast.error("Vui lòng nhập tên hoạt động!");
            return;
        }
        try {
            const categoryRequest = {
                name: formData.name,
                description: formData.description,
                category_id: formData.category_id
            };

            const response = await CreateActivity(categoryRequest, formData.file);
            if (response) {
                onEditSuccess();
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
                <Modal.Title>Tạo hoạt động</Modal.Title>
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
                    <select
                        className="form-select"
                        id="category_id"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        disabled={loadingCategories} // Vô hiệu hóa khi đang tải
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

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

export default ModalCreateActivity;