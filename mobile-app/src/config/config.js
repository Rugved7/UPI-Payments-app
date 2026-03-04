// API Configuration
export const API_CONFIG = {
  // Change this to your computer's IP address when testing on physical device
  // For Android Emulator: use 10.0.2.2
  // For iOS Simulator: use localhost
  // For Physical Device: use your computer's IP (e.g., 192.168.1.100)
  BASE_URL: 'http://localhost:8080/api/v1',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'UPI Payment',
  VERSION: '1.0.0',
  INITIAL_WALLET_BALANCE: 10000,
};

export default { API_CONFIG, APP_CONFIG };
