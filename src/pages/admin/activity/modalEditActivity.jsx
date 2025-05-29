
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCategory } from '../../../services/Admin/Categories';
import { useState, useEffect } from 'react';
import { EditActivity } from '../../../services/Admin/Activity';



const ModalEditActivity = ({ show, handleClose, activity, onEditSuccess }) => {
    const [formData, setFormData] = useState({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        categoryId: String(activity?.categoryId || ''), // Chuyển thành chuỗi
        file: ''
    });

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const listCategory = async () => {
        setLoadingCategories(true);
        try {
            const response = await getCategory();
            setCategories(response.data.res); // response giờ là mảng danh mục

        } catch (error) {
            toast.error(error.message);
            console.error('Lỗi khi lấy danh sách danh mục:', error);
        } finally {
            setLoadingCategories(false);
        }
    };
    // Gộp handleChange và handleInputChange thành một hàm
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    useEffect(() => {
        if (show) {
            console.log('Gọi listCategory');
            listCategory();
            setFormData({
                id: activity?.id || '',
                name: activity?.name || '',
                description: activity?.description || '',
                categoryId: String(activity?.categoryId || ''),
                file: null,
            });
        }
    }, [show, activity]);
    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Xử lý chọn file
    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    };


    const handleSubmit = async () => {
        if (!formData.categoryId) {
            toast.error('Vui lòng chọn danh mục!');
            return;
        }
        try {
            const activityRequest = {
                name: formData.name,
                description: formData.description,
                category_id: formData.categoryId
            };

            await EditActivity(formData.id, activityRequest, formData.file);

            onEditSuccess();
            toast.success("Tạo hoạt động thành công!");
            handleClose(); // Đóng modal
            setFormData(null); // Reset form
        } catch (error) {
            const errorMessage = error.message || "Đã có lỗi xảy ra khi tạo danh mục";
            toast.error(errorMessage);
        }


    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa hoạt động</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label htmlFor="categoryId">ID danh mục</label>
                        <input
                            type="text"
                            className="form-control"
                            id="categoryId"
                            defaultValue={formData.id}
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
                    <div className="mb-3">
                        <label htmlFor="categoryId" className="form-label">Danh mục</label>
                        <select
                            className="form-select"
                            id="categoryId" // Sửa id để khớp với formData
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                            disabled={loadingCategories}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {loadingCategories && <p className="text-muted mt-1">Đang tải danh mục...</p>}
                        {!loadingCategories && categories.length === 0 && (
                            <p className="text-danger mt-1">Không có danh mục nào</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryImage">Ảnh danh mục hiện tại</label>
                        <div className="text-center">
                            <img
                                id="categoryImage"
                                src={activity.imageUrl}
                                alt={activity.name}
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
                <Button variant="primary" onClick={handleSubmit} >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEditActivity;