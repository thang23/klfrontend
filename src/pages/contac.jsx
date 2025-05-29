import React from 'react';

const Contact = () => {
    return (
        <ul className="menu sf-arrows">
            <li className="megamenu-container active">
                <a href="index.html" className="sf-with-ul">Home</a>
                <div className="megamenu demo">
                    <div className="menu-col">
                        <div className="menu-title">Choose your demo</div>
                        <div className="demo-list">
                            <div className="demo-item">
                                <a href="index-1.html">
                                    <span
                                        className="demo-bg"
                                        style={{
                                            backgroundImage:
                                                'url(/assets/images/menu/demos/3.jpg) || url(/default-image.jpg)',
                                        }}
                                    ></span>
                                    <span className="demo-title">01 - furniture store</span>
                                </a>
                            </div>
                            <div className="demo-item">
                                <a href="index-2.html">
                                    <span
                                        className="demo-bg"
                                        style={{
                                            backgroundImage:
                                                'url(/assets/images/menu/demos/3.jpg) || url(/default-image.jpg)',
                                        }}
                                    ></span>
                                    <span className="demo-title">02 - furniture store</span>
                                </a>
                            </div>
                            <div className="demo-item">
                                <a href="index-3.html">
                                    <span
                                        className="demo-bg"
                                        style={{
                                            backgroundImage:
                                                'url(/assets/images/menu/demos/3.jpg) || url(/default-image.jpg)',
                                        }}
                                    ></span>
                                    <span className="demo-title">03 - electronic store</span>
                                </a>
                            </div>
                            <div className="demo-item">
                                <a href="index-4.html">
                                    <span
                                        className="demo-bg"
                                        style={{
                                            backgroundImage:
                                                'url(/assets/images/menu/demos/3.jpg) || url(/default-image.jpg)',
                                        }}
                                    ></span>
                                    <span className="demo-title">04 - electronic store</span>
                                </a>
                            </div>
                            <div className="demo-item">
                                <a href="index-5.html">
                                    <span
                                        className="demo-bg"
                                        style={{
                                            backgroundImage:
                                                'url(/assets/images/menu/demos/3.jpg) || url(/default-image.jpg)',
                                        }}
                                    ></span>
                                    <span className="demo-title">05 - fashion store</span>
                                </a>
                            </div>
                        </div>
                        <div className="megamenu-action text-center">
                            <a href="#" className="btn btn-outline-primary-2 view-all-demos">
                                <span>View All Demos</span>
                                <i className="icon-long-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </li>
            {/* Các phần còn lại giữ nguyên để đơn giản, bạn có thể thêm lại nếu cần */}
            <li>
                <a href="category.html" className="sf-with-ul">Shop</a>
                <div className="megamenu megamenu-md">
                    {/* Nội dung Shop */}
                </div>
            </li>
            {/* Các li khác giữ nguyên */}
        </ul>
    );
};

export default Contact;