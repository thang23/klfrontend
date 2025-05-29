import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';
import apiClient from '../services/apiClient';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            apiClient.get(`/api/auth/verify?token=${token}`)
                .then(response => {
                    setMessage(response.data.message);
                    setError('');
                })
                .catch(error => {
                    setError(error.response?.data?.message || 'Xác nhận email thất bại');
                    setMessage('');
                });
        } else {
            setError('Token không hợp lệ');
        }
    }, [searchParams]);

    return (
        <Container className="mt-5">
            <h2 className="text-center">Xác nhận Email</h2>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="text-center">
                <Button variant="primary" onClick={() => navigate('/login')}>
                    Quay lại đăng nhập
                </Button>
            </div>
        </Container>
    );
}

export default VerifyEmail;