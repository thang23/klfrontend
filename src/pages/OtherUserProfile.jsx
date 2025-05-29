import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCachedData, setCachedData } from "../utils/cacheUtils";
import { getUserProfileById } from "../services/User/userService";
import { GetPostsByUserId } from "../services/publicPost";

const CACHE_POSTS_KEY = "user_posts_cache_";
const PAGE_SIZE = 6;

const OtherUserProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        imageAvatar: "",
        username: "",
    });
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    // Lấy thông tin người dùng
    const fetchUserProfile = async () => {


        try {
            setLoadingUser(true);
            const response = await getUserProfileById(id);
            if (response.code === 200) {
                const { name, email, phoneNumber, dateOfBirth, imageAvatar, username } = response.res;
                const userData = { name, email, phoneNumber, dateOfBirth, imageAvatar, username };
                setUser(userData);
            } else {
                setError(response.message);
                toast.error(response.message);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Không thể tải thông tin người dùng. Vui lòng thử lại!");
            toast.error("Lỗi khi tải thông tin người dùng.");
        } finally {
            setLoadingUser(false);
        }
    };

    // Lấy danh sách bài viết của người dùng
    const fetchUserPosts = async () => {
        const cacheKey = `${CACHE_POSTS_KEY}${id}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
            setPosts(cachedData);
            return;
        }

        try {
            setLoadingPosts(true);
            const response = await GetPostsByUserId(id);
            if (response.code === 200 && Array.isArray(response.res)) {
                setPosts(response.res);
                setCachedData(cacheKey, response.res);
            } else {
                setPosts([]);
                toast.error("Dữ liệu bài viết không hợp lệ!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài viết:", error);
            toast.error("Không thể tải danh sách bài viết!");
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
    }, [id]);

    // Phân trang bài viết
    useEffect(() => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setDisplayedPosts(posts.slice(start, end));
        setTotalPages(Math.ceil(posts.length / PAGE_SIZE) || 1);
    }, [posts, page]);

    const handlePostClick = (postId) => {
        navigate(`/bai-viet/${postId}`);
    };

    const handlePrevious = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) setPage(page + 1);
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
                    <a className="page-link" href="#" onClick={() => setPage(i)}>
                        {i + 1}
                    </a>
                </li>
            );
        }
        return pageNumbers;
    };

    return (
        <>
            <div
                className="page-header text-center"
                style={{
                    backgroundImage: "url('https://generali.vn/_next/image?url=https%3A%2F%2Fnginx-cms-svc%2Fuploads%2Fcach_hieu_dan_ong_header_4a4f4af583.jpg&w=3840&q=75')",
                }}
            >
                <div className="container">
                    <h1 className="page-title">
                        Hồ sơ <span>{user.name || "Người dùng"}</span>
                    </h1>
                </div>
            </div>

            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-3">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Hồ sơ
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="dashboard">
                    <div className="container">
                        <div className="row">
                            <aside className="col-md-4 col-lg-3">
                                <ul
                                    className="nav nav-dashboard flex-column mb-3 mb-md-0"
                                    role="tablist"
                                >
                                    <li className="nav-item">
                                        <a
                                            className="nav-link active"
                                            id="tab-profile-link"
                                            data-toggle="tab"
                                            href="#tab-profile"
                                            role="tab"
                                            aria-controls="tab-profile"
                                            aria-selected="true"
                                        >
                                            Thông tin cá nhân
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link"
                                            id="tab-posts-link"
                                            data-toggle="tab"
                                            href="#tab-posts"
                                            role="tab"
                                            aria-controls="tab-posts"
                                            aria-selected="false"
                                        >
                                            Bài viết
                                        </a>
                                    </li>
                                </ul>
                            </aside>

                            <div className="col-md-8 col-lg-9">
                                <div className="tab-content">
                                    {/* Tab Thông tin cá nhân */}
                                    <div
                                        className="tab-pane fade show active"
                                        id="tab-profile"
                                        role="tabpanel"
                                        aria-labelledby="tab-profile-link"
                                    >
                                        <div className="row mb-3">
                                            <div className="col-12 text-center">
                                                {user.imageAvatar ? (
                                                    <img
                                                        src={user.imageAvatar}
                                                        alt="Avatar"
                                                        className="rounded-circle"
                                                        style={{
                                                            width: "150px",
                                                            height: "150px",
                                                            objectFit: "cover",
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src =
                                                                "https://via.placeholder.com/150";
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "150px",
                                                            height: "150px",
                                                            fontSize: "50px",
                                                            color: "#ccc",
                                                        }}
                                                    >
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                )}
                                                <h3 className="mt-3">
                                                    {user.username || "Người dùng"}
                                                </h3>
                                            </div>
                                        </div>

                                        {loadingUser ? (
                                            <div className="loading text-center">
                                                <div
                                                    className="spinner-border text-primary"
                                                    role="status"
                                                >
                                                    <span className="visually-hidden">
                                                        Đang tải...
                                                    </span>
                                                </div>
                                                <p>Đang tải thông tin...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="alert alert-danger">{error}</div>
                                        ) : (
                                            <div className="card card-dashboard">
                                                <div className="card-body">
                                                    <h3 className="card-title">
                                                        Thông tin cá nhân
                                                    </h3>
                                                    <p>
                                                        <strong>Tên người dùng:</strong>{" "}
                                                        {user.name || "Không có thông tin"}
                                                        <br />
                                                        <strong>Email:</strong>{" "}
                                                        {user.email || "Không có thông tin"}
                                                        <br />
                                                        <strong>Số điện thoại:</strong>{" "}
                                                        {user.phoneNumber || "Không có thông tin"}
                                                        <br />
                                                        <strong>Ngày sinh:</strong>{" "}
                                                        {user.dateOfBirth || "Không có thông tin"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tab Bài viết */}
                                    <div
                                        className="tab-pane fade"
                                        id="tab-posts"
                                        role="tabpanel"
                                        aria-labelledby="tab-posts-link"
                                    >
                                        {loadingPosts ? (
                                            <div className="loading text-center">
                                                <div
                                                    className="spinner-border text-primary"
                                                    role="status"
                                                >
                                                    <span className="visually-hidden">
                                                        Đang tải...
                                                    </span>
                                                </div>
                                                <p>Đang tải bài viết...</p>
                                            </div>
                                        ) : posts.length === 0 ? (
                                            <div className="card card-dashboard">
                                                <div className="card-body">
                                                    <p>Người dùng này chưa có bài viết nào.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {displayedPosts.map((post) => (
                                                    <article
                                                        key={post.id}
                                                        className="entry entry-list mb-3"
                                                    >
                                                        <div className="row align-items-center">
                                                            <div className="col-md-5">
                                                                <figure className="entry-media">
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handlePostClick(post.id);
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={post.thumbnail}
                                                                            alt={post.name}
                                                                        />
                                                                    </a>
                                                                </figure>
                                                            </div>
                                                            <div className="col-md-7">
                                                                <div className="entry-body">
                                                                    <div className="entry-meta">
                                                                        <span className="entry-author">
                                                                            by{" "}
                                                                            <Link
                                                                                to={`/profile/${post.user.id}`}
                                                                            >
                                                                                {post.user.name}
                                                                            </Link>
                                                                        </span>
                                                                        <span className="meta-separator">
                                                                            |
                                                                        </span>
                                                                        <span className="meta-separator">
                                                                            |
                                                                        </span>
                                                                        <a href="#">
                                                                            {post.commentCount} Comments
                                                                        </a>
                                                                    </div>
                                                                    <h2 className="entry-title">
                                                                        <a
                                                                            href="#"
                                                                            onClick={() =>
                                                                                handlePostClick(post.id)
                                                                            }
                                                                        >
                                                                            {post.name}
                                                                        </a>
                                                                    </h2>
                                                                    <div className="entry-cats">
                                                                        in{" "}
                                                                        {post.tags.length > 0 ? (
                                                                            post.tags.map(
                                                                                (tag, index) => (
                                                                                    <span key={index}>
                                                                                        <a href="#">
                                                                                            {tag}
                                                                                        </a>
                                                                                        {index <
                                                                                            post.tags
                                                                                                .length -
                                                                                            1 && ", "}
                                                                                    </span>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            <a href="#">
                                                                                Không có tag
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="entry-content">
                                                                        <p>
                                                                            {post.description.length >
                                                                                100
                                                                                ? `${post.description.substring(0, 100)}...`
                                                                                : post.description}
                                                                        </p>
                                                                        <a
                                                                            href="#"
                                                                            className="read-more"
                                                                            onClick={() =>
                                                                                handlePostClick(post.id)
                                                                            }
                                                                        >
                                                                            Continue Reading
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}

                                                {posts.length > 0 && (
                                                    <nav aria-label="Page navigation">
                                                        <ul className="pagination">
                                                            <li
                                                                className={`page-item ${page === 0 ? "disabled" : ""
                                                                    }`}
                                                            >
                                                                <a
                                                                    className="page-link page-link-prev"
                                                                    href="#"
                                                                    onClick={handlePrevious}
                                                                    aria-label="Previous"
                                                                >
                                                                    <span aria-hidden="true">
                                                                        <i className="icon-long-arrow-left"></i>
                                                                    </span>
                                                                    Prev
                                                                </a>
                                                            </li>
                                                            {renderPageNumbers()}
                                                            <li
                                                                className={`page-item ${page === totalPages - 1
                                                                    ? "disabled"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <a
                                                                    className="page-link page-link-next"
                                                                    href="#"
                                                                    onClick={handleNext}
                                                                    aria-label="Next"
                                                                >
                                                                    Next{" "}
                                                                    <span aria-hidden="true">
                                                                        <i className="icon-long-arrow-right"></i>
                                                                    </span>
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OtherUserProfile;