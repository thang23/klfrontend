import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { GetAllLocationType } from '../../../services/Admin/locationType';
import { AddLocationType } from '../../../services/Admin/location';


// Modal phụ để loại địa điểm
const ModalAddLocationType = ({ show, idLocation, handleClose, onEditSuccess }) => {
    const [locationType, setLocationType] = useState([]);
    const [loadingLocationType, setLoadingLocationType] = useState(false);

    if (!idLocation) {
        return;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [formData, setFormData] = useState({
        id: ''
    });
    //

    const fetchLocationTypes = async () => {
        setLoadingLocationType(true);
        try {
            const response = await GetAllLocationType();
            const fetchedTypes = response.data.res;
            setLocationType(fetchedTypes);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Không thể tải danh sách loại dịa điểm!');
        } finally {
            setLoadingLocationType(false);
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
            fetchLocationTypes();
            setFormData({
                id: ''
            });
        }
    }, [show]);

    const handleSubmit = async () => {
        if (!formData.id) {
            toast.error('Vui lòng chọn loại địa điểm!');
            return;
        }


        const response = await AddLocationType(idLocation, formData.id);
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
                <Modal.Title>Thêm Loại địa điểm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form >
                    <div className="form-group mb-3">
                        <label htmlFor="type_id">Loại địa điểm</label>
                        <select
                            className="form-select"
                            id="id"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            disabled={loadingLocationType}
                        >
                            <option value="">Chọn loại địa điểm</option>
                            {locationType.map((type) => (
                                <option key={type.id} value={String(type.id)}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {loadingLocationType && <p className="text-muted mt-1">Đang tải loại địa điểm...</p>}
                        {!loadingLocationType && locationType.length === 0 && (
                            <p className="text-danger mt-1">Không có loại địa điểm nào</p>
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
export default ModalAddLocationType;