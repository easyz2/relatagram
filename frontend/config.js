// frontend/config.js
const LOCAL_IP = '192.168.1.104'; // or your LAN IP
const PORT = 3000;

export const API_CONFIG = {
  BASE_URL: `http://${LOCAL_IP}:${PORT}/api/videos`,
  TIMEOUT: 10000,
};

export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
});
