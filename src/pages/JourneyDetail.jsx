import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import goongJs from "@goongmaps/goong-js";
import { getJourneyDetail } from "../services/journeyService";

const JourneyDetail = () => {
    const { journeyId } = useParams(); // Lấy journeyId từ URL
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);

    // Lấy chi tiết hành trình từ API
    const fetchJourneyDetail = async () => {
        try {
            setLoading(true);
            const response = await getJourneyDetail(journeyId);
            if (response.code === 200) {
                setJourney(response.res);
            } else {
                toast.error(response.message || "Không thể tải chi tiết hành trình!");
                setJourney(null);
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hành trình:", error);
            toast.error("Không thể tải chi tiết hành trình. Vui lòng thử lại!");
            setJourney(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJourneyDetail();
    }, [journeyId]);

    // Hàm gọi API Goong Maps để lấy polyline
    const fetchRouteFromGoong = async (startLat, startLng, endLat, endLng) => {
        const apiKey = import.meta.env.VITE_GOONG_API_KEY; // Thêm API key cho Goong Direction API
        const url = `https://rsapi.goong.io/Direction?origin=${startLat},${startLng}&destination=${endLat},${endLng}&vehicle=car&api_key=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Không thể lấy tuyến đường từ Goong Maps");
            const data = await response.json();
            const route = data.routes[0];
            if (route) {
                return route.overview_polyline.points;
            }
            return null;
        } catch (error) {
            console.error("Lỗi khi gọi Goong API:", error);
            toast.error("Không thể tải tuyến đường. Vui lòng kiểm tra kết nối!");
            return null;
        }
    };

    // Hàm giải mã polyline
    const decodePolyline = (encoded) => {
        if (!encoded || typeof encoded !== "string") return [];
        let points = [];
        let index = 0,
            len = encoded.length;
        let lat = 0,
            lng = 0;

        while (index < len) {
            let b,
                shift = 0,
                result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                if (isNaN(b)) break; // Thoát nếu gặp ký tự không hợp lệ
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                if (isNaN(b)) break;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lng += dlng;

            points.push([lng / 1e5, lat / 1e5]);
        }
        return points.length > 0 ? points : null;
    };

    // Khởi tạo bản đồ
    useEffect(() => {
        if (!journey) return;

        const mapContainer = document.getElementById("journey-map");
        if (!mapContainer) return;

        goongJs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
        const startLat = parseFloat(journey.startLatitude) || 16.560205;
        const startLng = parseFloat(journey.startLongitude) || 107.652378;
        const endLat = parseFloat(journey.endLatitude) || 16.489762;
        const endLng = parseFloat(journey.endLongitude) || 107.560237;

        const map = new goongJs.Map({
            container: mapContainer,
            style: "https://tiles.goong.io/assets/goong_map_web.json",
            center: [(startLng + endLng) / 2, (startLat + endLat) / 2],
            zoom: 12,
            interactive: true,
        });

        map.on("load", async () => {
            // Marker điểm bắt đầu
            const startMarker = new goongJs.Marker({ color: "#00FF00" })
                .setLngLat([startLng, startLat])
                .setPopup(new goongJs.Popup().setHTML(`<h4>Điểm bắt đầu: ${journey.startName || "N/A"}</h4>`))
                .addTo(map);

            // Marker điểm kết thúc
            const endMarker = new goongJs.Marker({ color: "#FF0000" })
                .setLngLat([endLng, endLat])
                .setPopup(new goongJs.Popup().setHTML(`<h4>Điểm kết thúc: ${journey.endName || "N/A"}</h4>`))
                .addTo(map);

            // Marker cho các waypoint (nếu có)
            const waypointMarkers = journey.waypoints?.map((waypoint, index) => {
                const waypointLat = parseFloat(waypoint.latitude);
                const waypointLng = parseFloat(waypoint.longitude);
                return new goongJs.Marker({ color: "#FFFF00" })
                    .setLngLat([waypointLng, waypointLat])
                    .setPopup(
                        new goongJs.Popup().setHTML(
                            `<h4>Waypoint ${index + 1}: ${waypoint.name || "N/A"}</h4><p>Thời gian dừng: ${waypoint.stopTime ? new Date(waypoint.stopTime).toLocaleString() : "N/A"
                            }</p>`
                        )
                    )
                    .addTo(map);
            }) || [];

            // Vẽ đường đi
            let polyline = journey.actualPolyline;
            if (!polyline || !decodePolyline(polyline)) {
                // Nếu polyline không hợp lệ, gọi API Goong Maps để lấy lại
                polyline = await fetchRouteFromGoong(startLat, startLng, endLat, endLng);
            }
            if (polyline) {
                const decodedPolyline = decodePolyline(polyline) || [];
                if (decodedPolyline.length > 0) {
                    map.addSource("route", {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: decodedPolyline,
                            },
                        },
                    });

                    map.addLayer({
                        id: "route",
                        type: "line",
                        source: "route",
                        layout: {
                            "line-join": "round",
                            "line-cap": "round",
                        },
                        paint: {
                            "line-color": "#1E90FF",
                            "line-width": 4,
                        },
                    });

                    // Điều chỉnh khung nhìn
                    const bounds = decodedPolyline.reduce(
                        (bounds, coord) => bounds.extend(coord),
                        new goongJs.LngLatBounds(decodedPolyline[0], decodedPolyline[0])
                    );
                    map.fitBounds(bounds, { padding: 50 });
                }
            } else {
                // Nếu không có polyline, căn chỉnh khung nhìn giữa điểm bắt đầu và kết thúc
                const bounds = new goongJs.LngLatBounds([startLng, startLat], [endLng, endLat]);
                map.fitBounds(bounds, { padding: 50 });
            }

            // Lưu map và marker vào ref
            mapRef.current = { map, startMarker, endMarker, waypointMarkers };
        });

        // Cleanup khi component unmount hoặc journey thay đổi
        return () => {
            if (mapRef.current) {
                const { map, startMarker, endMarker, waypointMarkers } = mapRef.current;
                if (startMarker) startMarker.remove();
                if (endMarker) endMarker.remove();
                if (waypointMarkers) waypointMarkers.forEach((marker) => marker.remove());
                if (map) map.remove();
                mapRef.current = null;
            }
        };
    }, [journey]);

    if (loading) {
        return (
            <div className="loading text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p>Đang tải chi tiết hành trình...</p>
            </div>
        );
    }

    if (!journey) {
        return (
            <div className="container text-center mt-5">
                <h3>Không tìm thấy hành trình</h3>
                <Link to="/journey-history" className="btn btn-primary mt-3">
                    Quay lại Lịch sử hành trình
                </Link>
            </div>
        );
    }

    return (
        <>
            <div
                className="page-header text-center"
                style={{
                    backgroundImage:
                        "url(https://cdn.eva.vn/upload/2-2024/images/2024-05-17/image_oaf1638238969-1715916816-479-width1600height900.jpg)",
                }}
            >
                <div className="container">
                    <h1 className="page-title">
                        Chi tiết <span>Hành trình</span>
                    </h1>
                </div>
            </div>
            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/journey-history">Lịch sử hành trình</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {journey.name}
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container">
                    {/* Bản đồ */}
                    <div className="mb-4">
                        <h3>Bản đồ lộ trình</h3>
                        <div
                            id="journey-map"
                            style={{
                                width: "100%",
                                height: "400px",
                                borderRadius: "5px",
                                overflow: "hidden",
                            }}
                        ></div>
                    </div>

                    {/* Thông tin hành trình */}
                    <div className="mb-4">
                        <h3>Thông tin hành trình</h3>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{journey.name}</h5>
                                <p className="card-text">
                                    <strong>Điểm bắt đầu:</strong> {journey.startName || "N/A"} (Kinh độ: {journey.startLongitude}, Vĩ độ: {journey.startLatitude})
                                </p>
                                <p className="card-text">
                                    <strong>Điểm kết thúc:</strong> {journey.endName || "N/A"} (Kinh độ: {journey.endLongitude}, Vĩ độ: {journey.endLatitude})
                                </p>
                                <p className="card-text">
                                    <strong>Thời gian bắt đầu:</strong>{" "}
                                    {journey.startTime ? new Date(journey.startTime).toLocaleString() : "N/A"}
                                </p>
                                <p className="card-text">
                                    <strong>Thời gian kết thúc:</strong>{" "}
                                    {journey.endTime ? new Date(journey.endTime).toLocaleString() : "N/A"}
                                </p>
                                <p className="card-text">
                                    <strong>Khoảng cách:</strong>{" "}
                                    {journey.distance ? `${journey.distance.toFixed(2)} km` : "Không xác định"}
                                </p>
                                <p className="card-text">
                                    <strong>Thời gian di chuyển:</strong>{" "}
                                    {journey.duration ? `${Math.round(journey.duration / 60)} phút` : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>





                    {/* Nút quay lại */}
                    <div className="text-center">
                        <Link to="/journey-history" className="btn btn-primary">
                            Quay lại Lịch sử hành trình
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JourneyDetail;