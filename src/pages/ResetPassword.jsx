import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import apiClient from '../services/apiClient';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const token = searchParams.get('token');
        if (!token) {
            setError('Token không hợp lệ');
            return;
        }

        try {
            const response = await apiClient.post('/api/auth/reset-password', {
                token,
                newPassword,
            });
            setMessage(response.data.message);
            setNewPassword('');
        } catch (error) {
            setError(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: '500px' }}>
            <h2 className="text-center">Đặt lại mật khẩu</h2>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                    Đặt lại mật khẩu
                </Button>
            </Form>
            <div className="text-center mt-3">
                <Button variant="link" onClick={() => navigate('/login')}>
                    Quay lại đăng nhập
                </Button>
            </div>
        </Container>
    );
}

export default ResetPassword;