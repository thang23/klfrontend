import { toast } from 'react-toastify';


export const getCoordinates = async (address, setFormData, setAddressSuggestions, setGeocodingLoading) => {
    if (!address) {
        toast.error('Vui lòng nhập địa chỉ trước khi tìm kiếm!');
        return;
    }
    setGeocodingLoading(true);
    try {
        const response = await fetch(
            `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=64H0qxHOBkPdRJ1xUqOqNlaBJZ9DX0E8oXQXPHCq`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const suggestions = data.results.map((item) => ({
                display_name: item.formatted_address,
                latitude: parseFloat(item.geometry.location.lat),
                longitude: parseFloat(item.geometry.location.lng),
            }));
            setAddressSuggestions(suggestions);
            if (suggestions.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    address: suggestions[0].display_name,
                    latitude: suggestions[0].latitude.toString(),
                    longitude: suggestions[0].longitude.toString(),
                }));
                toast.success('Tìm thấy địa chỉ! Vui lòng chọn hoặc kéo thả marker để tinh chỉnh.');
            }
        } else {
            throw new Error('Không tìm thấy địa chỉ');
        }
    } catch (error) {
        toast.error('Không thể tìm địa chỉ! Vui lòng thử lại hoặc kéo thả marker trên bản đồ.');
        console.error('Geocoding error:', error);
        setAddressSuggestions([]);
    } finally {
        setGeocodingLoading(false);
    }
};

// Reverse Geocoding với Goong
export const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=64H0qxHOBkPdRJ1xUqOqNlaBJZ9DX0E8oXQXPHCq`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        } else {
            throw new Error('Không tìm thấy địa chỉ cho tọa độ này');
        }
    } catch (error) {
        console.error('Lỗi khi gọi Goong Reverse Geocoding API:', error);
        throw error;
    }
};