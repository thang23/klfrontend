import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetLocationById } from "../../../services/User/locationUser";
import { toast } from "react-toastify";
import { Carousel, Modal } from "react-bootstrap";
import goongJs from '@goongmaps/goong-js';
import { Link } from "react-router-dom";
const LocationDetailUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const descMapContainerRef = useRef(null);
    const descMapRef = useRef(null);
    const descMarkerRef = useRef(null);

    const fetchLocation = async () => {
        try {
            const response = await GetLocationById(id);
            if (response.code === 200) {
                setLocation(response.res);
            } else {
                setLocation(null);
            }
        } catch (error) {
            setLocation(null);
            console.error("Lỗi khi lấy bài viết:", error);
            toast.error("Không thể tải bài viết");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchLocation();
    }, [id]);

    useEffect(() => {
        if (location && descMapContainerRef.current && !descMapRef.current) {
            goongJs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;
            const lat = parseFloat(location.latitude) || 16.560205;
            const lng = parseFloat(location.longitude) || 107.652378;

            descMapRef.current = new goongJs.Map({
                container: descMapContainerRef.current,
                style: 'https://tiles.goong.io/assets/goong_map_web.json',
                center: [lng, lat],
                zoom: 10,
            });

            descMarkerRef.current = new goongJs.Marker()
                .setLngLat([lng, lat])
                .addTo(descMapRef.current);

            return () => {
                if (descMapRef.current) {
                    descMapRef.current.remove();
                    descMapRef.current = null;
                }
            };
        }
    }, [location]);

    // Định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return "Ngày không xác định";
        }
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };
    useEffect(() => {
        if (!loading && !location) {
            navigate('/404');
        }
    }, [loading, location, navigate]);
    if (loading) return <div>Đang tải...</div>;


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
            <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
                <div className="container-fluid d-flex align-items-center">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/home">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/khampha">Địa điểm</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Chi tiết</li>
                    </ol>


                </div>
            </nav>


            <div className="page-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xl-10">
                            <div className="product-details-top">
                                <div className="row">
                                    <div className="col-md-6 col-lg-7">
                                        <div className="product-gallery">
                                            <figure className="product-main-image">
                                                <span className="product-label label-sale">Hot</span>
                                                <img
                                                    id="product-zoom"
                                                    src={currentImage || location.locationImages?.[0] || '/images/products/single/fullwidth/3.jpg'}
                                                    data-zoom-image={currentImage || location.locationImages?.[0] || '/images/products/single/fullwidth/3-big.jpg'}
                                                    alt="location image"
                                                />
                                                <a
                                                    href="#"
                                                    id="btn-product-gallery"
                                                    className="btn-product-gallery"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowGallery(true);
                                                    }}
                                                >
                                                    <i className="icon-arrows"></i>
                                                </a>
                                            </figure>

                                            <div id="product-zoom-gallery" className="product-image-gallery max-col-6">
                                                {location.locationImages?.map((img, index) => (
                                                    <a
                                                        key={index}
                                                        className={`product-gallery-item ${currentImage === img || (index === 0 && !currentImage) ? 'active' : ''}`}
                                                        href="#"
                                                        data-image={img}
                                                        data-zoom-image={img}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentImage(img);
                                                        }}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`location image ${index + 1}`}
                                                        />
                                                    </a>
                                                ))}
                                            </div>

                                            {/* Popup Gallery Modal */}
                                            <Modal
                                                show={showGallery}
                                                onHide={() => setShowGallery(false)}
                                                size="lg"
                                                centered
                                            >
                                                <Modal.Header closeButton>
                                                    <Modal.Title>{location.name} - Ảnh</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {currentImage || location.locationImages?.[0] ? (
                                                        <img
                                                            src={currentImage || location.locationImages?.[0] || '/images/products/single/fullwidth/3.jpg'}
                                                            alt="selected location image"
                                                            className="img-fluid"
                                                        />
                                                    ) : (
                                                        <p>Không có ảnh để hiển thị</p>
                                                    )}
                                                </Modal.Body>
                                            </Modal>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-lg-5">

                                        <div className="product-details">
                                            <h1 className="product-title">{location.name}</h1>

                                            <div className="ratings-container">
                                                <div className="ratings">
                                                    <div
                                                        className="ratings-val"
                                                        style={{
                                                            width: `${(location.locationReviews?.reduce((sum, r) => sum + r.rating, 0) /
                                                                location.locationReviews?.length || 0) * 20
                                                                }%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <a className="ratings-text" href="#product-accordion" id="review-link"> ({location.locationReviews?.length || 0} Đánh giá)</a>
                                            </div>

                                            <div className="product-price">
                                                <span className="new-price"> {location.price === 0
                                                    ? "Miễn phí"
                                                    : location.price.toLocaleString("vi-VN") + " VND"}</span>

                                            </div>

                                            <div className="product-content">
                                                Địa chỉ:
                                                <span style={{ marginLeft: '6px' }}>{location.address}</span>
                                            </div>

                                            <div className="details-filter-row details-row-size">
                                                <div className="product-cat">
                                                    <span>Có thể đến bằng:</span>{" "}
                                                    {location.transportations?.map((trans, index) => (
                                                        <span key={trans.id} style={{ marginRight: '8px' }}>
                                                            {trans.name}
                                                            {index < location.transportations.length - 1 && ','}
                                                        </span>
                                                    ))}
                                                </div>

                                            </div>

                                            <div className="details">
                                                <label htmlFor="size" style={{
                                                    color: "#ff5722",           // Màu cam nổi bật

                                                    padding: "10px 10px",        // Khoảng cách bên trong

                                                }}>
                                                    Loại cấp độ: {location.difficultyLevel}
                                                </label>

                                            </div>


                                            <div className="product-details-action">
                                                <Link
                                                    to={{
                                                        pathname: "/dieuhuong",
                                                        search: `?lat=${parseFloat(location.latitude)}&lng=${parseFloat(location.longitude)}&name=${encodeURIComponent(location.name)}&locationId=${location.id}`,
                                                    }}
                                                    className="btn-product btn-cart"
                                                >
                                                    <span>Xem lộ trình</span>
                                                </Link>

                                                <div className="details-action-wrapper">
                                                    <a href="#" className="btn-product btn-wishlist" title="Wishlist"><span>Thêm vào yêu thích</span></a>
                                                </div>
                                            </div>

                                            <div className="product-details-footer">
                                                <div className="product-cat">

                                                    <span>Loại địa điểm:</span>
                                                    {location.locationTypes?.map((type, index) => (
                                                        <a key={type.id} href={`/locations/type/${type.id}`} className="me-1">
                                                            {type.name}{index < location.locationTypes.length - 1 ? ',' : ''}
                                                        </a>
                                                    ))}

                                                </div>

                                                <div className="social-icons social-icons-sm">
                                                    <span className="social-label">Chia sẻ:</span>
                                                    <a
                                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                                        className="social-icon"
                                                        title="Facebook"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i className="icon-facebook-f"></i>
                                                    </a>
                                                    <a href="#" className="social-icon" title="Twitter" target="_blank"><i className="icon-twitter"></i></a>
                                                    <a href="#" className="social-icon" title="Instagram" target="_blank"><i className="icon-instagram"></i></a>
                                                    <a href="#" className="social-icon" title="Pinterest" target="_blank"><i className="icon-pinterest"></i></a>
                                                </div>
                                            </div>

                                            <div className="accordion accordion-plus product-details-accordion" id="product-accordion">
                                                <div className="card card-box card-sm">
                                                    <div className="card-header" id="product-desc-heading">
                                                        <h2 className="card-title">
                                                            <a className="collapsed" role="button" data-toggle="collapse" href="#product-accordion-desc" aria-expanded="false" aria-controls="product-accordion-desc">
                                                                Mô tả chi tiết
                                                            </a>
                                                        </h2>
                                                    </div>
                                                    <div id="product-accordion-desc" className="collapse" aria-labelledby="product-desc-heading" data-parent="#product-accordion">
                                                        <div className="card-body">
                                                            <div className="product-desc-content">
                                                                <p>{location.description}</p>
                                                                <ul>
                                                                    <li>Vị trí trên bản đồ</li>
                                                                </ul>
                                                                <div
                                                                    ref={descMapContainerRef}
                                                                    className="map-container"
                                                                    style={{ height: '300px', width: '100%' }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card card-box card-sm">
                                                    <div className="card-header" id="product-info-heading">
                                                        <h2 className="card-title">
                                                            <a className="collapsed" role="button" data-toggle="collapse" href="#product-accordion-info" aria-expanded="false" aria-controls="product-accordion-info">
                                                                Người đóng góp
                                                            </a>
                                                        </h2>
                                                    </div>
                                                    <div id="product-accordion-info" className="collapse" aria-labelledby="product-info-heading" data-parent="#product-accordion">
                                                        <div className="card-body">
                                                            <div className="product-desc-content">
                                                                <p>Bạn vừa khám phá một địa điểm du lịch tuyệt vời mà ít người biết đến? Hãy chia sẻ hành trình và cảm nhận của bạn để nhiều người cùng biết đến! Mỗi đóng góp của bạn sẽ giúp cộng đồng du lịch ngày càng phong phú và sinh động hơn. </p>

                                                                <h3>Người tạo:  {location.createdBy}</h3>
                                                                <ul>
                                                                    <li>Thời gian tạo:{formatDate(location.createdDate)}</li>
                                                                    <li>Thời gian cập nhật: {formatDate(location.modifiedDate)}</li>
                                                                </ul>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card card-box card-sm">
                                                    <div className="card-header" id="product-review-heading">
                                                        <h2 className="card-title">
                                                            <a role="button" data-toggle="collapse" href="#product-accordion-review" aria-expanded="true" aria-controls="product-accordion-review">
                                                                Đánh giá ({location.locationReviews?.length || 0})
                                                            </a>
                                                        </h2>
                                                    </div>
                                                    <div id="product-accordion-review" className="collapse show" aria-labelledby="product-review-heading" data-parent="#product-accordion">
                                                        <div className="card-body">
                                                            {location.locationReviews?.length > 0 ? (
                                                                location.locationReviews.map((review) => (
                                                                    <div className="reviews">
                                                                        <div className="review">
                                                                            <div className="row no-gutters">
                                                                                <div className="col-auto">
                                                                                    {/* Sau này phát triển người dùng*/}
                                                                                    <h4><a href="">{review.createdBy ? review.createdBy : 'Ẩn danh'}</a></h4>
                                                                                    <div className="ratings-container">
                                                                                        <div className="ratings">
                                                                                            <div className="ratings-val" style={{
                                                                                                width: `${(review.rating || 0) * 20}%`
                                                                                            }}></div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="review-date">{formatDate(review.createdDate)}</span>
                                                                                </div>
                                                                                <div className="col">


                                                                                    <div className="review-content">
                                                                                        <p>{review.content}</p>
                                                                                    </div>

                                                                                    <div className="review-action">
                                                                                        <a href="#"><i className="icon-thumbs-up"></i>Thích (2)</a>
                                                                                        <a href="#"><i className="icon-thumbs-down"></i>Không thích (0)</a>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p>Không có hoạt động nào</p>

                                                            )}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="col-xl-2 d-md-none d-xl-block">
                            <div className="sidebar sidebar-product">
                                <div className="widget widget-products">
                                    <h5 className="widget-title">Những gì có thể làm </h5>


                                    <div className="products">
                                        {location.activities?.length > 0 ? (
                                            location.activities.map((activity) => (
                                                <div className="product product-sm" key={activity.id}>
                                                    <figure className="product-media">
                                                        <a href="">
                                                            <img src={activity.imageUrl} alt={activity.name} className="product-image" style={{ width: '80px', height: '80px' }} />
                                                        </a>
                                                    </figure>

                                                    <div className="product-body">
                                                        <h5 className="product-title"><a href="product.html">{activity.name} <br />{activity.description}</a></h5>

                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Không có hoạt động nào</p>

                                        )}

                                    </div>

                                    <Link to="/khampha" className="btn btn-outline-dark-3">
                                        <span>Xem thêm các nơi khác</span>
                                        <i className="icon-long-arrow-right"></i>
                                    </Link>
                                </div>

                                <div className="widget widget-banner-sidebar">
                                    <div className="banner-sidebar banner-overlay">
                                        <a href="">
                                            <img src="https://huedailytour.net/wp-content/uploads/2018/03/Dai-noi.png" alt="banner" />
                                        </a>
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
export default LocationDetailUser;