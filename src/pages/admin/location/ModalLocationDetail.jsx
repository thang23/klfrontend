import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useEffect, useState, useRef } from 'react';
import { DeleteActivityLocation, DeleteLocationReview, DeleteLocationType, DeleteTransprotLocation, GetDetailLocation } from '../../../services/Admin/location';
import { DeleteImage, UploadImage } from '../../../services/uploadImage';
import ModalTransportLocation from './ModalTransportLocation';
import ModalAddLocationType from './ModalAddLocationType';
import ModalAddActivity from './ModalAddActivity';
import goongJs from '@goongmaps/goong-js';

const ModalDetailLocation = ({ show, handleClose, id }) => {
    const BASE_URL = "http://localhost:8080";
    const [localLocation, setLocalLocation] = useState(null);
    const [showTransportationModal, setShowTransportationModal] = useState(false);
    const [showLocationTypeModal, setShowLocationTypeModal] = useState(false);
    const [showActivityTypeModal, setShowActivityModal] = useState(false);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    if (!id) return null;

    const fetchLocation = async () => {
        try {
            const response = await GetDetailLocation(id);
            if (response.code === 200) {
                setLocalLocation(response.res);
            } else {
                throw new Error(response.message || "Failed to load location");
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            toast.error("Failed to load location. Please try again!");
            setLocalLocation(null);
        }
    };

    useEffect(() => {
        if (id && show) {
            fetchLocation();
        }
    }, [id, show]);

    // Khởi tạo bản đồ Goong Maps
    useEffect(() => {
        if (show && mapContainerRef.current && localLocation && !mapRef.current) {
            goongJs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
            const lat = parseFloat(localLocation.latitude) || 16.3387507;
            const lng = parseFloat(localLocation.longitude) || 107.5413496;

            mapRef.current = new goongJs.Map({
                container: mapContainerRef.current,
                style: 'https://tiles.goong.io/assets/goong_map_web.json',
                center: [lng, lat],
                zoom: 15,
            });

            // Thêm marker
            markerRef.current = new goongJs.Marker()
                .setLngLat([lng, lat])
                .addTo(mapRef.current);

            // Dọn dẹp khi modal đóng hoặc component unmount
            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        }
    }, [show, localLocation]);

    const handleUploadImage = async (event) => {
        try {
            const fileInput = event.target;
            if (!fileInput.files || fileInput.files.length === 0) {
                toast.error('Vui lòng chọn ảnh cần tải lên');
                return;
            }

            const file = fileInput.files[0];
            const params = {
                typeEntity: 'location',
                file,
            };

            const response = await UploadImage(id, params);
            if (response) {
                fetchLocation();
                toast.success(response.data.message || "Tải ảnh thành công");
                fileInput.value = '';
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error("Failed to upload image");
        }
    };

    const handleDeleteImage = async (imagePath) => {
        await DeleteImage(id, 'location', imagePath);
        fetchLocation();
        toast.success("Xóa ảnh thành công");
    };

    const handleOpenLocationTypeModal = () => {
        setShowLocationTypeModal(true);
    };

    const handleCloseLocationtypeModal = () => {
        setShowLocationTypeModal(false);
    };

    const handleDeleteType = async (typeId) => {
        const response = await DeleteLocationType(localLocation.id, typeId);
        if (response.data.code === 200) {
            fetchLocation();
            toast.success(response.data.message || "Xóa loại địa điểm thành công");
        }
    };

    const handleOpenActivityModal = () => {
        setShowActivityModal(true);
    };

    const handleCloseActivityModal = () => {
        setShowActivityModal(false);
    };

    const handleDeleteActivity = async (activityId) => {
        const response = await DeleteActivityLocation(localLocation.id, activityId);
        if (response.data.code === 200) {
            fetchLocation();
            toast.success(response.data.message || "Xóa hoạt động thành công");
        }
    };

    const handleOpenTransportationModal = () => {
        setShowTransportationModal(true);
    };

    const handleCloseTransportModal = () => {
        setShowTransportationModal(false);
    };

    const handleDeleteTransport = async (transportId) => {
        try {
            const response = await DeleteTransprotLocation(localLocation.id, transportId);
            if (response.data.code === 200) {
                fetchLocation();
                toast.success(response.data.message || "Xóa phương tiện thành công");
            } else {
                throw new Error(response.data.message || "Xóa phương tiện thất bại");
            }
        } catch (error) {
            console.error('Delete transport failed:', error);
            toast.error(error.message || "Xóa phương tiện thất bại");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        // Show confirmation prompt
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            return;
        }

        try {
            const response = await DeleteLocationReview(reviewId);
            if (response.data.code === 200) {
                fetchLocation();
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa đánh giá:', error);
            // Error message is already handled by DeleteLocationReview via toast
        }
    };

    if (!localLocation) {
        return (
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Đang tải...</Modal.Title>
                </Modal.Header>
                <Modal.Body>Đang tải chi tiết địa điểm...</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{localLocation.name || 'Location Details'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "#ffffff" }}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: "#f0f4f8", color: "#333" }}>
                                <h5 className="mb-3 text-primary">Thông tin cơ bản</h5>
                                <div className="mb-2"><strong>Loại danh mục:</strong> {localLocation.categoryDTO.name || 'N/A'}</div>
                                <div className="mb-2"><strong>Tên địa điểm:</strong> {localLocation.name || 'N/A'}</div>
                                <div className="mb-2"><strong>ID:</strong> {localLocation.id || 'N/A'}</div>
                                <div className="mb-2">
                                    <strong>Giá:</strong>{" "}
                                    {localLocation.price
                                        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(localLocation.price)
                                        : "N/A"}
                                </div>
                                <div className="mb-2"><strong>Cấp độ khó:</strong> {localLocation.difficultyLevel || "N/A"}</div>
                                <div className="mb-2">
                                    <strong>Loại địa điểm:</strong>{" "}
                                    {localLocation.locationTypes?.length > 0
                                        ? localLocation.locationTypes.map((type, idx) => (
                                            <span key={type.id} style={{ marginRight: 8 }}>
                                                {type.name}
                                                <button
                                                    onClick={() => handleDeleteType(type.id)}
                                                    style={{
                                                        marginLeft: 4,
                                                        border: "none",
                                                        background: "transparent",
                                                        color: "red",
                                                        cursor: "pointer",
                                                        fontWeight: "bold"
                                                    }}
                                                    title="Xoá loại địa điểm"
                                                >
                                                    ✖
                                                </button>
                                                {idx < localLocation.locationTypes.length - 1 ? " | " : ""}
                                            </span>
                                        ))
                                        : "Không có"}
                                </div>
                                <div className="mb-2">
                                    <strong>Hoạt động:</strong>{" "}
                                    {localLocation.activities?.length > 0
                                        ? localLocation.activities.map((act, idx) => (
                                            <span key={act.id}>
                                                <button
                                                    onClick={() => handleDeleteActivity(act.id)}
                                                    style={{
                                                        marginLeft: 4,
                                                        border: "none",
                                                        background: "transparent",
                                                        color: "red",
                                                        cursor: "pointer",
                                                        fontWeight: "bold"
                                                    }}
                                                    title="Xoá loại địa điểm"
                                                >
                                                    ✖
                                                </button>
                                                {act.name}{idx < localLocation.activities.length - 1 ? " | " : ""}
                                            </span>
                                        ))
                                        : "Không có"}
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: "#fffdf7", color: "#333" }}>
                                <h5 className="mb-3 text-secondary">Thông tin địa điểm</h5>
                                <div className="mb-2"><strong>Địa chỉ:</strong> {localLocation.address || "N/A"}</div>
                                <div className="mb-2"><strong>Ngày tạo:</strong> {localLocation.createdDate || "N/A"}</div>
                                <div className="mb-2"><strong>Ngày sửa:</strong> {localLocation.modifiedDate || "N/A"}</div>
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleOpenLocationTypeModal}
                                >
                                    Thêm loại địa điểm
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleOpenActivityModal}
                                >
                                    Thêm hoạt động
                                </button>
                            </div>
                        </Col>
                    </Row>
                    <h5>Mô tả</h5>
                    <div
                        className="mb-4 p-3 border rounded bg-white shadow-sm"
                        style={{
                            maxHeight: '150px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#ccc transparent',
                        }}
                    >
                        <p style={{ whiteSpace: 'pre-line' }}>{localLocation.description || 'Không có mô tả'}</p>
                    </div>
                    <Row className="mb-4">
                        <Col md={4}>
                            <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: "#eef6f9" }}>
                                <h5 style={{ color: "#00aaff" }}>Vị trí bản đồ</h5>
                                <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div
                                        ref={mapContainerRef}
                                        style={{ height: '100%', width: '100%' }}
                                    ></div>
                                </div>
                                <p className="mt-2">
                                    <strong>Vĩ độ:</strong> {localLocation.latitude || 'N/A'}, <strong>Kinh độ:</strong> {localLocation.longitude || 'N/A'}
                                </p>
                                <h5 className="mt-3" style={{ color: "#00aaff" }}>Phương tiện di chuyển</h5>
                                {localLocation.transportations?.length > 0 ? (
                                    <ul className="list-unstyled">
                                        {localLocation.transportations.map((trans) => (
                                            <li key={trans.id} className="d-flex justify-content-between">
                                                <span>{trans.name}</span>
                                                <button
                                                    className="btn p-0 m-0"
                                                    style={{
                                                        color: '#dc3545',
                                                        fontSize: '18px',
                                                        lineHeight: '1',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => handleDeleteTransport(trans.id)}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Không có phương tiện di chuyển</p>
                                )}
                            </div>
                        </Col>
                        <Col md={8}>
                            <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: "#ffffff", maxHeight: '400px', overflowY: 'auto' }}>
                                <h5 style={{ color: "#00aaff" }}>Danh sách đánh giá</h5>
                                {localLocation.locationReviews?.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {localLocation.locationReviews.map((review, index) => (
                                            <div key={index} className="border rounded p-3" style={{ backgroundColor: "#fffbe6" }}>
                                                <p>
                                                    <strong style={{ color: "#00aaff" }}>Ngày đánh giá:</strong>{" "}
                                                    {new Date(review.createdDate || "2024-01-01").toLocaleDateString("vi-VN")}
                                                </p>
                                                <p><strong style={{ color: "#00aaff" }}>Người đánh giá:</strong> {review.userName || 'Ẩn danh'}</p>
                                                <p><strong style={{ color: "#ffcc00" }}>Điểm:</strong> {review.rating || 'N/A'} sao</p>
                                                <p><strong>Nội dung:</strong> {review.content || 'Không có nội dung'}</p>
                                                <button
                                                    className="btn btn-danger btn-sm mt-2"
                                                    onClick={() => handleDeleteReview(review.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Không có bài đánh giá nào</p>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary mt-3"
                                onClick={handleOpenTransportationModal}
                            >
                                Thêm phương tiện di chuyển
                            </button>
                        </Col>
                    </Row>
                    <div className="d-flex flex-wrap gap-3">
                        <div className="add-image-wrapper">
                            <label
                                htmlFor="image-upload"
                                className="add-image-btn d-flex align-items-center justify-content-center rounded shadow"
                                style={{
                                    width: '200px',
                                    height: '150px',
                                    background: 'linear-gradient(135deg, #f0f4f8, #e2e8f0)',
                                    border: '2px dashed #cbd5e1',
                                    color: '#64748b',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <span className="d-flex flex-column align-items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Thêm ảnh
                                </span>
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleUploadImage}
                            />
                        </div>
                        {localLocation.locationImages?.map((img, index) => (
                            <div
                                key={index}
                                className="image-wrapper position-relative rounded overflow-hidden shadow"
                                style={{ transition: 'transform 0.3s ease' }}
                            >
                                <img
                                    src={img}
                                    alt={`img-${index}`}
                                    className="img-thumbnail"
                                    style={{
                                        width: '200px',
                                        height: '150px',
                                        objectFit: 'cover',
                                        transition: 'filter 0.3s ease',
                                    }}
                                />
                                <button
                                    className="delete-btn btn position-absolute"
                                    style={{
                                        top: '8px',
                                        right: '8px',
                                        color: '#fff',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                                        padding: 0,
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleDeleteImage(img)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
            <ModalTransportLocation
                show={showTransportationModal}
                handleClose={handleCloseTransportModal}
                idLocation={localLocation.id}
                onEditSuccess={fetchLocation}
            />
            <ModalAddLocationType
                show={showLocationTypeModal}
                handleClose={handleCloseLocationtypeModal}
                idLocation={localLocation.id}
                onEditSuccess={fetchLocation}
            />
            <ModalAddActivity
                show={showActivityTypeModal}
                handleClose={handleCloseActivityModal}
                idLocation={localLocation.id}
                onEditSuccess={fetchLocation}
            />
        </>
    );
};

export default ModalDetailLocation;