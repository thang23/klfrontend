import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { getCachedData, setCachedData } from "../utils/cacheUtils";
import { GetPostPublic } from "../services/publicPost";
import Sidebar from "../components/User/sidebar";

const CACHE_KEY = "posts_cache";
const PAGE_SIZE = 6;

const PostsList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        const cachedData = getCachedData(CACHE_KEY);
        if (cachedData && Array.isArray(cachedData)) {
            setPosts(cachedData);
            setFilteredPosts(cachedData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await GetPostPublic();
            if (response.code === 200 && Array.isArray(response.res)) {
                setPosts(response.res);
                setFilteredPosts(response.res);
                setCachedData(CACHE_KEY, response.res);
            } else {
                setPosts([]);
                setFilteredPosts([]);

            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài viết:", error);

            setPosts([]);
            setFilteredPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Fetching posts...");
        fetchPosts();
    }, []);

    useEffect(() => {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setDisplayedPosts(filteredPosts.slice(start, end));
        setTotalPages(Math.ceil(filteredPosts.length / PAGE_SIZE) || 1);
    }, [filteredPosts, page]);

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

    if (loading) return <div className="loading">Đang tải bài viết...</div>;

    return (
        <>
            <div
                className="page-header text-center"
                style={{ backgroundImage: "url('https://imgproxy.natucate.com/e3LAkAUApMMum8dtFT9uJhfH9xVpZdrLrb1hHsLL0Xw/rs:fill/g:ce/w:1780/h:1001/aHR0cHM6Ly93d3cubmF0dWNhdGUuY29tL21lZGlhL3BhZ2VzL2Jsb2cvcmF0Z2ViZXIvcG9zdC1ob2xpZGF5LWJsdWVzLzI2ZjkxMzI3YTYtMTY5Nzc0MjM0NS9ibG9nLXRyYXZlbC1ndWlkZS1wb3N0LXRyYXZlbC1ibHVlcy1taW5kZnVsLmpwZWc')" }}
            >
                <div className="container">
                    <h1 className="page-title">
                        Hành Trình Khám Phá<span>Blog Du Lịch</span>
                    </h1>
                </div>

            </div>
            <nav aria-label="breadcrumb" className="breadcrumb-nav mb-3">
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/home">Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <a>Bài viết</a>
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-9">
                            {displayedPosts.length === 0 ? (
                                <div className="no-posts">Không tìm thấy bài viết nào.</div>
                            ) : (
                                displayedPosts.map((post) => (
                                    <article key={post.id} className="entry entry-list">
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
                                                        <img src={post.thumbnail} alt={post.name} />
                                                    </a>
                                                </figure>
                                            </div>
                                            <div className="col-md-7">
                                                <div className="entry-body">
                                                    <div className="entry-meta">
                                                        <span className="entry-author">
                                                            by{" "}
                                                            <Link to={`/profile/${post.user.id}`}>
                                                                {post.user.name}
                                                            </Link>
                                                        </span>
                                                        <span className="meta-separator">|</span>
                                                        <span className="meta-separator">|</span>
                                                        <a href="#">{post.commentCount} Comments</a>
                                                    </div>
                                                    <h2 className="entry-title">
                                                        <a
                                                            href="#"
                                                            onClick={() => handlePostClick(post.id)}
                                                        >
                                                            {post.name}
                                                        </a>
                                                    </h2>
                                                    <div className="entry-cats">
                                                        in{" "}
                                                        {post.tags.length > 0 ? (
                                                            post.tags.map((tag, index) => (
                                                                <span key={index}>
                                                                    <a href="#">{tag}</a>
                                                                    {index < post.tags.length - 1 && ", "}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <a href="#">Không có tag</a>
                                                        )}
                                                    </div>
                                                    <div className="entry-content">
                                                        <p>
                                                            {post.description.length > 100
                                                                ? `${post.description.substring(0, 100)}...`
                                                                : post.description}
                                                        </p>
                                                        <Link
                                                            to={`/profile/${post.user.id}`}
                                                            className="author-link"
                                                        >
                                                            Xem tất cả bài viết của {post.user.name}{" "}
                                                            <i className="icon-long-arrow-right"></i>
                                                        </Link>
                                                        <br />
                                                        <a
                                                            href="#"
                                                            className="read-more"
                                                            onClick={() => handlePostClick(post.id)}
                                                        >
                                                            Tiếp tục đọc
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}

                            <nav aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
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
                                        className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
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
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostsList;