import { useEffect, useState } from "react";
import Banners from "../components/User/banners";
import BannersActivity from "../components/User/bannersActivity";
import FeaturedPost from "../components/User/featuredPost";
import VideoBanner from "../components/User/videoBanner";
import { GetNewPost, GetPostViewTop } from "../services/publicPost";
import { getCachedData, setCachedData } from "../utils/cacheUtils";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel";

const Home = () => {
    const [newPosts, setNewPosts] = useState([]);
    const [loadingNewPosts, setLoadingNewPosts] = useState(true);
    const [topPost, setTopPost] = useState([]);
    const [loadingTopPost, setLoadingTopPost] = useState(true);
    const CACHE_KEY = "new_posts";

    const fetchNewPosts = async () => {
        setLoadingNewPosts(true); // Đảm bảo loading bắt đầu
        const cachedData = getCachedData(CACHE_KEY);

        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
            console.log("Using cached data:", cachedData);
            setNewPosts(cachedData);
            setLoadingNewPosts(false);
            return;
        }

        try {
            const response = await GetNewPost();
            if (response.res && Array.isArray(response.res) && response.res.length > 0) {
                setNewPosts(response.res);
                setCachedData(CACHE_KEY, response.res);
                console.log("Fetched new posts:", response.res);
            } else {
                setNewPosts([]);
                toast.error("Không có bài viết mới từ API!");
            }
        } catch (error) {
            console.error("Error fetching new posts:", error);
            toast.error("Không thể tải bài viết mới!");
            setNewPosts([]);
        } finally {
            setLoadingNewPosts(false);
        }
    };

    const fetchTopPosts = async () => {
        setLoadingTopPost(true);
        try {
            const response = await GetPostViewTop();
            if (response.res && Array.isArray(response.res)) {
                setTopPost(response.res);
            } else {
                setTopPost([]);
                toast.error("Dữ liệu không hợp lệ từ API!");
            }
        } catch (error) {
            console.error("Error fetching top posts:", error);
            toast.error("Không thể tải bài viết nổi bật!");
            setTopPost([]);
        } finally {
            setLoadingTopPost(false);
        }
    };

    useEffect(() => {
        fetchNewPosts();
        fetchTopPosts();
    }, []);

    // Log để kiểm tra newPosts
    useEffect(() => {
        console.log("newPosts updated:", newPosts);
    }, [newPosts]);

    // Khởi tạo Owl Carousel
    useEffect(() => {
        if (!loadingNewPosts && newPosts.length > 0) {
            window.$(".owl-carousel").owlCarousel({
                nav: true,
                dots: false,
                items: 3,
                margin: 20,
                loop: false,
                responsive: {
                    0: { items: 1, dots: true },
                    520: { items: 2, dots: true },
                    768: { items: 3 },
                },
            });
        }
    }, [loadingNewPosts, newPosts]);

    const formatDate = (dateString) =>
        dateString
            ? new Date(dateString).toISOString().split("T")[0]
            : "Ngày không xác định";

    return (
        <>
            <section className="logos">

            </section>
            <Banners />

            <VideoBanner />


            <section className="blog mb-6">
                <div className="container">
                    <div className="heading">
                        <h3 className="heading-title">Bài viết mới</h3>
                    </div>
                    {loadingNewPosts ? (
                        <div className="text-center">
                            <p>Đang tải...</p>
                        </div>
                    ) : newPosts.length === 0 ? (
                        <div className="text-center">
                            <p>Không có bài viết mới.</p>
                        </div>
                    ) : (
                        <div
                            className="owl-carousel owl-simple mb-4"
                            data-toggle="owl"
                            data-owl-options='{
                                "nav": true,
                                "dots": false,
                                "items": 3,
                                "margin": 20,
                                "loop": false,
                                "responsive": {
                                    "0": { "items": 1, "dots": true },
                                    "520": { "items": 2, "dots": true },
                                    "768": { "items": 3 }
                                }
                            }'
                        >
                            {newPosts.map((post) => (
                                <article className="entry" key={post.id}>
                                    <figure className="entry-media">
                                        <Link to={`/bai-viet/${post.id}`}>
                                            <img src={post.thumbnail} alt={post.name || "Untitled"} style={{ height: "250px" }} />
                                        </Link>
                                    </figure>
                                    <div className="entry-body text-center">
                                        <div className="entry-meta">
                                            <Link to={`/bai-viet/${post.id}`}>
                                                {formatDate(post.createdDate)}
                                            </Link>
                                            , {post.commentCount} Bình luận
                                        </div>
                                        <h3 className="entry-title">
                                            <Link to={`/bai-viet/${post.id}`}>
                                                {post.name || "Untitled"}
                                            </Link>
                                        </h3>
                                        <div className="entry-content">
                                            <Link to={`/post/${post.id}`} className="read-more">
                                                đọc thêm
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="instagram mb-3">
                <div className="container">
                    <div className="heading">
                        <p className="heading-cat">THEO DÕI CHÚNG TÔI TRÊN FACEBOOK Bạn Thắng Dấu Tên</p>
                    </div>
                    {loadingTopPost ? (
                        <div className="text-center">
                            <p>Đang tải...</p>
                        </div>
                    ) : topPost.length === 0 ? (
                        <div className="text-center">
                            <p>Không có bài viết.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {topPost.map((post) => (
                                <div className="col-xl-5col col-md-3 col-6 instagram-feed" key={post.id}>
                                    <img
                                        src={post.thumbnail}
                                        alt={post.name}
                                        style={{
                                            height: "123px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <div className="instagram-feed-content">
                                        <Link to={`/bai-viet/${post.id}`}>
                                            <i className="icon-eye"></i>
                                            {post.views}
                                        </Link>
                                        <Link to={`/bai-viet/${post.id}`}>
                                            <i className="icon-comments"></i>
                                            {post.commentCount}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Home;