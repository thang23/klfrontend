const Subscribe = () => {
    return (<section className="subscribe">
        <div className="container">
            <div className="heading">
                <p className="heading-cat">Khám Phá Những Điểm Đến Mới</p>
                <h3 className="heading-title">Giữ Vững Những Cập Nhật Mới Nhất</h3>
            </div>
            <div className="col-lg-6 subscribe-form">
                <form action="#">
                    <div className="input-group">
                        <input type="email" placeholder="Nhập Địa Chỉ Email Của Bạn" aria-label="Email Address" required />
                        <div className="input-group-append">
                            <button className="btn btn-subscribe" type="submit"><span>Gửi</span></button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>);
}
export default Subscribe;