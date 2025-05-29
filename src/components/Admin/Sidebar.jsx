import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-laugh-wink"></i>
                </div>
                <div className="sidebar-brand-text mx-3">Quản trị viên</div>
            </Link>

            <hr className="sidebar-divider my-0" />

            <hr className="sidebar-divider" />

            <div className="sidebar-heading">
                Giao diện
            </div>



            <hr className="sidebar-divider" />

            <div className="sidebar-heading">
                Tiện ích bổ sung
            </div>

            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages"
                    aria-expanded="true" aria-controls="collapsePages">
                    <i className="fas fa-fw fa-folder"></i>
                    <span>Trang</span>
                </a>
                <div id="collapsePages" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <h6 className="collapse-header">Màn hình đăng nhập:</h6>
                        <Link className="collapse-item" to="#">Đăng nhập</Link>
                        <Link className="collapse-item" to="#">Đăng ký</Link>
                        <Link className="collapse-item" to="#">Quên mật khẩu</Link>
                        <div className="collapse-divider"></div>
                        <h6 className="collapse-header">Trang khác:</h6>
                        <Link className="collapse-item" to="#">Trang 404</Link>
                        <Link className="collapse-item" to="#">Trang trống</Link>
                    </div>
                </div>
            </li>

            <hr className="sidebar-divider" />

            <div className="sidebar-heading">
                Quản lý
            </div>

            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseManagement"
                    aria-expanded="true" aria-controls="collapseManagement">
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Quản lý</span>
                </a>
                <div id="collapseManagement" className="collapse" aria-labelledby="headingManagement"
                    data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <h6 className="collapse-header">Công cụ quản trị:</h6>
                        <Link className="collapse-item" to="/admin/user">Quản lý người dùng</Link>
                        <Link className="collapse-item" to="/admin">Quản lý danh mục</Link>
                        <Link className="collapse-item" to="/admin/posts">Quản lý bài viết</Link>
                        <Link className="collapse-item" to="/admin/activity">Quản lý hoạt động</Link>

                        <Link className="collapse-item" to="/admin/location">Quản lý địa điểm</Link>
                        <Link className="collapse-item" to="/admin/location-type">Quản lý loại địa điểm</Link>
                    </div>
                </div>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            <div className="text-center d-none d-md-inline">
                <button className="rounded-circle border-0" id="sidebarToggle"></button>
            </div>
        </ul>
    );
}

export default Sidebar;