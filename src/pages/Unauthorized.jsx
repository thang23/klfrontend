import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

function Unauthorized() {
    return (
        <Container className="mt-5 text-center">
            <h1>Không có quyền truy cập</h1>
            <p>Bạn cần quyền ADMIN để truy cập trang này.</p>
            <Button as={Link} to="/" variant="primary">
                Quay lại trang chủ
            </Button>
        </Container>
    );
}

export default Unauthorized;