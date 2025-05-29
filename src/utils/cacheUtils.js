const CACHE_DURATION = 30 * 60 * 1000; // 30 phút = 30 * 60 * 1000 ms

/**
 * Lấy dữ liệu từ cache
 * @param {string} key - Key của cache
 * @returns {any|null} - Dữ liệu cache hoặc null nếu không hợp lệ
 */
const getCachedData = (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, expirationTime } = JSON.parse(cached);
    if (Date.now() > expirationTime) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
};

/**
 * Lưu dữ liệu vào cache
 * @param {string} key - Key của cache
 * @param {any} data - Dữ liệu cần lưu
 */
const setCachedData = (key, data) => {
    const expirationTime = Date.now() + CACHE_DURATION;
    localStorage.setItem(key, JSON.stringify({ data, expirationTime }));
};

/**
 * Xóa cache
 * @param {string} key - Key của cache
 */
const clearCache = (key) => {
    localStorage.removeItem(key);
};

/**
 * Xóa nhiều cache theo prefix
 * @param {string} prefix - Tiền tố của các key (ví dụ: "accommodation_cache")
 */
const clearCacheByPrefix = (prefix) => {
    Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key));
};

export { getCachedData, setCachedData, clearCache, clearCacheByPrefix };