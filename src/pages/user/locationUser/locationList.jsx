import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCachedData, setCachedData } from "../../../utils/cacheUtils";
import { GetActitivyUser, GetLocationType, GetLocationUser, GetLocationByCategory } from "../../../services/User/locationUser";
import { Link, useNavigate, useParams } from "react-router-dom";

const LocationList = () => {
    const { categoryId } = useParams(); // Lấy categoryId từ URL
    const cache_locations = categoryId ? `location_cache_category_${categoryId}` : "location_cache";
    const cache_activity = "activity_cache";
    const cache_location_type = "locationType_cache";
    const navigate = useNavigate();
    const [activitys, setActivitys] = useState([]);
    const [locations, setLocations] = useState([]);
    const [locationType, setLocationType] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [displayedLocations, setDisplayedLocations] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        activity: [],
        locationType: [],
        difficultyLevel: []
    });
    const difficultyLevels = ["EASY", "MEDIUM", "HARD"];
    const [sortBy, setSortBy] = useState("popularity");
    const [loading, setLoading] = useState(false);
    const pageSize = 6;

    const fetchLocationType = async () => {
        const cachedData = getCachedData(cache_location_type);
        if (cachedData && Array.isArray(cachedData)) {
            setLocationType(cachedData);
            return;
        }

        try {
            const response = await GetLocationType();
            if (response.code === 200) {
                setLocationType(response.res);
                setCachedData(cache_location_type, response.res);
            } else {
                setLocationType([]);
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching location types:", error);
            toast.error("Không thể tải loại địa điểm.");
        }
    };

    const fetchActivity = async () => {
        const cachedData = getCachedData(cache_activity);
        if (cachedData && Array.isArray(cachedData)) {
            setActivitys(cachedData);
            return;
        }

        try {
            const response = await GetActitivyUser();
            if (response.code === 200) {
                setActivitys(response.res);
                setCachedData(cache_activity, response.res);
            } else {
                setActivitys([]);
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
            toast.error("Không thể tải hoạt động.");
        }
    };

    const fetchLocations = async () => {
        const cachedData = getCachedData(cache_locations);
        if (cachedData && Array.isArray(cachedData)) {
            setLocations(cachedData);
            setFilteredLocations(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let response;
            if (categoryId) {
                // Gọi API theo categoryId
                response = await GetLocationByCategory(categoryId);
            } else {
                // Gọi API lấy toàn bộ locations
                response = await GetLocationUser();
            }

            if (response.res && Array.isArray(response.res)) {
                setLocations(response.res);
                setFilteredLocations(response.res);
                setCachedData(cache_locations, response.res);
            } else {
                setLocations([]);
                setFilteredLocations([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách địa điểm:", error);
            setLocations([]);
            setFilteredLocations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationType();
        fetchActivity();
        fetchLocations();
    }, [categoryId]); // Thêm categoryId vào dependency để gọi lại khi categoryId thay đổi

    useEffect(() => {
        // Phân trang
        const start = page * pageSize;
        const end = start + pageSize;
        setDisplayedLocations(filteredLocations.slice(start, end));
        setTotalPages(Math.ceil(filteredLocations.length / pageSize) || 1);
    }, [filteredLocations, page]);

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
            activity: [],
            locationType: [],
            difficultyLevel: [],
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

    const handleLocationClick = (locationId) => {
        navigate(`/khampha/${locationId}`);
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
        let filtered = [...locations];

        // Lọc theo activity (yêu cầu địa điểm phải có TẤT CẢ các hoạt động được chọn)
        if (filter.activity.length > 0) {
            filtered = filtered.filter((location) =>
                filter.activity.every((activityId) =>
                    location.activities?.some((activity) => activity.id.toString() === activityId)
                )
            );
        }

        // Lọc theo locationType (yêu cầu địa điểm phải có TẤT CẢ các loại địa điểm được chọn)
        if (filter.locationType.length > 0) {
            filtered = filtered.filter((location) =>
                filter.locationType.every((typeId) =>
                    location.locationTypes?.some((locationType) => locationType.id.toString() === typeId)
                )
            );
        }

        // Lọc theo difficultyLevel (yêu cầu địa điểm có BẤT KỲ cấp độ khó nào trong danh sách được chọn)
        if (filter.difficultyLevel.length > 0) {
            filtered = filtered.filter((location) =>
                filter.difficultyLevel.includes(location.difficultyLevel)
            );
        }

        // Sắp xếp
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.avgRating - a.avgRating;
                case "date":
                    return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
                case "popularity":
                default:
                    return b.countReviews - a.countReviews;
            }
        });

        setFilteredLocations(filtered);
        setPage(0);
    }, [filter, sortBy, locations]);

    return (
        <>
            <div
                className="page-header text-center"
                style={{
                    backgroundImage:
                        'url(https://cdn.eva.vn/upload/2-2024/images/2024-05-17/image_oaf1638238969-1715916816-479-width1600height900.jpg)',
                }}
            >
                <div className="container">
                    <h1 className="page-title">
                        Trải nghiệm<span>du lịch tuyệt vời</span>
                    </h1>
                </div>
            </div>
            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="index.html">Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {categoryId ? `Danh mục ${categoryId}` : 'Địa điểm'}
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-9">
                            <div className="toolbox">
                                <div className="toolbox-left">
                                    <div className="toolbox-info">
                                        Hiển thị{" "}
                                        <span>
                                            {displayedLocations.length} trong{" "}
                                            {filteredLocations.length}
                                        </span>{" "}
                                        Địa điểm
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
                                                <option value="popularity">Phổ biến nhất</option>
                                                <option value="rating">Được đánh giá cao nhất</option>
                                                <option value="date">Ngày</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="products mb-3">
                                {loading ? (
                                    <div className="loading">Đang tải...</div>
                                ) : displayedLocations.length === 0 ? (
                                    <div className="no-posts">Không tìm thấy địa điểm nào.</div>
                                ) : (
                                    displayedLocations.map((location) => (
                                        <div className="product product-list" key={location.id}>
                                            <div className="row">
                                                <div className="col-6 col-lg-3">
                                                    <figure className="product-media">
                                                        <span className="product-label label-new">New</span>
                                                        <a href="product.html">
                                                            <img
                                                                src={location.locationImages}
                                                                alt="Product image"
                                                                className="product-image"
                                                                style={{ height: "250px", width: "240px" }}
                                                            />
                                                        </a>
                                                    </figure>
                                                </div>
                                                <div className="col-6 col-lg-3 order-lg-last">
                                                    <div className="product-list-action">
                                                        <div className="product-price">
                                                            {location.price === 0
                                                                ? "Miễn phí"
                                                                : location.price.toLocaleString("vi-VN") + " VND"}
                                                        </div>
                                                        <div className="ratings-container">
                                                            <div className="ratings">
                                                                <div
                                                                    className="ratings-val"
                                                                    style={{
                                                                        width: `${(location.avgRating / 5) * 100}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="ratings-text">
                                                                ( {location.countReviews} Đánh giá )
                                                            </span>
                                                        </div>

                                                        <a
                                                            href="#"
                                                            className="btn-product btn-cart"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLocationClick(location.id);
                                                            }}
                                                        >
                                                            <span>Xem chi tiết</span>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="product-body product-action-inner">
                                                        <a
                                                            href="#"
                                                            className="btn-product btn-wishlist"
                                                            title="Add to wishlist"
                                                        >
                                                            <span>add to wishlist</span>
                                                        </a>
                                                        <div className="product-cat">
                                                            <a href="#">{location.difficultyLevel}</a>
                                                        </div>
                                                        <h3 className="product-title">
                                                            <a href="product.html">{location.name}</a>
                                                        </h3>
                                                        <div className="product-content">
                                                            <p title={location.description}>
                                                                {location.description.length > 100
                                                                    ? location.description.substring(0, 100) + "..."
                                                                    : location.description}
                                                            </p>
                                                        </div>
                                                        {location.activities && location.activities.length > 0 && (
                                                            <div className="product-nav product-nav-thumbs">
                                                                {location.activities.map((activity, index) => (
                                                                    <a
                                                                        href="#"
                                                                        key={activity.id}
                                                                        className={index === 0 ? "active" : ""}
                                                                    >
                                                                        <img
                                                                            src={activity.imageUrl || 'https://via.placeholder.com/40'}
                                                                            alt={activity.name}
                                                                            style={{
                                                                                width: "40px",
                                                                                height: "40px",
                                                                                objectFit: "cover",
                                                                            }}
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
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
                                            Tiên{" "}
                                            <span aria-hidden="true">
                                                <i className="icon-long-arrow-right"></i>
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <aside className="col-lg-3 order-lg-first">
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
                                            Hoạt động
                                        </a>
                                    </h3>
                                    <div className="collapse show" id="widget-1">
                                        {activitys.length && (
                                            <div className="widget-body">
                                                <div className="filter-items filter-items-count">
                                                    {activitys.map((activity) => (
                                                        <div className="filter-item" key={activity.id}>
                                                            <div className="custom-control custom-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id={`activity-${activity.id}`}
                                                                    checked={filter.activity.includes(activity.id.toString())}
                                                                    onChange={() => handleFilterChange("activity", activity.id.toString())}
                                                                />
                                                                <label
                                                                    className="custom-control-label"
                                                                    htmlFor={`activity-${activity.id}`}
                                                                >
                                                                    {activity.name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                            Loại địa điểm
                                        </a>
                                    </h3>
                                    <div className="collapse show" id="widget-2">
                                        <div className="widget-body">
                                            {locationType.length > 0 && (
                                                <div className="filter-items">
                                                    {locationType.map((type) => (
                                                        <div className="filter-item" key={type.id}>
                                                            <div className="custom-control custom-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id={`type-${type.id}`}
                                                                    checked={filter.locationType.includes(type.id.toString())}
                                                                    onChange={() => handleFilterChange("locationType", type.id.toString())}
                                                                />
                                                                <label
                                                                    className="custom-control-label"
                                                                    htmlFor={`type-${type.id}`}
                                                                >
                                                                    {type.name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="widget widget-collapsible">
                                    <h3 className="widget-title">
                                        <a
                                            data-toggle="collapse"
                                            href="#widget-4"
                                            role="button"
                                            aria-expanded="true"
                                            aria-controls="widget-4"
                                        >
                                            Cấp độ
                                        </a>
                                    </h3>
                                    <div className="collapse show" id="widget-4">
                                        <div className="widget-body">
                                            <div className="filter-items">
                                                {difficultyLevels.map((level, index) => (
                                                    <div className="filter-item" key={index}>
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`level-${index}`}
                                                                checked={filter.difficultyLevel.includes(level)}
                                                                onChange={() => handleFilterChange("difficultyLevel", level)}
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`level-${index}`}
                                                            >
                                                                {level}
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default LocationList;