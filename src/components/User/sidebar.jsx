import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetPostSearch, GetPostViewTop } from "../../services/publicPost";

const Sidebar = ({ onFilterChange = () => { } }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]); // Dữ liệu ban đầu (chỉ dùng cho thẻ tags)
    const [filteredPosts, setFilteredPosts] = useState([]); // Kết quả tìm kiếm
    const [filter, setFilter] = useState("");
    const [topPost, setTopPost] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm

    // Lấy dữ liệu ban đầu từ GetPostSearch để dùng cho mục "Duyệt theo thẻ"
    // Dùng để lấy tất cả bài viết một lần cho phần "Duyệt theo thẻ"
    useEffect(() => {
        if (!filter.trim()) return;
        GetPostSearch()
            .then((response) => {
                if (response.code === 200 && Array.isArray(response.res)) {
                    setPosts(response.res);
                } else {
                    setPosts([]);
                }
            })
            .catch((error) => {
                console.error("Lỗi trong GetPostSearch:", error);
                setPosts([]);
            });
    }, []); // 👈 chỉ chạy 1 lần khi component mount


    // Lấy bài viết phổ biến từ GetPostViewTop
    useEffect(() => {
        GetPostViewTop()
            .then((response) => {
                if (response.code === 200 && Array.isArray(response.res)) {
                    setTopPost(response.res);
                } else {
                    setTopPost([]);
                }
            })
            .catch((error) => {
                console.error("Lỗi trong GetPostViewTop:", error);
                setTopPost([]);
            });
    }, []);

    // Xử lý tìm kiếm khi nhấn button
    const handleSearch = (e) => {
        e.preventDefault(); // Ngăn reload trang
        if (!filter.trim()) {
            setFilteredPosts([]); // Không hiển thị gì nếu từ khóa rỗng
            onFilterChange([]);
            return;
        }

        setIsSearching(true); // Đánh dấu đang tìm kiếm
        GetPostSearch(filter)
            .then((response) => {
                if (response.code === 200 && Array.isArray(response.res)) {
                    setFilteredPosts(response.res);
                    onFilterChange(response.res);
                } else {
                    setFilteredPosts([]);
                    onFilterChange([]);
                }
            })
            .catch((error) => {
                console.error("Lỗi trong GetPostSearch với filter:", error);
                setFilteredPosts([]);
                onFilterChange([]);
            })
            .finally(() => setIsSearching(false)); // Kết thúc tìm kiếm
    };

    // Cập nhật filter khi nhập
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Chuyển hướng đến PostsDetail
    const handlePostClick = (postId) => {
        navigate(`/bai-viet/${postId}`);
    };

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

    return (
        <aside className="col-lg-3">
            <div className="sidebar">
                <div className="widget widget-search">
                    <h3 className="widget-title">Tìm kiếm</h3>
                    <form onSubmit={handleSearch}>
                        <label htmlFor="ws" className="sr-only">
                            Tìm kiếm bài viết
                        </label>
                        <input
                            type="search"
                            className="form-control"
                            name="ws"
                            id="ws"
                            placeholder="Tìm kiếm trong blog"
                            value={filter}
                            onChange={handleFilterChange}
                        />
                        <button type="submit" className="btn" disabled={isSearching}>
                            <i className="icon-search"></i>
                            <span className="sr-only">Tìm kiếm</span>
                        </button>
                    </form>
                </div>

                {filteredPosts.length > 0 && (
                    <div className="widget">
                        <h3 className="widget-title">Kết quả tìm kiếm</h3>
                        <ul className="posts-list">
                            {filteredPosts.map((post) => (
                                <li key={post.id}>
                                    <figure>
                                        <a
                                            href=""
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePostClick(post.id);
                                            }}
                                        >
                                            <img src={post.thumbnail} alt={post.name} />
                                        </a>
                                    </figure>
                                    <div>
                                        <span>{formatDate(post.createdDate)}</span>
                                        <h4>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePostClick(post.id);
                                                }}
                                            >
                                                {post.name}
                                            </a>
                                        </h4>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="widget">
                    <h3 className="widget-title">Bài viết phổ biến</h3>
                    <ul className="posts-list">
                        {topPost.map((post) => (
                            <li key={post.id}>
                                <figure>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePostClick(post.id);
                                        }}
                                    >
                                        <img src={post.thumbnail} alt={post.name} />
                                    </a>
                                </figure>
                                <div>
                                    <span>{formatDate(post.createdDate)}</span>
                                    <h4>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePostClick(post.id);
                                            }}
                                        >
                                            {post.name}
                                        </a>
                                    </h4>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="widget widget-banner-sidebar">
                    <div className="banner-sidebar-title">Quảng cáo 280 x 280</div>
                    <div className="banner-sidebar">
                        <a href="#">
                            <img src="/images/blog/sidebar/banner.jpg" alt="banner" />
                        </a>
                    </div>
                </div>

                <div className="widget">
                    <h3 className="widget-title">Duyệt theo thẻ</h3>
                    <div className="tagcloud">
                        {posts.flatMap((post) => post.tags).map((tag, index) => (
                            <a key={index} href="#">
                                {tag}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="widget widget-text">
                    <h3 className="widget-title">Giới thiệu Blog</h3>
                    <div className="widget-text-content">
                        <p>
                            Vestibulum volutpat, lacus a ultrices sagittis, mi neque euismod
                            dui, pulvinar nunc sapien ornare nisl.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;