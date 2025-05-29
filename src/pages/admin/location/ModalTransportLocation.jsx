import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { GetAlltransportation } from '../../../services/transportation';
import { AddTranSportLocation } from '../../../services/Admin/location';

// Modal phụ để thêm phương tiện
const ModalTransportLocation = ({ show, idLocation, handleClose, onEditSuccess }) => {
    const [transportation, setTransportation] = useState([]);
    const [loadingTransportation, setLoadingTransportation] = useState(false);

    if (!idLocation) {
        return;
    }

    const [formData, setFormData] = useState({
        id: ''
    });
    //

    const fetchTransprot = async () => {
        setLoadingTransportation(true);
        try {
            const response = await GetAlltransportation();
            const fetchedTypes = response;
            setTransportation(fetchedTypes);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Không thể tải danh sách phương tiện!');
        } finally {
            setLoadingTransportation(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };


    useEffect(() => {
        if (show) {
            fetchTransprot();
            setFormData({
                id: ''
            });
        }
    }, [show]);

    const handleSubmit = async () => {
        if (!formData.id) {
            toast.error('Vui lòng chọn loại phương tiện!');
            return;
        }


        await AddTranSportLocation(idLocation, formData.id);
        onEditSuccess();
        toast.success('Thêm phương tiện thành công');

        handleClose();
        setFormData({
            id: '',
        });

    };

    return (
        <Modal show={show} onHide={handleClose} size="m">
            <Modal.Header closeButton>
                <Modal.Title>Thêm Phương Tiện</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form >
                    <div className="form-group mb-3">
                        <label htmlFor="type_id">Hình thức di chuyển</label>
                        <select
                            className="form-select"
                            id="id"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            disabled={loadingTransportation}
                        >
                            <option value="">Chọn hình thức di chuyển</option>
                            {transportation.map((type) => (
                                <option key={type.id} value={String(type.id)}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {loadingTransportation && <p className="text-muted mt-1">Đang tải loại phương tiện...</p>}
                        {!loadingTransportation && transportation.length === 0 && (
                            <p className="text-danger mt-1">Không có loại phương tiện nào</p>
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
export default ModalTransportLocation;