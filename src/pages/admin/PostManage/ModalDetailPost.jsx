import { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { deleteComment } from "../../../services/Admin/postService";
import { getPostByIdAll } from "../../../services/publicPost";

const ModalDetailPost = ({ show, handleClose, id }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userId] = useState(localStorage.getItem("userId") || null); // Lấy userId từ localStorage

    const fetchPostDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await getPostByIdAll(id);
            if (response.code === 200 && response.res) {
                setPost(response.res);
            } else {
                throw new Error("Không thể tải chi tiết bài viết!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết bài viết:", error);
            toast.error(error.response?.data?.message || "Không thể tải chi tiết bài viết!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchPostDetails();
        }
    }, [show, id]);

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            const response = await deleteComment(commentId);
            if (response.code === 200) {
                // Cập nhật state sau khi xóa bình luận
                setPost((prevPost) => ({
                    ...prevPost,
                    comments: prevPost.comments.filter((comment) => comment.id !== commentId),
                }));
                toast.success("Xóa bình luận thành công!");
            } else {
                throw new Error(response.data?.message || "Xóa bình luận thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa bình luận:", error);
            toast.error(error.message || "Không thể xóa bình luận!");
        }
    };

    const renderComments = (comments, level = 0) => {
        return comments.map((comment) => (
            <div key={comment.id} style={{ marginLeft: `${level * 20}px` }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>{comment.user.username}</strong> ({new Date(comment.createdDate).toLocaleString()}):
                        <p>{comment.content}</p>
                    </div>
                    {(userId === comment.user.id.toString() || localStorage.getItem("role") === "ROLE_ADMIN") && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                        >
                            Xóa
                        </Button>
                    )}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div>{renderComments(comment.replies, level + 1)}</div>
                )}
            </div>
        ));
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết bài viết</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <p>Đang tải...</p>
                ) : post ? (
                    <>
                        <h4>{post.title}</h4>
                        <p><strong>Mô tả:</strong> {post.description}</p>
                        {post.thumbnail && (
                            <img
                                src={post.thumbnail}
                                alt="Thumbnail"
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        )}
                        <h5>Nội dung:</h5>
                        {post.contents && post.contents.length > 0 ? (
                            <div>
                                {post.contents.map((content, index) => (
                                    <div key={index}>
                                        <p>
                                            <strong>{content.type === "image" ? "Hình ảnh" : "Nội dung"}:</strong>{" "}
                                            {content.type === "image" ? (
                                                <img
                                                    src={content.value}
                                                    alt={content.caption || "Content image"}
                                                    style={{ maxWidth: "100%", height: "auto" }}
                                                />
                                            ) : (
                                                content.value
                                            )}
                                        </p>
                                        {content.caption && <p><em>Chú thích:</em> {content.caption}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Không có nội dung.</p>
                        )}
                        <h5>Bình luận:</h5>
                        {post.comments && post.comments.length > 0 ? (
                            <div>{renderComments([...post.comments])}</div>
                        ) : (
                            <p>Không có bình luận nào.</p>
                        )}
                    </>
                ) : (
                    <p>Không tìm thấy bài viết.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalDetailPost;