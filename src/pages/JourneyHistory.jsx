import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { getJourneysByUser, deleteJourney } from "../services/journeyService";
import goongJs from "@goongmaps/goong-js";

const JourneyHistory = () => {
    const navigate = useNavigate();
    const [journeys, setJourneys] = useState([]);
    const [filteredJourneys, setFilteredJourneys] = useState([]);
    const [displayedJourneys, setDisplayedJourneys] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        distance: [],
        duration: [],
    });
    const distanceRanges = ["short", "medium", "long"];
    const durationRanges = ["short", "medium", "long"];
    const [sortBy, setSortBy] = useState("startTime");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;
    const mapRefs = useRef({});

    const fetchJourneys = async () => {

        try {
            setLoading(true);
            const userId = localStorage.getItem("userId");
            if (!userId) {
                throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            }
            const response = await getJourneysByUser(userId);
            if (response.code === 200 && Array.isArray(response.res)) {
                setJourneys(response.res);
                setFilteredJourneys(response.res);
            } else {
                setJourneys([]);
                toast.error("Dữ liệu hành trình không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hành trình:", error);
            toast.error(error.message || "Không thể tải danh sách hành trình. Vui lòng thử lại!");
            setJourneys([]);
            setFilteredJourneys([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJourney = async (journeyId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa hành trình này?")) return;
        try {
            const response = await deleteJourney(journeyId);
            if (response.code === 200) {
                toast.success("Xóa hành trình thành công!");
                setJourneys(journeys.filter((journey) => journey.id !== journeyId));
                setFilteredJourneys(filteredJourneys.filter((journey) => journey.id !== journeyId));
            } else {
                toast.error(response.message || "Không thể xóa hành trình.");
            }
        } catch (error) {
            console.error("Lỗi khi xóa hành trình:", error);
            toast.error("Không thể xóa hành trình. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        fetchJourneys();
    }, []);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedJourneys(filteredJourneys.slice(start, end));
        setTotalPages(Math.ceil(filteredJourneys.length / pageSize) || 1);
    }, [filteredJourneys, page]);

    const handleFilterChange = (type, value) => {
        setFilter((prev) => {
            const currentValues = prev[type];
            const updatedValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];
            return { ...prev, [type]: updatedValues };
        });
    };

    const handleClearFilters = () => {
        setFilter({
            distance: [],
            duration: [],
        });
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const handlePrevious = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handleJourneyClick = (journeyId) => {
        navigate(`/journey/${journeyId}`);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
                    <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageClick(i);
                        }}
                    >
                        {i + 1}
                    </a>
                </li>
            );
        }
        return pageNumbers;
    };

    useEffect(() => {
        let filtered = [...journeys];

        if (filter.distance.length > 0) {
            filtered = filtered.filter((journey) => {
                const distance = journey.distance || 0;
                return filter.distance.some((range) => {
                    if (range === "short") return distance < 10;
                    if (range === "medium") return distance >= 10 && distance <= 50;
                    if (range === "long") return distance > 50;
                    return false;
                });
            });
        }

        if (filter.duration.length > 0) {
            filtered = filtered.filter((journey) => {
                const duration = journey.duration || 0;
                return filter.duration.some((range) => {
                    if (range === "short") return duration < 60;
                    if (range === "medium") return duration >= 60 && duration <= 180;
                    if (range === "long") return duration > 180;
                    return false;
                });
            });
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "distance":
                    return (b.distance || 0) - (a.distance || 0);
                case "duration":
                    return (b.duration || 0) - (a.duration || 0);
                case "startTime":
                default:
                    return new Date(b.startTime || 0) - new Date(a.startTime || 0);
            }
        });

        setFilteredJourneys(filtered);
        setPage(0);
    }, [filter, sortBy, journeys]);

    // Khởi tạo bản đồ cho mỗi hành trình
    useEffect(() => {
        displayedJourneys.forEach((journey) => {
            const mapContainer = document.getElementById(`map-${journey.id}`);
            if (!mapContainer || mapRefs.current[journey.id]) return;

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
                interactive: false,
            });

            // Chờ bản đồ tải xong trước khi thêm marker và layer
            map.on("load", () => {
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

                // Vẽ đường đi nếu có polyline
                if (journey.actualPolyline) {
                    const decodedPolyline = decodePolyline(journey.actualPolyline);
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

                    // Điều chỉnh khung nhìn để hiển thị toàn bộ lộ trình
                    const coordinates = decodedPolyline;
                    if (coordinates.length > 0) {
                        const bounds = coordinates.reduce(
                            (bounds, coord) => bounds.extend(coord),
                            new goongJs.LngLatBounds(coordinates[0], coordinates[0])
                        );
                        map.fitBounds(bounds, { padding: 50 });
                    }
                } else {
                    // Nếu không có polyline, căn chỉnh khung nhìn giữa điểm bắt đầu và kết thúc
                    const bounds = new goongJs.LngLatBounds([startLng, startLat], [endLng, endLat]);
                    map.fitBounds(bounds, { padding: 50 });
                }

                // Lưu map và marker vào refs
                mapRefs.current[journey.id] = { map, startMarker, endMarker };
            });
        });

        // Cleanup khi component unmount hoặc journeys thay đổi
        return () => {
            Object.keys(mapRefs.current).forEach((journeyId) => {
                const { map, startMarker, endMarker } = mapRefs.current[journeyId];
                if (startMarker) startMarker.remove();
                if (endMarker) endMarker.remove();
                if (map) map.remove();
            });
            mapRefs.current = {};
        };
    }, [displayedJourneys]);

    // Hàm giải mã polyline
    const decodePolyline = (encoded) => {
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
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            lng += dlng;

            points.push([lng / 1e5, lat / 1e5]);
        }
        return points;
    };

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
                        Lịch sử <span>Hành trình</span>
                    </h1>
                </div>
            </div>
            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Lịch sử hành trình
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container">
                    <div className="row">
                        {/* Sidebar chứa bộ lọc */}
                        <aside className="col-lg-3">
                            <div className="sidebar sidebar-shop">
                                <div className="widget widget-clean">
                                    <label>Bộ lọc:</label>
                                    <a
                                        href="#"
                                        className="sidebar-filter-clear"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleClearFilters();
                                        }}
                                    >
                                        XÓA TẤT CẢ
                                    </a>
                                </div>
                                <div className="widget widget-collapsible">
                                    <h3 className="widget-title">
                                        <a
                                            data-toggle="collapse"
                                            href="#widget-1"
                                            role="button"
                                            aria-expanded="true"
                                            aria-controls="widget-1"
                                        >
                                            Khoảng cách
                                        </a>
                                    </h3>
                                    <div className="collapse show" id="widget-1">
                                        <div className="widget-body">
                                            <div className="filter-items">
                                                {distanceRanges.map((range, index) => (
                                                    <div className="filter-item" key={index}>
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`distance-${index}`}
                                                                checked={filter.distance.includes(range)}
                                                                onChange={() =>
                                                                    handleFilterChange("distance", range)
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`distance-${index}`}
                                                            >
                                                                {range === "short"
                                                                    ? "Ngắn (< 10km)"
                                                                    : range === "medium"
                                                                        ? "Trung bình (10-50km)"
                                                                        : "Dài (> 50km)"}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="widget widget-collapsible">
                                    <h3 className="widget-title">
                                        <a
                                            data-toggle="collapse"
                                            href="#widget-2"
                                            role="button"
                                            aria-expanded="true"
                                            aria-controls="widget-2"
                                        >
                                            Thời gian
                                        </a>
                                    </h3>
                                    <div className="collapse show" id="widget-2">
                                        <div className="widget-body">
                                            <div className="filter-items">
                                                {durationRanges.map((range, index) => (
                                                    <div className="filter-item" key={index}>
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`duration-${index}`}
                                                                checked={filter.duration.includes(range)}
                                                                onChange={() =>
                                                                    handleFilterChange("duration", range)
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`duration-${index}`}
                                                            >
                                                                {range === "short"
                                                                    ? "Ngắn (< 1 giờ)"
                                                                    : range === "medium"
                                                                        ? "Trung bình (1-3 giờ)"
                                                                        : "Dài (> 3 giờ)"}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Danh sách hành trình */}
                        <div className="col-lg-9">
                            <div className="toolbox mb-3">
                                <div className="toolbox-left">
                                    <div className="toolbox-info">
                                        Hiển thị{" "}
                                        <span>
                                            {displayedJourneys.length} trong {filteredJourneys.length}
                                        </span>{" "}
                                        Hành trình
                                    </div>
                                </div>
                                <div className="toolbox-right">
                                    <div className="toolbox-sort">
                                        <label htmlFor="sortby">Sắp xếp theo:</label>
                                        <div className="select-custom">
                                            <select
                                                name="sortby"
                                                id="sortby"
                                                className="form-control"
                                                value={sortBy}
                                                onChange={handleSortChange}
                                            >
                                                <option value="startTime">Thời gian bắt đầu</option>
                                                <option value="distance">Khoảng cách</option>
                                                <option value="duration">Thời gian</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p>Đang tải danh sách hành trình...</p>
                                </div>
                            ) : (
                                <table className="table table-wishlist table-mobile">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "30%" }}>Hành trình</th>
                                            <th style={{ width: "30%" }}>Bản đồ lộ trình</th>
                                            <th>Khoảng cách</th>
                                            <th>Thời gian</th>
                                            <th>Hành động</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedJourneys.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    Không tìm thấy hành trình nào.
                                                </td>
                                            </tr>
                                        ) : (
                                            displayedJourneys.map((journey) => (
                                                <tr key={journey.id}>
                                                    <td className="product-col">
                                                        <div className="product">
                                                            <h3 className="product-title">
                                                                <a
                                                                    href="#"
                                                                    onClick={() => handleJourneyClick(journey.id)}
                                                                >
                                                                    {journey.name}
                                                                </a>
                                                            </h3>
                                                            <div className="product-content">
                                                                <p>
                                                                    Từ <strong>{journey.startName || "N/A"}</strong> đến{" "}
                                                                    <strong>{journey.endName || "N/A"}</strong>
                                                                </p>
                                                                <p>
                                                                    Thời gian bắt đầu:{" "}
                                                                    {journey.startTime
                                                                        ? new Date(journey.startTime).toLocaleString()
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="map-col">
                                                        <div
                                                            id={`map-${journey.id}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "150px",
                                                                borderRadius: "5px",
                                                                overflow: "hidden",
                                                            }}
                                                        ></div>
                                                    </td>
                                                    <td className="price-col">
                                                        {journey.distance
                                                            ? `${journey.distance.toFixed(2)} km`
                                                            : "Không xác định"}
                                                    </td>
                                                    <td className="stock-col">
                                                        <span className="in-stock">
                                                            {journey.duration
                                                                ? `${Math.round(journey.duration / 60)} phút`
                                                                : "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="action-col">
                                                        <button
                                                            className="btn btn-block btn-outline-primary-2"
                                                            onClick={() => handleJourneyClick(journey.id)}
                                                        >
                                                            <i className="icon-list-alt"></i> Xem chi tiết
                                                        </button>
                                                    </td>
                                                    <td className="remove-col">
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => handleDeleteJourney(journey.id)}
                                                        >
                                                            <i className="icon-close"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Phân trang */}
                            <nav aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                                        <a
                                            className="page-link page-link-prev"
                                            href="#"
                                            aria-label="Previous"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePrevious();
                                            }}
                                        >
                                            <span aria-hidden="true">
                                                <i className="icon-long-arrow-left"></i>
                                            </span>
                                            Lùi
                                        </a>
                                    </li>
                                    {renderPageNumbers()}
                                    <li
                                        className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
                                    >
                                        <a
                                            className="page-link page-link-next"
                                            href="#"
                                            aria-label="Next"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNext();
                                            }}
                                        >
                                            Tiến{" "}
                                            <span aria-hidden="true">
                                                <i className="icon-long-arrow-right"></i>
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>

                            {/* Chia sẻ */}
                            <div className="wishlist-share">
                                <div className="social-icons social-icons-sm mb-2">
                                    <label className="social-label">Chia sẻ trên:</label>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                            window.location.href
                                        )}`}
                                        className="social-icon"
                                        title="Facebook"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="icon-facebook-f"></i>
                                    </a>
                                    <a href="#" className="social-icon" title="Twitter" target="_blank">
                                        <i className="icon-twitter"></i>
                                    </a>
                                    <a href="#" className="social-icon" title="Instagram" target="_blank">
                                        <i className="icon-instagram"></i>
                                    </a>
                                    <a href="#" className="social-icon" title="Youtube" target="_blank">
                                        <i className="icon-youtube"></i>
                                    </a>
                                    <a href="#" className="social-icon" title="Pinterest" target="_blank">
                                        <i className="icon-pinterest"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JourneyHistory;