import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Tabs, Tab, Card, Alert } from 'react-bootstrap';
import apiClient from '../services/apiClient';

function Login() {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', name: '' });
    const [forgotPasswordData, setForgotPasswordData] = useState({ email: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData({ ...registerData, [name]: value });
    };

    const handleForgotPasswordChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordData({ ...forgotPasswordData, [name]: value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const success = await login(loginData.username, loginData.password);
        if (success) {
            navigate('/home');
        } else {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await apiClient.post('/api/auth/register', {
                username: registerData.username,
                email: registerData.email,
                password: registerData.password,
                name: registerData.name
            });
            setSuccess(response.data.message);
            setRegisterData({ username: '', email: '', password: '', name: '' });
            // Chuyển hướng đến trang verify sau 2 giây để người dùng thấy thông báo
            setTimeout(() => {
                navigate('/verify');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Đăng ký thất bại: Lỗi không xác định');
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await apiClient.post('/api/auth/forgot-password', {
                email: forgotPasswordData.email,
            });
            setSuccess(response.data.message);
            setForgotPasswordData({ email: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Gửi yêu cầu thất bại: Lỗi không xác định');
        }
    };

    return (
        <div
            className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
            style={{
                backgroundImage: "url('https://media2.gody.vn/public/mytravelmap/images/2018/8/27/mailinh76206787/bbd81f966ced611cac950f7f0e821805.jpg')",
                backgroundSize: 'cover',
                minHeight: '80vh',
            }}
        >
            <Container>
                <Card className="mx-auto" style={{ maxWidth: '500px' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Đăng nhập</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Tabs defaultActiveKey="signin" id="auth-tabs" className="mb-3">
                            <Tab eventKey="signin" title="Đăng nhập" tabAttrs={{ id: 'signin-tab' }}>
                                <Form onSubmit={handleLoginSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fs-5">Tên đăng nhập</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={loginData.username}
                                            onChange={handleLoginChange}
                                            placeholder="Nhập tên đăng nhập"
                                            className="form-control-lg"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fs-5">Mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={loginData.password}
                                            onChange={handleLoginChange}
                                            placeholder="Nhập mật khẩu"
                                            className="form-control-lg"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100 py-2 fs-5">
                                        Đăng nhập
                                    </Button>
                                </Form>
                            </Tab>
                            <Tab eventKey="register" title="Đăng ký">
                                <Form onSubmit={handleRegisterSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên đăng nhập</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={registerData.username}
                                            onChange={handleRegisterChange}
                                            placeholder="Nhập tên đăng nhập"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên của bạn</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={registerData.name}
                                            onChange={handleRegisterChange}
                                            placeholder="Nhập tên của bạn"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            placeholder="Nhập email"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            placeholder="Nhập mật khẩu"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100">
                                        Đăng ký
                                    </Button>
                                </Form>
                            </Tab>
                            <Tab eventKey="forgot-password" title="Quên mật khẩu">
                                <Form onSubmit={handleForgotPasswordSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={forgotPasswordData.email}
                                            onChange={handleForgotPasswordChange}
                                            placeholder="Nhập email"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100">
                                        Gửi liên kết đặt lại
                                    </Button>
                                </Form>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Login;