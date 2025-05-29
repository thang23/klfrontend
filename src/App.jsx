import './App.css'; // Đảm bảo đường dẫn đúng với vị trí file App.css

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Category from './pages/admin/Category';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Activity from './pages/admin/activiti';
// import 'leaflet/dist/leaflet.css';
import Location from './pages/admin/location/location';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized.jsx'; // Cập nhật phần mở rộng
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LocationType from './pages/admin/locationType/locationType.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import Home from './pages/home.jsx';
import CategoryUser from './pages/user/category.jsx';
import Slider from './components/User/slider.jsx';
import PostsDetail from './pages/postsDetail.jsx';
import PostsList from './pages/postsList.jsx';
import CreatePost from './pages/user/createPost.jsx';
import LocationList from './pages/user/locationUser/locationList.jsx';
// import 'bootstrap/dist/css/bootstrap.min.css';
import '@goongmaps/goong-js/dist/goong-js.css';
import LocationDetailUser from './pages/user/locationUser/locationDetailUser.jsx';
import Error from './pages/404.jsx';
import WebSocketTest from './WebSocketTest.jsx';
import Navigation from './pages/user/navigation/Navigation.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import UserProfile from './pages/UserProfile.jsx';
import OtherUserProfile from './pages/OtherUserProfile.jsx';
import JourneyHistory from './pages/JourneyHistory.jsx';
import JourneyDetail from './pages/JourneyDetail.jsx';
import PostManagement from './pages/admin/PostManage/Post Management.jsx';
import UserManagement from './pages/admin/User/UserManagement.jsx';
import Contact from './pages/contac.jsx';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route công khai */}
          <Route path="/home" element={<PublicLayout slider={<Slider />} ><Home /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout ><Contact /></PublicLayout>} />
          <Route path="/bai-viet/:id" element={<PublicLayout ><PostsDetail /></PublicLayout>} />
          <Route path="/bai-viet" element={<PublicLayout ><PostsList /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout ><Login /></PublicLayout>} />
          <Route path="/verify" element={<PublicLayout ><VerifyEmail /></PublicLayout>} />
          <Route path="reset-password" element={<PublicLayout ><ResetPassword /></PublicLayout>} />
          <Route path="/profile/:id" element={<PublicLayout ><OtherUserProfile /></PublicLayout>} />
          <Route path="/khampha" element={<PublicLayout ><LocationList /></PublicLayout>} />
          <Route path="/khampha/:id" element={<PublicLayout ><LocationDetailUser /></PublicLayout>} />
          <Route path="/category/:categoryId" element={<PublicLayout><LocationList /></PublicLayout>} />
          <Route path="/404" element={<PublicLayout ><Error /></PublicLayout>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/test" element={<WebSocketTest />} />
          {/* Route cho giao diện User (nếu có) */}
          <Route element={<ProtectedRoute requiredRoles={['ROLE_USER', 'ROLE_ADMIN']} />}>
            <Route
              path="/create-posts"
              element={
                <PublicLayout>
                  <CreatePost />
                </PublicLayout>
              }
            />
            <Route
              path="/dieuhuong"
              element={
                <PublicLayout>
                  <Navigation />
                </PublicLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <PublicLayout>
                  <UserProfile />
                </PublicLayout>
              }
            />

            <Route
              path="/journey-history"
              element={
                <PublicLayout>
                  <JourneyHistory />
                </PublicLayout>
              }
            />

            <Route
              path="/journey/:journeyId"
              element={
                <PublicLayout>
                  <JourneyDetail />
                </PublicLayout>
              }
            />

          </Route>

          {/* Route bảo vệ cho Admin */}
          <Route element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']} />}>
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <Category />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <AdminLayout>
                  <PostManagement />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/user"
              element={
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <AdminLayout>
                  <Activity />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/location-type"
              element={
                <AdminLayout>
                  <LocationType />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/location"
              element={
                <AdminLayout>
                  <Location />
                </AdminLayout>
              }
            />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </AuthProvider>
  );
}

export default App;