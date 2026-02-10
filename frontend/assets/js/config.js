const CONFIG = {
    API_BASE: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api'
};

console.log('API Base URL:', CONFIG.API_BASE);
const API_BASE = CONFIG.API_BASE;