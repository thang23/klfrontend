const Banners = () => {
    return (
        <section className="banners center">
            <div className="container">
                <div className="row">
                    <div className="banner col-lg-4 col-md-6 col-sm-6">
                        <img src="images/demos/demo-24/banners/banner-1.jpg" alt="" />
                        <div className="intro">
                            <div className="title">
                                <h3>Khám phá trải nghiệm</h3>
                            </div>
                            <div className="content">
                                <h4>Văn hóa bản địa<br />Ẩm thực & Hành trình độc đáo</h4>
                            </div>
                            <div className="action">
                                <a href="category.html">Khám phá ngay</a>
                            </div>
                        </div>
                    </div>

                    <div className="banner percent col-lg-4 col-md-6 col-sm-6">
                        <img src="images/demos/demo-24/banners/banner-2.jpg" alt="" />
                        <div className="intro">
                            <div className="title">
                                <h3>Phụ kiện du lịch</h3>
                            </div>
                            <div className="img-percent">
                                <img src="images/demos/demo-24/banners/percent.png" width="190" height="75" alt="" />
                            </div>
                            <div className="content">
                                <h4>Balo, nón, vali, đồ dùng<br />Du lịch tiện lợi</h4>
                            </div>
                            <div className="action">
                                <a href="">Mua ngay</a>
                            </div>
                        </div>
                    </div>

                    <div className="banner col-lg-4 col-md-6 col-sm-6">
                        <img src="images/demos/demo-24/banners/banner-3.jpg" alt="" />
                        <div className="intro">
                            <div className="title">
                                <h3>Kỳ nghỉ hè</h3>
                            </div>
                            <div className="content">
                                <h4>Resort biển<br /> & Điểm đến lý tưởng</h4>
                            </div>
                            <div className="action">
                                <a href="category.html">Khám phá ngay</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Banners;