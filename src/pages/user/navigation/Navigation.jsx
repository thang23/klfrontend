import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReconnectingWebSocket from 'reconnecting-websocket';
import goongjs from '@goongmaps/goong-js';
import polyline from 'polyline';
import { CreateReviewLocation } from "../../../services/User/LocationReview"

const Navigation = () => {
    const wsRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const geolocateRef = useRef(null);
    const endMarkerRef = useRef(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [isFetchingPosition, setIsFetchingPosition] = useState(false);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [remainingDuration, setRemainingDuration] = useState(0);
    const [steps, setSteps] = useState([]);
    const positionHistory = useRef([]);
    const routeCoordinatesRef = useRef([]);
    const [vehicle, setVehicle] = useState('car');
    const location = useLocation();
    const lastSentPosition = useRef(null);
    const lastInstruction = useRef(null);

    // Thêm trạng thái cho popup đánh giá
    const [showRatingPopup, setShowRatingPopup] = useState(false);
    const [rating, setRating] = useState(3);
    const [content, setContent] = useState('');

    const query = new URLSearchParams(location.search);
    const end = {
        lat: parseFloat(query.get('lat')) || 16.489762,
        lng: parseFloat(query.get('lng')) || 107.560237,
        name: decodeURIComponent(query.get('name') || 'Biển Tân An'),
        locationId: parseInt(query.get('locationId')) || null, // Mặc định null nếu không có
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
        if (!goongjs.accessToken) {
            console.error('VITE_GOONG_MAPTILES_KEY is missing or invalid.');
            alert('API key Goong không hợp lệ. Vui lòng kiểm tra biến môi trường.');
            return;
        }

        mapRef.current = new goongjs.Map({
            container: mapContainerRef.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: [107.5792, 16.4667],
            zoom: 17,
        });

        mapRef.current.addControl(new goongjs.NavigationControl());

        const geolocate = new goongjs.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserLocation: true,
        });
        geolocateRef.current = geolocate;
        mapRef.current.addControl(geolocate);

        mapRef.current.on('load', () => {
            geolocate.on('geolocate', (e) => {
                console.log('Geolocate event:', e.coords);
                const { latitude, longitude, accuracy } = e.coords;
                if (accuracy > 100) {
                    console.warn('Vị trí không chính xác:', accuracy, 'mét');
                    alert('Độ chính xác vị trí thấp (' + accuracy + 'm). Kết quả có thể không chính xác.');
                }
                const newPos = { lat: latitude, lng: longitude };
                const smoothedPos = smoothPosition(newPos);
                console.log('Setting currentPosition:', smoothedPos);
                setCurrentPosition(smoothedPos);
                setIsFetchingPosition(false);
                lastSentPosition.current = smoothedPos;
            });

            geolocate.on('error', (error) => {
                console.error('Geolocation error:', error);
                setIsFetchingPosition(false);
                alert('Không thể lấy vị trí: ' + (error.message || 'Vui lòng kiểm tra GPS và quyền truy cập.'));
            });

            if (navigator.geolocation) {
                navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                    if (result.state === 'denied') {
                        alert('Quyền truy cập vị trí bị từ chối. Vui lòng bật định vị trong cài đặt trình duyệt.');
                    } else {
                        setIsFetchingPosition(true);
                        geolocate.trigger();
                    }
                });
            } else {
                alert('Trình duyệt không hỗ trợ định vị.');
            }
        });

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    useEffect(() => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) {
            console.error('No JWT token found. Please log in.');
            return;
        }

        wsRef.current = new ReconnectingWebSocket(`ws://localhost:8080/ws/navigation?token=${encodeURIComponent(jwtToken)}`);

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received:', data);

                if (data.type === 'routeUpdate') {
                    setRouteData(data);
                    if (data.routePolyline) {
                        routeCoordinatesRef.current = polyline.decode(data.routePolyline).map(coord => [coord[1], coord[0]]);
                        drawRoute(data);
                    }
                    setRemainingDistance(data.remainingDistance || 0);
                    setRemainingDuration(data.remainingDuration || 0);
                    setSteps(data.steps || []);
                    if (data.offRoute) {
                        alert('Bạn đã đi lệch lộ trình. Đang tính toán lại lộ trình.');
                        speak('Bạn đã đi lệch lộ trình. Đang tính toán lại.');
                    }
                    if (data.steps && data.steps.length > 0) {
                        const nextStep = data.steps[0];
                        if (lastInstruction.current !== nextStep.instruction) {
                            speak(nextStep.instruction);
                            lastInstruction.current = nextStep.instruction;
                        }
                    }
                    // Tự động bắt đầu navigation sau khi nhận routeUpdate
                    if (!isNavigating && wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'beginNavigation' }));
                    }
                } else if (data.type === 'navigationStarted') {
                    setIsNavigating(true);
                } else if (data.type === 'navigationEnded') {
                    setIsNavigating(false);
                    setRouteData(null);
                    setRemainingDistance(0);
                    setRemainingDuration(0);
                    setSteps([]);
                    routeCoordinatesRef.current = [];
                    positionHistory.current = [];
                    lastSentPosition.current = null;
                    lastInstruction.current = null;
                    removeMarkers();

                    // Lưu dữ liệu từ actualEnd
                    const endPosition = {
                        lat: data.actualEnd?.lat || end.lat,
                        lng: data.actualEnd?.lng || end.lng,
                        name: data.actualEnd?.name || end.name,
                        locationId: end.locationId,
                    };
                    console.log('Ending navigation with:', { start: currentPosition, end: endPosition, vehicle: data.vehicle });

                    // Hiển thị popup đánh giá
                    if (end.locationId) {
                        setShowRatingPopup(true);
                    } else {
                        console.warn('No locationId available for rating.');
                    }
                } else if (data.type === 'error') {
                    console.error('Server error:', data.message);
                    alert(`Lỗi: ${data.message}`);
                }
            } catch (error) {
                console.error('Parse error:', error, 'Data:', event.data);
            }
        };

        wsRef.current.onclose = () => console.log('WebSocket closed');
        wsRef.current.onerror = (error) => console.error('WebSocket error:', error);

        return () => wsRef.current?.close();
    }, [vehicle, isNavigating]);

    const drawRoute = (data) => {
        if (!mapRef.current || !routeCoordinatesRef.current.length) return;

        if (!mapRef.current.getSource('route')) {
            mapRef.current.addSource('route', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinatesRef.current } },
            });
            mapRef.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#1E90FF', 'line-width': 5 },
            });
        } else {
            mapRef.current.getSource('route').setData({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: routeCoordinatesRef.current },
            });
        }

        mapRef.current.fitBounds(
            routeCoordinatesRef.current.reduce((bounds, coord) => bounds.extend(coord), new goongjs.LngLatBounds()),
            { padding: 50 }
        );

        if (endMarkerRef.current) endMarkerRef.current.remove();
        endMarkerRef.current = new goongjs.Marker({ color: 'red' })
            .setLngLat([data.endLng, data.endLat])
            .setPopup(new goongjs.Popup().setText(data.endName))
            .addTo(mapRef.current);
    };

    const removeMarkers = () => {
        if (endMarkerRef.current) endMarkerRef.current.remove();
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('SpeechSynthesis not supported');
        }
    };

    const smoothPosition = (newPos) => {
        positionHistory.current.push(newPos);
        if (positionHistory.current.length > 10) positionHistory.current.shift();

        const filteredPositions = positionHistory.current.filter(pos => {
            const distance = haversineDistance(pos, newPos);
            return distance < 0.05;
        });

        const avgLat = filteredPositions.reduce((sum, pos) => sum + pos.lat, 0) / filteredPositions.length || newPos.lat;
        const avgLng = filteredPositions.reduce((sum, pos) => sum + pos.lng, 0) / filteredPositions.length || newPos.lng;
        return { lat: avgLat, lng: avgLng };
    };

    const startNavigation = () => {
        if (isFetchingPosition) {
            alert('Đang lấy vị trí hiện tại, vui lòng chờ...');
            return;
        }
        if (!currentPosition) {
            alert('Không tìm thấy vị trí hiện tại. Đang thử lại...');
            setIsFetchingPosition(true);
            geolocateRef.current?.trigger();
            return;
        }
        sendStartNavigation();
    };

    const sendStartNavigation = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'startNavigation',
                start: currentPosition,
                end: end,
                name: `Chuyến đi đến ${end.name}`,
                vehicle: vehicle === 'motorcycle' ? 'bike' : vehicle,
            }));
        }
    };

    const beginNavigation = () => {
        if (!routeData) {
            alert('Không có dữ liệu lộ trình.');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'beginNavigation' }));
        }
    };

    const endNavigation = () => {
        if (!isNavigating) {
            alert('Không có hành trình đang hoạt động.');
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'endNavigation',
                            actualEnd: { lat: latitude, lng: longitude, name: 'Kết thúc', locationId: end.locationId },
                            vehicle: vehicle === 'motorcycle' ? 'bike' : vehicle,
                        }));
                    }
                },
                (error) => console.error('Geolocation error:', error),
                { enableHighAccuracy: true }
            );
        }
    };

    const haversineDistance = (pos1, pos2) => {
        const R = 6371;
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getManeuverIcon = (maneuver) => {
        if (!maneuver) return '➡️';
        switch (maneuver.toLowerCase()) {
            case 'turn-left':
            case 'left':
                return '⬅️';
            case 'turn-right':
            case 'right':
                return '➡️';
            case 'straight':
                return '⬆️';
            case 'roundabout':
                return '🔄';
            case 'arrive':
                return '🏁';
            default:
                return '➡️';
        }
    };

    // Hàm gửi API đánh giá
    const submitRating = async () => {
        if (!end.locationId) {
            alert('Không có locationId để gửi đánh giá.');
            return;
        }

        const ratingData = {
            rating: rating,
            content: content,
            locationId: end.locationId,
        };

        const result = await CreateReviewLocation(ratingData);
        if (result.success) {
            alert(result.message);
            setShowRatingPopup(false);
        } else {
            alert('Lỗi khi gửi đánh giá: ' + result.message);
        }
    };

    return (
        <>
            <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
                <div className="container-fluid d-flex align-items-center">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/home">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/khampha">Địa điểm</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Điều hướng
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container-fluid" style={{ padding: 0, height: 'calc(100vh - 60px)' }}>
                    <div className="row" style={{ margin: 0, height: '100%' }}>
                        <div className="col-12" style={{ padding: 0, height: '100%', position: 'relative' }}>
                            <div
                                ref={mapContainerRef}
                                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                            ></div>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '20px',
                                    background: 'white',
                                    padding: '15px',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                    zIndex: 1000,
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <div className="form-group">
                                    <label htmlFor="vehicle">Phương tiện:</label>
                                    <select
                                        id="vehicle"
                                        className="form-control"
                                        value={vehicle}
                                        onChange={(e) => setVehicle(e.target.value)}
                                        style={{ marginBottom: '10px' }}
                                    >
                                        <option value="car">Ô tô</option>
                                        <option value="motorcycle">Xe máy</option>
                                    </select>
                                </div>
                                <div className="d-flex flex-column">
                                    <button className="btn-product btn-cart mb-2" onClick={startNavigation}>
                                        <span>Xem lộ trình</span>
                                    </button>
                                    <button className="btn-product btn-cart mb-2" onClick={beginNavigation} disabled={!routeData}>
                                        <span>Bắt đầu</span>
                                    </button>
                                    <button className="btn-product btn-cart mb-2" onClick={endNavigation} disabled={!isNavigating}>
                                        <span>Kết thúc</span>
                                    </button>
                                </div>
                                {routeData && (
                                    <div className="mt-3">
                                        <h5>Thông tin hành trình</h5>
                                        <p><strong>Khoảng cách còn lại:</strong> {(remainingDistance / 1000).toFixed(2)} km</p>
                                        <p><strong>Thời gian còn lại:</strong> {(remainingDuration / 60).toFixed(1)} phút</p>
                                        {steps.length > 0 && (
                                            <div>
                                                <h6>Hướng dẫn điều hướng</h6>
                                                <div
                                                    style={{
                                                        background: '#f0f8ff',
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        marginBottom: '10px',
                                                    }}
                                                >
                                                    <p>
                                                        <strong>Bước tiếp theo:</strong> {getManeuverIcon(steps[0].maneuver)} {steps[0].instruction}
                                                        {steps[0].name && ` trên đường ${steps[0].name}`}
                                                        {steps[0].destination && `, hướng đến ${steps[0].destination}`}
                                                        <br />
                                                        <small>
                                                            Khoảng cách: {(steps[0].distance / 1000).toFixed(2)} km | Thời gian: {(steps[0].duration / 60).toFixed(1)} phút
                                                        </small>
                                                    </p>
                                                </div>
                                                <ol>
                                                    {steps.slice(1).map((step, index) => (
                                                        <li key={index} style={{ marginBottom: '10px' }}>
                                                            {getManeuverIcon(step.maneuver)} {step.instruction}
                                                            {step.name && ` trên đường ${step.name}`}
                                                            {step.destination && `, hướng đến ${step.destination}`}
                                                            <br />
                                                            <small>
                                                                Khoảng cách: {(step.distance / 1000).toFixed(2)} km | Thời gian: {(step.duration / 60).toFixed(1)} phút
                                                            </small>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRatingPopup && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '5px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                    }}
                >
                    <h5>Đánh giá địa điểm: {end.name}</h5>
                    <div>
                        <label>Điểm đánh giá (1-5):</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={(e) => setRating(parseInt(e.target.value) || 3)}
                            style={{ marginLeft: '10px', width: '50px' }}
                        />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label>Nội dung đánh giá:</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập nội dung đánh giá"
                            style={{ marginLeft: '10px', width: '100%', height: '60px' }}
                        />
                    </div>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <button
                            onClick={submitRating}
                            style={{ padding: '5px 10px', marginRight: '10px' }}
                        >
                            Gửi đánh giá
                        </button>
                        <button
                            onClick={() => setShowRatingPopup(false)}
                            style={{ padding: '5px 10px' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;