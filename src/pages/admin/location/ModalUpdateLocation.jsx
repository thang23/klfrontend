import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect, useRef } from 'react';
import { UpdateLocation } from '../../../services/Admin/location';
import { getAddressFromCoordinates, getCoordinates } from '../../../services/geocodingUtils';
import goongJs from '@goongmaps/goong-js';
import { getCategory } from '../../../services/Admin/Categories';

const ModalEditLocation = ({ show, handleClose, location, onEditSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        description: '',
        latitude: '16.4619',
        longitude: '107.5955',
        difficultyLevel: '',
        categoryId: ""
    });
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    // Lấy danh sách danh mục
    const listCategory = async () => {
        setLoadingCategories(true);
        try {
            const response = await getCategory();
            setCategories(response.data.res); // Đảm bảo response là mảng
        } catch (error) {
            toast.error(error.message || "Không thể tải danh mục!");
            console.error('Lỗi khi lấy danh sách danh mục:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Điền dữ liệu địa điểm vào form khi modal mở hoặc location thay đổi
    useEffect(() => {
        console.log("location.categoryId:", location.categoryId); // Kiểm tra giá trị

        if (show && location) {
            const lat = location.latitude?.toString()
            const lng = location.longitude?.toString();
            console.log(lat, lng)
            setFormData({
                name: location.name || '',
                address: location.address || '',
                price: location.price?.toString() || '',
                description: location.description || '',
                latitude: lat,
                longitude: lng,
                difficultyLevel: location.difficultyLevel || '',
                categoryId: location.categoryId || ""

            });

            listCategory();
            setAddressSuggestions([]);

            // Cập nhật bản đồ và marker ngay lập tức
            if (mapRef.current && markerRef.current) {
                const validLat = parseFloat(lat) || 16.4619;
                const validLng = parseFloat(lng) || 107.5955;
                mapRef.current.setCenter([validLng, validLat]);
                markerRef.current.setLngLat([validLng, validLat]);
            }
        }
    }, [show, location]);

    // Khởi tạo bản đồ Goong
    useEffect(() => {
        if (show && mapContainerRef.current && !mapRef.current) {
            // Khởi tạo bản đồ Goong
            goongJs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
            const lat = parseFloat(formData.latitude) || 16.4619;
            const lng = parseFloat(formData.longitude) || 107.5955;

            mapRef.current = new goongJs.Map({
                container: mapContainerRef.current,
                style: 'https://tiles.goong.io/assets/goong_map_web.json',
                center: [lng, lat],
                zoom: 15,
            });

            // Thêm marker
            markerRef.current = new goongJs.Marker({
                draggable: true,
            })
                .setLngLat([lng, lat])
                .addTo(mapRef.current);

            // Xử lý sự kiện kéo thả marker
            markerRef.current.on('dragend', async () => {
                const lngLat = markerRef.current.getLngLat();
                try {
                    const address = await getAddressFromCoordinates(lngLat.lat, lngLat.lng);
                    setFormData((prev) => ({
                        ...prev,
                        address: address,
                        latitude: lngLat.lat.toString(),
                        longitude: lngLat.lng.toString(),
                    }));
                    toast.info('Tọa độ và địa chỉ đã được cập nhật từ bản đồ!');
                    // eslint-disable-next-line no-unused-vars
                } catch (error) {
                    setFormData((prev) => ({
                        ...prev,
                        latitude: lngLat.lat.toString(),
                        longitude: lngLat.lng.toString(),
                    }));
                    toast.info('Tọa độ đã được cập nhật từ bản đồ! (Không lấy được địa chỉ)');
                }
                setAddressSuggestions([]);
            });

            // Cleanup khi component unmount hoặc modal đóng
            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        }
    }, [show]);

    // Cập nhật bản đồ và marker khi tọa độ thay đổi
    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            const lat = parseFloat(formData.latitude) || 16.4619;
            const lng = parseFloat(formData.longitude) || 107.5955;
            mapRef.current.setCenter([lng, lat]);
            markerRef.current.setLngLat([lng, lat]);
        }
    }, [formData.latitude, formData.longitude]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSuggestionSelect = async (suggestion) => {
        setFormData((prev) => ({
            ...prev,
            address: suggestion.display_name,
            latitude: suggestion.latitude.toString(),
            longitude: suggestion.longitude.toString(),
        }));
        setAddressSuggestions([]);
        toast.info('Đã chọn vị trí: ' + suggestion.display_name);

        // Cập nhật bản đồ và marker ngay sau khi chọn gợi ý
        if (mapRef.current && markerRef.current) {
            const lat = parseFloat(suggestion.latitude) || 16.4619;
            const lng = parseFloat(suggestion.longitude) || 107.5955;
            mapRef.current.setCenter([lng, lat]);
            markerRef.current.setLngLat([lng, lat]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.address || !formData.difficultyLevel || !formData.categoryId) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (!formData.latitude || !formData.longitude || isNaN(parseFloat(formData.latitude)) || isNaN(parseFloat(formData.longitude))) {
            toast.error('Tọa độ không hợp lệ! Vui lòng kiểm tra hoặc kéo thả marker trên bản đồ.');
            return;
        }

        try {
            const locationData = {
                name: formData.name,
                address: formData.address,
                price: parseFloat(formData.price) || 0,
                description: formData.description,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                difficultyLevel: formData.difficultyLevel,
                categoryId: formData.categoryId,
            };

            await UpdateLocation(location.id, locationData);
            onEditSuccess();
            toast.success('Cập nhật địa điểm thành công!');
            handleClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật địa điểm!';
            toast.error(errorMessage);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa địa điểm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group mb-3">
                        <label htmlFor="name">Tên địa điểm</label>
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
                    <div className="form-group mb-3">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            className="form-control"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="address">Địa chỉ</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                id="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                required
                            />
                            <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => getCoordinates(formData.address, setFormData, setAddressSuggestions, setGeocodingLoading)}
                                disabled={geocodingLoading}
                            >
                                {geocodingLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                            </button>
                        </div>
                        {geocodingLoading && <p className="text-muted mt-1">Đang tìm địa chỉ...</p>}
                        {addressSuggestions.length > 0 && (
                            <ul className="list-group mt-2">
                                {addressSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="list-group-item list-group-item-action"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                    >
                                        {suggestion.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="form-group mb-3">
                        <label>Bản đồ (kéo thả để chọn vị trí)</label>
                        <div
                            ref={mapContainerRef}
                            style={{ height: '300px', width: '100%' }}
                        ></div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="price">Giá (VND)</label>
                        <input
                            type="number"
                            className="form-control"
                            id="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.001"
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="latitude">Vĩ độ</label>
                        <input
                            type="text"
                            className="form-control"
                            id="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="longitude">Kinh độ</label>
                        <input
                            type="text"
                            className="form-control"
                            id="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="difficultyLevel">Cấp độ khó</label>
                        <select
                            className="form-control"
                            id="difficultyLevel"
                            value={formData.difficultyLevel}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn cấp độ</option>
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                        </select>
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

export default ModalEditLocation;