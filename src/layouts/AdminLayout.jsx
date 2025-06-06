
import Sidebar from '../components/Admin/Sidebar.jsx';
import Footer from '../components/Admin/Footer.jsx';
import Topbar from '../components/Admin/Topbar.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';


const AdminLayout = ({ children }) => {

    return (
        <div id="page-top">
            {/* Page Wrapper */}
            <div id="wrapper">

                <Sidebar />
                {/* Content Wrapper */}
                <div id="content-wrapper" className="d-flex flex-column">
                    {/* Main Content */}
                    <div id="content">

                        <Topbar />

                        {children}
                    </div>
                    {/* End of Main Content */}

                    <Footer />
                </div>
            </div>

            <a className="scroll-to-top rounded" href="#page-top">
                <i className="fas fa-angle-up"></i>
            </a>

            <div className="modal fade" id="logoutModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                            <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                            <a className="btn btn-primary" href="/login">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;