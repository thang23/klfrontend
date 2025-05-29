import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { countComments, GetPostById } from "../services/publicPost";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Sidebar from '../components/User/sidebar';
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import { CreatComment, DeleteComment, UpdateComment } from "../services/User/comment";
import { Link } from 'react-router-dom';

const PostsDetail = () => {

    const userId = localStorage.getItem('userId');
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);
    const [formData, setFormData] = useState({
        content: "",
        postId: id,
        parentCommentId: null,
    });
    const [nameComment, setNameComment] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [commentId, setCommentId] = useState(null);
    const [showEditCommentModal, setShowEditCommentModal] = useState(false);

    // Xử lý thay đổi dữ liệu biểu mẫu
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // Lấy dữ liệu bài viết
    const fetchPost = async () => {
        try {
            const response = await GetPostById(id);
            if (response.code === 200) {
                setPost(response.res);
                setComments(response.res.comments || []); // Đảm bảo comments không undefined
            } else {
                setPost(null);
            }
        } catch (error) {
            setPost(null);
            console.error("Lỗi khi lấy bài viết:", error);
            toast.error("Không thể tải bài viết");
        } finally {
            setLoading(false);
        }
    };


    const updateComments = (comments, newComment) => {
        // Hàm phụ để kiểm tra xem ID bình luận có tồn tại trong danh sách (bao gồm replies)
        const hasCommentId = (comments, commentId) => {
            return comments.some(
                (comment) =>
                    comment.id === commentId ||
                    (comment.replies && hasCommentId(comment.replies, commentId))
            );
        };

        // Nếu ID bình luận tồn tại trong danh sách (cập nhật bình luận)
        if (hasCommentId(comments, newComment.id)) {
            return comments.map((comment) => {
                if (comment.id === newComment.id) {
                    return { ...comment, content: newComment.content }; // Cập nhật nội dung
                }
                if (comment.replies && comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: updateComments(comment.replies, newComment), // Đệ quy cho phản hồi
                    };
                }
                return comment;
            });
        }

        // Thêm bình luận mới nếu không có parentCommentId
        if (!newComment.parentCommentId) {
            return [...comments, newComment];
        }

        // Thêm phản hồi (reply) vào bình luận cha
        return comments.map((comment) => {
            if (comment.id === newComment.parentCommentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment], // Thêm phản hồi
                };
            }
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateComments(comment.replies, newComment), // Đệ quy cho phản hồi
                };
            }
            return comment;
        });
    };

    // Hàm xóa bình luận trong trạng thái
    const removeComment = (comments, commentId) => {
        return comments.filter((comment) => {
            if (comment.id === commentId) return false; // Loại bỏ bình luận khớp
            if (comment.replies && comment.replies.length > 0) {
                comment.replies = removeComment(comment.replies, commentId); // Đệ quy xóa trong replies
            }
            return true;
        });
    };

    useEffect(() => {
        fetchPost();
        // setupWebSocket(id); // Vô hiệu hóa tạm thời
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("WebSocket đã ngắt kết nối");
            }
        };
    }, [id]);

    // Gửi bình luận
    const handleCommentSubmit = async () => {
        if (!formData.content.trim()) {
            toast.error("Bình luận không được để trống");
            return;
        }

        try {
            const response = await CreatComment(formData);
            if (response.code === 200) {
                setComments((prev) => updateComments(prev, response.res));
                handleCloseReplyModal();
                setFormData({ content: "", postId: id, parentCommentId: null });
                toast.success("Bình luận thành công!");
            } else {
                toast.error("Không thể gửi bình luận");
            }
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
            toast.error("Không thể gửi bình luận");
        }
    };

    // Mở modal trả lời
    const handleOpenReplyModal = (comment) => {
        if (!comment) return;
        setNameComment(comment.user.name);
        setFormData((prev) => ({
            ...prev,
            postId: id,
            parentCommentId: comment.id,
            content: "",
        }));
        setShowReplyModal(true);
    };

    // Đóng modal trả lời
    const handleCloseReplyModal = () => {
        setShowReplyModal(false);
        setFormData({ content: "", postId: id, parentCommentId: null });
        setNameComment(null);
    };

    // Mở modal hành động (xóa bình luận)
    const handleOpenCommentAction = (commentId) => {
        setCommentId(commentId);
        setShowActionModal(true);
    };

    // Xóa bình luận
    const handleDeleteComment = async () => {
        try {
            const response = await DeleteComment(commentId);
            if (response.code === 200) {
                setComments((prev) => removeComment(prev, commentId)); // Cập nhật trạng thái
                setShowActionModal(false); // Đóng modal
                setCommentId(null);
                toast.success(response.message || "Xóa bình luận thành công");
            } else {
                toast.error(response.message || "Không thể xóa bình luận");
            }
        } catch (error) {
            console.error("Lỗi khi xóa bình luận:", error);
            toast.error("Không thể xóa bình luận");
        }
    };

    // mở sửa commentcomment
    const handleUpdateComment = (comment) => {
        if (!comment) return;
        setCommentId(comment.id);
        setFormData((prev) => ({
            ...prev,
            content: comment.content
        }));
        setShowEditCommentModal(true)
    }
    // đống sửa comment
    const handleCloseUpdateModal = () => {
        setShowEditCommentModal(false);
    }
    //Gửi bình luận update
    const handleUpdateCommentSubmit = async () => {
        if (!formData.content.trim()) {
            toast.error("Bình luận không được để trống");
            return;
        }

        try {
            const response = await UpdateComment(commentId, formData.content);
            if (response.code === 200) {
                setComments((prev) => updateComments(prev, response.res));
                handleCloseUpdateModal();
                setFormData({ content: "" });
                setCommentId(null);
                toast.success("Sửa bình luận thành công!");
            } else {
                toast.error("Không thể gửi bình luận");
            }
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
            toast.error("Không thể gửi bình luận");
        }
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

    // Component hiển thị bình luận đệ quy
    const CommentItem = ({ comment, level = 0 }) => {
        return (
            <li key={comment.id} style={{ marginLeft: `${level * 20}px` }}>
                <div className="comment">
                    <figure className="comment-media">

                        <Link to={`/profile/${comment.user.id}`}>
                            <img
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                                src={comment.user.imageAvatar}
                                alt={comment.user.name}
                            />
                        </Link>


                    </figure>
                    <button onClick={() => handleOpenCommentAction(comment.id)}
                        style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            marginLeft: "15px",
                            padding: "0",
                        }}>
                        ⋮
                    </button>
                    <div className="comment-body">
                        <div style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                            <button
                                className="comment-reply"
                                onClick={() => handleOpenReplyModal(comment)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: "0",

                                }}
                            >
                                Trả lời
                            </button>
                            {userId && comment.user.id === parseInt(userId) && (
                                <button onClick={() => handleUpdateComment(comment)}
                                    style={{
                                        border: "none",
                                        background: "none",
                                        cursor: "pointer",
                                        padding: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <i className="fa fa-pencil"></i>
                                    <span>Sửa</span>
                                </button>
                            )}

                        </div>
                        <div className="comment-user">
                            <h4>
                                <a href="#" style={{ textDecoration: "none" }}>
                                    {comment.user.name}
                                </a>
                            </h4>
                            <span className="comment-date">{formatDate(comment.createdDate)}</span>
                        </div>
                        <div className="comment-content">
                            <p>{comment.content}</p>
                        </div>
                    </div>

                </div>
                {comment.replies?.length > 0 && (
                    <ul>
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} level={level + 1} />
                        ))}
                    </ul>
                )}
            </li>
        );
    };

    if (loading) return <div>Đang tải bài viết...</div>;
    if (!post) return <div>Không tìm thấy bài viết</div>;

    return (
        <>
            <div
                className="page-header text-center"
                style={{ backgroundImage: `url(${post.thumbnail})` }}
            >
                <div className="container">
                    <h1 className="page-title">
                        Khám Phá Vẻ Đẹp Tuyệt Vời<span>Hành Trình Đến Thiên Đường Du Lịch</span>
                    </h1>
                </div>

            </div>
            <nav
                aria-label="breadcrumb"
                className="breadcrumb-nav mb-3"
                style={{ backgroundColor: "#ffffff" }}
            >
                <div className="container">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="index.html">Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/bai-viet">Bài viết</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {post.name}
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="page-content">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-9">
                            <article className="entry single-entry">
                                <figure className="entry-media">
                                    <img src={post.thumbnail} alt={post.name} style={{ height: "470px" }} />
                                </figure>

                                <div className="entry-body">
                                    <div className="entry-meta">
                                        <span className="entry-author">
                                            by <a href="#">{post.user.name}</a>
                                        </span>
                                        <span className="meta-separator">|</span>
                                        <a href="#">{formatDate(post.createdDate)}</a>
                                        <span className="meta-separator">|</span>
                                        <a href="#">{countComments(post.comments)} Bình luận</a>
                                    </div>

                                    <h2
                                        className="entry-title"
                                        style={{
                                            fontSize: "28px",
                                            fontWeight: 700,
                                            marginBottom: "15px",
                                            color: "#222",
                                        }}
                                    >
                                        {post.name}
                                    </h2>

                                    <div className="entry-content editor-content">
                                        {post.contents.map((item, index) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "20px",
                                                    marginBottom: "20px",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                {item.type === "text" && (
                                                    <div style={{ flex: 1, minWidth: "200px" }}>
                                                        {item.value.split("\n").map((line, i) => {
                                                            if (line.startsWith("Tiêu đề:")) {
                                                                return (
                                                                    <h3
                                                                        key={i}
                                                                        style={{
                                                                            fontSize: "22px",
                                                                            fontWeight: 600,
                                                                            margin: "20px 0",
                                                                            color: "#222",
                                                                        }}
                                                                    >
                                                                        {line.replace("Tiêu đề:", "").trim()}
                                                                    </h3>
                                                                );
                                                            }
                                                            if (line.startsWith("Mô tả:")) {
                                                                return (
                                                                    <p key={i} style={{ marginBottom: "20px" }}>
                                                                        {line.replace("Mô tả:", "").trim()}
                                                                    </p>
                                                                );
                                                            }
                                                            if (line.startsWith("- ")) {
                                                                return (
                                                                    <ul
                                                                        key={i}
                                                                        style={{
                                                                            listStyle: "disc",
                                                                            paddingLeft: "40px",
                                                                            margin: "20px 0",
                                                                        }}
                                                                    >
                                                                        <li style={{ marginBottom: "10px" }}>
                                                                            {line.replace("- ", "").trim()}
                                                                        </li>
                                                                    </ul>
                                                                );
                                                            }
                                                            return (
                                                                line.trim() && (
                                                                    <p key={i} style={{ marginBottom: "20px" }}>
                                                                        {line}
                                                                    </p>
                                                                )
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {item.type === "image" && (
                                                    <img
                                                        src={item.value}
                                                        alt={item.caption || "Post content"}

                                                    />
                                                )}
                                                {item.type === "image" &&
                                                    index < post.contents.length - 1 &&
                                                    post.contents[index + 1].type === "text" && (
                                                        <div style={{ flex: 1, minWidth: "200px" }}>
                                                            {post.contents[index + 1].value.split("\n").map((line, i) => {
                                                                if (line.startsWith("Tiêu đề:")) {
                                                                    return (
                                                                        <h3
                                                                            key={i}
                                                                            style={{
                                                                                fontSize: "22px",
                                                                                fontWeight: 600,
                                                                                margin: "20px 0",
                                                                                color: "#222",
                                                                            }}
                                                                        >
                                                                            {line.replace("Tiêu đề:", "").trim()}
                                                                        </h3>
                                                                    );
                                                                }
                                                                if (line.startsWith("Mô tả:")) {
                                                                    return (
                                                                        <p key={i} style={{ marginBottom: "20px" }}>
                                                                            {line.replace("Mô tả:", "").trim()}
                                                                        </p>
                                                                    );
                                                                }
                                                                if (line.startsWith("- ")) {
                                                                    return (
                                                                        <ul
                                                                            key={i}
                                                                            style={{
                                                                                listStyle: "disc",
                                                                                paddingLeft: "40px",
                                                                                margin: "20px 0",
                                                                            }}
                                                                        >
                                                                            <li style={{ marginBottom: "10px" }}>
                                                                                {line.replace("- ", "").trim()}
                                                                            </li>
                                                                        </ul>
                                                                    );
                                                                }
                                                                return (
                                                                    line.trim() && (
                                                                        <p key={i} style={{ marginBottom: "20px" }}>
                                                                            {line}
                                                                        </p>
                                                                    )
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>

                                    <div
                                        className="entry-footer row no-gutters flex-column flex-md-row"
                                        style={{ marginTop: "30px", fontSize: "14px" }}
                                    >
                                        <div className="col-md">
                                            <div className="entry-tags">
                                                <span style={{ fontWeight: 600, color: "#333" }}>Tags:</span>{" "}
                                                {post.tags.map((tag, index) => (
                                                    <a key={index} href="#">
                                                        {tag}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-md-auto mt-2 mt-md-0">
                                            <div className="social-icons social-icons-color">
                                                <span className="social-label">Chia sẻ bài đăng này:</span>
                                                <a
                                                    href="#"
                                                    className="social-icon social-facebook"
                                                    title="Facebook"
                                                    target="_blank"
                                                >
                                                    <i className="icon-facebook-f"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    className="social-icon social-twitter"
                                                    title="Twitter"
                                                    target="_blank"
                                                >
                                                    <i className="icon-twitter"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    className="social-icon social-pinterest"
                                                    title="Pinterest"
                                                    target="_blank"
                                                >
                                                    <i className="icon-pinterest"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    className="social-icon social-linkedin"
                                                    title="Linkedin"
                                                    target="_blank"
                                                >
                                                    <i className="icon-linkedin"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="entry-author-details">
                                    <figure className="author-media">
                                        <Link key={post.user.id} to={`/profile/${post.user.id}`}>
                                            <img
                                                src={post.user.imageAvatar}
                                                alt={post.user.name}
                                            />
                                        </Link>
                                    </figure>

                                    <div className="author-body">
                                        <div className="author-header row no-gutters flex-column flex-md-row">
                                            <div className="col">
                                                <h4>
                                                    <a href="#">{post.user.name}</a>
                                                </h4>
                                            </div>
                                            <div className="col-auto mt-1 mt-md-0">
                                                <a href="#" className="author-link">
                                                    Xem tất cả bài viết của {post.user.name}{" "}
                                                    <i className="icon-long-arrow-right"></i>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="author-content">
                                            <p>
                                                Khám phá những trải nghiệm du lịch độc đáo và hấp dẫn qua các bài
                                                viết.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <div className="comments">
                                <h3 className="title">{countComments(comments)} Bình luận</h3>
                                <ul>
                                    {comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} level={0} />
                                    ))}
                                </ul>
                            </div>
                            <div className="reply">
                                <div className="heading">
                                    <h3 className="title">Viết bình luận công khai</h3>
                                </div>
                                <textarea
                                    name="reply-message"
                                    id="content"
                                    cols="30"
                                    rows="4"
                                    className="form-control"
                                    value={formData.content || ""}
                                    onChange={handleChange}
                                    required
                                    placeholder="Bình luận *"
                                />
                                <button
                                    onClick={handleCommentSubmit}
                                    className="btn btn-outline-primary-2"
                                >
                                    <span>Gửi bình luận</span>
                                    <i className="icon-long-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>

            <Modal show={showReplyModal} onHide={handleCloseReplyModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Trả lời bình luận của: {nameComment}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="form-group">
                            <label htmlFor="content">Bình luận</label>
                            <textarea
                                className="form-control"
                                id="content"
                                value={formData.content || ""}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                    <Button variant="secondary" onClick={handleCloseReplyModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleCommentSubmit}>
                        Gửi trả lời
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showEditCommentModal} onHide={handleCloseUpdateModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Sửa bình luận</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="form-group">
                            <label htmlFor="content">Bình luận</label>
                            <textarea
                                className="form-control"
                                id="content"
                                value={formData.content || ""}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                    <Button variant="secondary" onClick={handleCloseUpdateModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdateCommentSubmit}>
                        Sửa
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal
                show={showActionModal}
                onHide={() => setShowActionModal(false)}
                size="sm"
                centered
            >
                <Modal.Header closeButton style={{ padding: "10px" }}></Modal.Header>
                <Modal.Body
                    style={{
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <Button
                        // variant="danger"
                        size="sm"
                        onClick={handleDeleteComment}
                        style={{ fontSize: "14px", padding: "8px" }}
                    >
                        Xóa
                    </Button>


                    <Button
                        variant="warning"
                        size="sm"
                        // onClick={handleReportComment}
                        style={{ fontSize: "14px", padding: "8px" }}
                    >
                        Báo cáo
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PostsDetail;