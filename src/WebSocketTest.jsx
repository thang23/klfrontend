import React, { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import goongjs from '@goongmaps/goong-js';
import polyline from 'polyline';

const WebSocketTest = () => {
    const wsRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const currentMarkerRef = useRef(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [remainingDuration, setRemainingDuration] = useState(0);
    const positionHistory = useRef([]); // Lưu lịch sử vị trí để làm mượt
    const routeCoordinatesRef = useRef([]);
    const [vehicle, setVehicle] = useState('car');

    useEffect(() => {
        if (!mapContainerRef.current) return;

        goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
        mapRef.current = new goongjs.Map({
            container: mapContainerRef.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: [107.5792, 16.4667],
            zoom: 17,
        });

        mapRef.current.addControl(new goongjs.NavigationControl());

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const initialPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(initialPos);
                    mapRef.current.setCenter([longitude, latitude]);
                    addCurrentMarker([longitude, latitude]);
                },
                (error) => console.error('Geolocation error:', error),
                { enableHighAccuracy: true }
            );
        } else {
            console.error('Geolocation not supported on this device');
        }

        return () => mapRef.current?.remove();
    }, []);

    useEffect(() => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) {
            console.error('No JWT token found. Please log in.');
            return;
        }

        wsRef.current = new ReconnectingWebSocket(`ws://localhost:8080/ws/navigation?token=${encodeURIComponent(jwtToken)}`);
        // wsRef.current = new ReconnectingWebSocket(`"ws://192.168.1.9:8080/ws/navigation?token=${encodeURIComponent(jwtToken)}`);


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
                    setRemainingDistance(data.remainingDistance || (data.routeDistance * 1000) || 0);
                    setRemainingDuration(data.remainingDuration || data.routeDuration || 0);
                } else if (data.type === 'navigationStarted') {
                    setIsNavigating(true);
                    trackPosition();
                } else if (data.type === 'navigationEnded') {
                    setIsNavigating(false);
                    setRouteData(null);
                    setRemainingDistance(0);
                    setRemainingDuration(0);
                    routeCoordinatesRef.current = [];
                    positionHistory.current = [];
                    removeMarkers();
                } else if (data.type === 'error') {
                    console.error('Server error:', data.message);
                }
            } catch (error) {
                console.error('Parse error:', error, 'Data:', event.data);
            }
        };

        return () => wsRef.current?.close();
    }, [vehicle]);

    const addCurrentMarker = (coordinates) => {
        if (!mapRef.current) return;
        if (currentMarkerRef.current) currentMarkerRef.current.remove();
        currentMarkerRef.current = new goongjs.Marker({ color: 'blue' })
            .setLngLat(coordinates)
            .setPopup(new goongjs.Popup().setText('Vị trí của bạn'))
            .addTo(mapRef.current);
    };

    const drawRoute = (data) => {
        if (!mapRef.current || !routeCoordinatesRef.current.length) return;

        if (mapRef.current.getSource('route')) {
            mapRef.current.getSource('route').setData({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: routeCoordinatesRef.current },
            });
        } else {
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
        }

        mapRef.current.fitBounds(
            routeCoordinatesRef.current.reduce((bounds, coord) => bounds.extend(coord), new goongjs.LngLatBounds()),
            { padding: 50 }
        );

        if (startMarkerRef.current) startMarkerRef.current.remove();
        startMarkerRef.current = new goongjs.Marker({ color: 'green' })
            .setLngLat([data.startLng, data.startLat])
            .setPopup(new goongjs.Popup().setText(data.startName || 'Vị trí bắt đầu'))
            .addTo(mapRef.current);

        if (endMarkerRef.current) endMarkerRef.current.remove();
        endMarkerRef.current = new goongjs.Marker({ color: 'red' })
            .setLngLat([data.endLng, data.endLat])
            .setPopup(new goongjs.Popup().setText(data.endName))
            .addTo(mapRef.current);

        if (currentPosition) {
            addCurrentMarker([currentPosition.lng, currentPosition.lat]);
        }
    };

    const removeMarkers = () => {
        if (startMarkerRef.current) startMarkerRef.current.remove();
        if (endMarkerRef.current) endMarkerRef.current.remove();
        if (currentMarkerRef.current) currentMarkerRef.current.remove();
    };

    const smoothPosition = (newPos) => {
        positionHistory.current.push(newPos);
        if (positionHistory.current.length > 5) positionHistory.current.shift(); // Giữ 5 điểm gần nhất
        const avgLat = positionHistory.current.reduce((sum, pos) => sum + pos.lat, 0) / positionHistory.current.length;
        const avgLng = positionHistory.current.reduce((sum, pos) => sum + pos.lng, 0) / positionHistory.current.length;
        return { lat: avgLat, lng: avgLng };
    };

    const trackPosition = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos = { lat: latitude, lng: longitude };
                const smoothedPos = smoothPosition(newPos);
                setCurrentPosition(smoothedPos);

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: 'positionUpdate',
                        position: smoothedPos,
                        vehicle: vehicle
                    }));
                }

                if (mapRef.current) {
                    addCurrentMarker([smoothedPos.lng, smoothedPos.lat]);
                    if (isNavigating) {
                        mapRef.current.setCenter([smoothedPos.lng, smoothedPos.lat]);
                    }
                }

                if (isNavigating && routeData && routeCoordinatesRef.current.length) {
                    const distance = calculateRemainingDistance(smoothedPos, routeCoordinatesRef.current);
                    setRemainingDistance(distance || 0);
                    setRemainingDuration(Math.round(distance / (50 / 3600)) || 0); // 50 km/h giả định
                }
            },
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const calculateRemainingDistance = (currentPos, routeCoords) => {
        if (!routeCoords.length) return 0;
        const currentCoord = [currentPos.lng, currentPos.lat];
        let minDistance = Infinity;
        for (let i = 0; i < routeCoords.length - 1; i++) {
            const start = routeCoords[i];
            const end = routeCoords[i + 1];
            const segmentDistance = haversineDistance(
                { lat: start[1], lng: start[0] },
                { lat: end[1], lng: end[0] }
            );
            const distanceToStart = haversineDistance(
                { lat: currentCoord[1], lng: currentCoord[0] },
                { lat: start[1], lng: start[0] }
            );
            const distanceToEnd = haversineDistance(
                { lat: currentCoord[1], lng: currentCoord[0] },
                { lat: end[1], lng: end[0] }
            );
            const perpendicularDistance = Math.abs(
                (end[0] - start[0]) * (start[1] - currentCoord[1]) -
                (start[0] - currentCoord[0]) * (end[1] - start[1])
            ) / Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
            minDistance = Math.min(minDistance, distanceToStart, distanceToEnd, perpendicularDistance * 6371); // Chuyển đổi độ sang km
        }
        return minDistance < 0.1 ? 0 : minDistance; // Nếu gần đích, set về 0
    };

    const startNavigation = () => {
        if (!currentPosition) {
            console.error('No current position');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'startNavigation',
                start: currentPosition,
                end: { lat: 16.489762, lng: 107.560237, name: 'Biển Tân An' },
                name: 'Chuyến đi đến Biển Tân An',
                vehicle: vehicle
            }));
        }
    };

    const beginNavigation = () => {
        if (!routeData) {
            console.error('No route data');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'beginNavigation' }));
        }
    };

    const addWaypoint = () => {
        if (!isNavigating) {
            console.error('No active navigation');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'addWaypoint',
                latitude: 16.5000,
                longitude: 107.6000,
                name: 'Quán Cà Phê Đẹp',
                stopTime: '2025-05-07T12:00:00'
            }));
        }
    };

    const endNavigation = () => {
        if (!isNavigating) {
            console.error('No active navigation');
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'endNavigation',
                            actualEnd: { lat: latitude, lng: longitude, name: 'Kết thúc' }
                        }));
                    }
                },
                (error) => console.error('Geolocation error:', error),
                { enableHighAccuracy: true }
            );
        }
    };

    const haversineDistance = (pos1, pos2) => {
        const R = 6371; // Earth radius in km
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km
    };

    return (
        <div>
            <h2>Navigation Map</h2>
            <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }}></div>
            <div style={{ marginTop: '10px' }}>
                <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                    <option value="car">Ô tô</option>
                    <option value="motorcycle">Xe máy</option>
                </select>
                <button onClick={startNavigation}>Xem lộ trình</button>
                <button onClick={beginNavigation} disabled={!routeData}>Bắt đầu</button>
                <button onClick={addWaypoint} disabled={!isNavigating}>Thêm waypoint</button>
                <button onClick={endNavigation} disabled={!isNavigating}>Kết thúc</button>
            </div>
            {routeData && (
                <div>
                    <h3>Thông tin hành trình</h3>
                    <p>Khoảng cách còn lại: {(remainingDistance / 1000).toFixed(2)} km</p>
                    <p>Thời gian còn lại: {(remainingDuration / 60).toFixed(1)} phút</p>
                </div>
            )}
        </div>
    );
};

export default WebSocketTest;