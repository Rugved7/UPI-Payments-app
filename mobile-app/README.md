# UPI Payment Mobile App

React Native mobile application for the UPI Payment System.

## Setup Instructions

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Configure Backend URL

Edit `src/services/api.js` and update the `API_BASE_URL`:

**For Android Emulator:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';
```

**For iOS Simulator:**
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

**For Physical Device:**
```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8080/api/v1';
// Example: 'http://192.168.1.100:8080/api/v1'
```

### 3. Start Backend Server

Make sure your Spring Boot backend is running:
```bash
cd ../payments
./mvnw spring-boot:run
```

### 4. Run the App

```bash
# Start Expo
npm start

# Then press:
# 'a' for Android
# 'i' for iOS
# 'w' for Web
```

## Features

- ✅ User Authentication (Login/Signup)
- ✅ Wallet Balance Display
- ✅ Send Money (P2P Transfers)
- ✅ Transaction History
- ✅ VPA Management
- ✅ UPI PIN Management
- ✅ Notifications
- ✅ Real-time Balance Updates

## App Structure

```
mobile-app/
├── src/
│   ├── screens/          # All app screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   └── SendMoneyScreen.js
│   ├── context/          # React Context (Auth)
│   │   └── AuthContext.js
│   ├── services/         # API calls
│   │   └── api.js
│   └── config/           # Configuration
│       └── config.js
├── App.js               # Main app component
└── package.json
```

## Testing

### Test User Flow:
1. Sign up with email and password
2. Login with credentials
3. View wallet balance (₹10,000 initial)
4. Create a VPA
5. Set UPI PIN
6. Send money to another VPA
7. View transaction history

## Troubleshooting

### Cannot connect to backend:
- Make sure backend is running on port 8080
- Check if you're using correct IP address
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Disable firewall if testing on physical device

### Dependencies issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Expo issues:
```bash
npm install -g expo-cli
expo start --clear
```

## API Endpoints Used

- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- GET /api/v1/wallet/balance
- GET /api/v1/wallet
- POST /api/v1/transaction/transfer
- GET /api/v1/transaction/history
- GET /api/v1/notifications/unread/count

## Technologies

- React Native (Expo)
- React Navigation
- React Native Paper (UI Components)
- Axios (HTTP Client)
- AsyncStorage (Local Storage)
