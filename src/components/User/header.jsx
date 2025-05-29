import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCategoryUser } from '../../services/User/Category';
import { toast } from 'react-toastify';
import { getCachedData, setCachedData } from '../../utils/cacheUtils';

const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

const Header = () => {
    const CACHE_KEY = "category_cache";
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();

    // Gọi API để lấy danh sách danh mục
    const listCategory = async () => {
        const cachedData = getCachedData(CACHE_KEY);
        if (cachedData && Array.isArray(cachedData)) {
            console.log("Using cached categories");
            setCategories(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getCategoryUser();
            if (response.res && Array.isArray(response.res)) {
                setCategories(response.res);
                setCachedData(CACHE_KEY, response.res);
            } else {
                setCategories([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            toast.error('Lỗi khi lấy danh sách danh mục');
            console.error('Lỗi khi lấy danh sách danh mục:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Gọi listCategory khi component mount
    useEffect(() => {
        listCategory();
    }, []);

    return (
        <header className="header">
            <div className="header-top">
                <div className="header-left">
                    <div className="header-dropdown">
                        <span>.</span>
                    </div>
                </div>

                <div className="header-right">
                    <ul className="top-menu">
                        <li key="links">
                            <a href="#">Links</a>
                            <ul>
                                <li key="phone">
                                    <a href="tel:#">
                                        <i className="icon-phone"></i>Call: +0123 456 789
                                    </a>
                                </li>
                                <li key="contact">
                                    <a href="contact.html">Liên hệ</a>
                                </li>
                                {isAuthenticated() ? (
                                    <>
                                        <li key="profile">
                                            <Link to="/profile" className="nav-link">
                                                <i className="fas fa-user"></i> Tài khoản
                                            </Link>
                                        </li>
                                        <li key="logout">
                                            <button
                                                onClick={logout}
                                                className="nav-link btn btn-link"
                                                style={{ padding: 0, border: 'none', background: 'none' }}
                                            >
                                                <i className="fas fa-sign-out-alt"></i> Đăng xuất
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <li key="login">
                                        <Link to="/login" className="nav-link">
                                            <i className="fas fa-sign-in-alt"></i> Đăng nhập
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="header-middle sticky-header">
                <div className="header-left">
                    <button className="mobile-menu-toggler">
                        <span className="sr-only">Toggle mobile menu</span>
                        <i className="icon-bars"></i>
                    </button>
                    <a href="index.html" className="logo">
                        <img src="images/demos/demo-24/logo.png" alt="Molla Logo" width="110" height="25" />
                    </a>
                </div>

                <div className="header-center">
                    <nav className="main-nav">
                        <ul className="menu sf-arrows">
                            <li className="megamenu-container active" key="home">
                                <Link to="/home" className="sf-with-ul">
                                    TRANG CHỦ
                                </Link>
                            </li>
                            <li key="product">
                                <a className="sf-with-ul">DANH MỤC</a>
                                <div className="megamenu megamenu-sm">
                                    <div className="row no-gutters">
                                        <div className="col-md-6">
                                            <div className="menu-col">
                                                <div className="menu-title">Các danh mục</div>
                                                <ul>

                                                    <li key="dia-diem">
                                                        <Link to="/khampha">Khám phá</Link>
                                                    </li>
                                                    {/* Bổ sung danh mục từ API */}
                                                    {loading ? (
                                                        <li key="loading">
                                                            <p>Đang tải danh mục...</p>
                                                        </li>
                                                    ) : categories.length === 0 ? (
                                                        <li key="no-categories">
                                                            <p>Không có danh mục bổ sung</p>
                                                        </li>
                                                    ) : (
                                                        categories.map((category) => (
                                                            <li key={`category-${category.id}`}>
                                                                <Link to={`/category/${category.id}`}>
                                                                    {category.name}
                                                                </Link>
                                                            </li>
                                                        ))
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="banner banner-overlay">
                                                <a href="category.html">
                                                    <img
                                                        src="https://www.vietnambooking.com/wp-content/uploads/2017/07/nhung-thien-duong-bien-phuquoc-nhat-dinh-phai-di-trong-mua-he-11032019-3.jpg"
                                                        alt="Banner"
                                                    />
                                                    <div className="banner-content banner-content-bottom">
                                                        <div className="banner-title text-white">
                                                            Khám Phá Những Chuyến Đi
                                                            <br />
                                                            <span>
                                                                <strong>Mùa Hè 2025</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li key="blog">
                                <Link to="/bai-viet" className="sf-with-ul">
                                    Bài viết
                                </Link>
                            </li>

                        </ul>
                    </nav>
                </div>

                <div className="header-right">
                    <div className="header-search">
                        <a href="#" className="search-toggle" role="button" title="Search">
                            <i className="icon-search"></i>
                        </a>
                        <form action="#" method="get">
                            <div className="header-search-wrapper">
                                <label htmlFor="q" className="sr-only">Search</label>
                                <input
                                    type="search"
                                    className="form-control"
                                    name="q"
                                    id="q"
                                    placeholder="Tìm kiếm..."
                                    required
                                />
                            </div>
                        </form>
                    </div>
                    <div className="wishlist">
                        <Link to="/journey-history" title="Lịch sử">
                            <p style={{ color: 'white' }}>Xem lịch sử</p>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;