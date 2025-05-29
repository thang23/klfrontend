const GEOCODIO_API_KEY = 'a7f3bfd6a7b73f6caa6df736ffcdc76cba67baa';

export const getCoordinatesFromAddress = async (address) => {
    if (!address) {
        throw new Error('Địa chỉ không được để trống');
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=vn`,
            {
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your-email@example.com)', // Thay bằng email của bạn
                },
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            // Trả về danh sách các kết quả để admin chọn
            return data.map((item) => ({
                display_name: item.display_name,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
            }));
        } else {
            throw new Error('Không tìm thấy tọa độ cho địa chỉ này');
        }
    } catch (error) {
        console.error('Lỗi khi gọi Nominatim API:', error);
        throw error;
    }
};