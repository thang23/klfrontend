import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { GetActivity } from '../../../services/Admin/Activity';
import { AddActivity } from '../../../services/Admin/location';



// Modal phụ để loại địa điểm
const ModalAddActivity = ({ show, idLocation, handleClose, onEditSuccess }) => {
    const [activity, Setactivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    if (!idLocation) {
        return;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [formData, setFormData] = useState({
        id: ''
    });
    //

    const fetchActivity = async () => {
        setLoadingActivity(true);
        try {
            const response = await GetActivity();
            const fetchedTypes = response.data.res;
            Setactivity(fetchedTypes);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Không thể tải danh sách loại hoạt động!');
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };


    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (show) {
            fetchActivity();
            setFormData({
                id: ''
            });
        }
    }, [show]);

    const handleSubmit = async () => {
        if (!formData.id) {
            toast.error('Vui lòng chọn loại hoạt độngđộng!');
            return;
        }


        const response = await AddActivity(idLocation, formData.id);
        onEditSuccess();
        toast.success(response.data.message);
        handleClose();
        setFormData({
            id: '',
        });

    };

    return (
        <Modal show={show} onHide={handleClose} size="m">
            <Modal.Header closeButton>
                <Modal.Title>Thêm hoạt độngđộng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form >
                    <div className="form-group mb-3">
                        <label htmlFor="type_id">Loại hoạt động</label>
                        <select
                            className="form-select"
                            id="id"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            disabled={loadingActivity}
                        >
                            <option value="">Chọn loại hoạt động</option>
                            {activity.map((type) => (
                                <option key={type.id} value={String(type.id)}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {loadingActivity && <p className="text-muted mt-1">Đang tải loại hoạt động...</p>}
                        {!loadingActivity && activity.length === 0 && (
                            <p className="text-danger mt-1">Không có loại hoạt độngđộng nào</p>
                        )}
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Thêm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
export default ModalAddActivity;