# UPI Payment System

A full-stack UPI (Unified Payments Interface) payment application built with Spring Boot backend and React Native (Expo) mobile frontend. This system enables secure peer-to-peer money transfers with features similar to popular UPI apps like Google Pay, PhonePe, and Paytm.

##  Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with BCrypt password hashing
- **Virtual Payment Addresses (VPA)**: Create and manage multiple UPI IDs (e.g., user@bank)
- **Wallet System**: Digital wallet with automatic balance management
- **P2P Transactions**: Send and receive money using VPA
- **UPI PIN**: Secure 4-digit PIN for transaction authorization
- **Transaction History**: Complete transaction logs with status tracking
- **Real-time Notifications**: Get notified about all transaction activities

### Security Features
- JWT token-based authentication
- Separate UPI PIN (not the login password)
- Transaction limits (₹50,000 per transaction, ₹1,00,000 daily)
- Encrypted password storage with BCrypt
- CORS configuration for secure API access

### Technical Features
- Async transaction processing with thread pools
- Optimistic locking for concurrent transaction handling
- RESTful API with OpenAPI/Swagger documentation
- DTO pattern to prevent circular reference issues
- Comprehensive error handling and validation

## Architecture

### Backend (Spring Boot)
```
payments/
├── src/main/java/com/rugved/paymentProject/
│   ├── config/          # Security, CORS, Async, OpenAPI configs
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Data Transfer Objects
│   ├── exception/       # Global exception handling
│   ├── model/           # JPA entities
│   ├── repository/      # Database repositories
│   ├── security/        # JWT, UserDetails implementation
│   └── service/         # Business logic
└── src/main/resources/
    └── application.properties
```

### Frontend (React Native + Expo)
```
mobile-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # API configuration
│   ├── context/         # Auth context for state management
│   ├── navigation/      # Navigation setup
│   ├── screens/         # App screens
│   ├── services/        # API service layer
│   └── utils/           # Utility functions
└── App.js
```

##  Prerequisites

### Backend
- Java 21 or higher
- Maven 3.6+
- PostgreSQL 12+

### Frontend
- Node.js 16+
- npm or yarn
- Expo CLI

##  Installation & Setup

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE upi_payment;
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd payments
```

Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/upi_payment
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Secret (change this in production)
app.jwt.secret=your-secret-key-here
app.jwt.expiration=86400000
```

Run the backend:
```bash
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### 3. Frontend Setup

Navigate to the mobile app directory:
```bash
cd mobile-app
```

Install dependencies:
```bash
npm install
```

Update API base URL in `src/config/config.js` if needed:
```javascript
export const API_BASE_URL = 'http://localhost:8080/api/v1';
```

Start the app:
```bash
npm start
```

Then press:
- `w` for web browser
- `a` for Android emulator
- `i` for iOS simulator

## 📱 Application Flow

### 1. User Registration
```
Signup Screen → Enter Details → Create Account → Auto-create Wallet (₹10,000 initial balance)
```

### 2. Login
```
Login Screen → Enter Credentials → JWT Token Generated → Navigate to Home
```

### 3. Create VPA
```
Home → My VPAs → Create VPA → Enter VPA (e.g., user@paytm) → VPA Created
```

### 4. Set UPI PIN
```
Home → UPI PIN → Enter 4-digit PIN → Confirm PIN → PIN Set
```

### 5. Send Money
```
Home → Send Money → Enter Receiver VPA → Enter Amount → Add Description (optional) 
→ Continue → Enter UPI PIN → Transaction Processed → Success/Failure Notification
```

### 6. View Transaction History
```
Home → History → View All Transactions (with status, amount, timestamp)
```

### 7. Notifications
```
Home → Notifications → View All Notifications → Mark as Read/Delete
```

##  API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/check-email` - Check email availability
- `GET /api/v1/auth/check-phone` - Check phone availability

### Wallet
- `GET /api/v1/wallet` - Get wallet details
- `GET /api/v1/wallet/balance` - Get current balance

### VPA Management
- `POST /api/v1/vpa` - Create new VPA
- `GET /api/v1/vpa` - Get all user VPAs
- `PATCH /api/v1/vpa/{vpa}/primary` - Set primary VPA
- `DELETE /api/v1/vpa/{vpa}` - Delete VPA
- `GET /api/v1/vpa/check-availability` - Check VPA availability

### UPI PIN
- `POST /api/v1/upi-pin/set` - Set UPI PIN
- `POST /api/v1/upi-pin/validate` - Validate UPI PIN
- `POST /api/v1/upi-pin/change` - Change UPI PIN

### Transactions
- `POST /api/v1/transaction/transfer` - Initiate money transfer
- `GET /api/v1/transaction/history` - Get transaction history
- `GET /api/v1/transaction/{transactionId}` - Get transaction details
- `GET /api/v1/transaction/status/{transactionId}` - Get transaction status

### Notifications
- `GET /api/v1/notifications` - Get all notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `GET /api/v1/notifications/unread/count` - Get unread count
- `PATCH /api/v1/notifications/{id}/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

##  Database Schema

### Users
- id, firstName, lastName, email, phone, password, upiPinHash, isVerified, isLocked, createdAt, updatedAt

### Wallets
- id, userId, balance, isActive, dailyLimit, perTransactionLimit, dailySpent, lastResetDate, version, createdAt, updatedAt

### Virtual Payment Addresses
- id, vpa, isPrimary, isVerified, userId, walletId, createdAt

### Transactions
- id, transactionId, senderVpa, receiverVpa, amount, description, status, senderId, receiverId, createdAt, updatedAt

### Notifications
- id, userId, title, message, type, referenceId, isRead, createdAt

### Roles
- id, name (ROLE_USER, ROLE_ADMIN)

##  UI/UX Features

- **Modern Gradient Design**: Beautiful purple gradient theme
- **Responsive Layout**: Works on web, iOS, and Android
- **Real-time Updates**: Pull-to-refresh on all screens
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Snackbar Notifications**: Toast messages for actions
- **Material Design**: Using React Native Paper components
- **Linear Gradients**: Expo Linear Gradient for modern look

##  Security Considerations

### Implemented
- JWT authentication with expiration
- Password hashing with BCrypt
- Separate UPI PIN storage
- Transaction limits
- CORS configuration
- Input validation
- SQL injection prevention (JPA)

### Production Recommendations
- Use HTTPS/SSL certificates
- Implement rate limiting
- Add 2FA for sensitive operations
- Use environment variables for secrets
- Implement proper logging and monitoring
- Add fraud detection mechanisms
- Implement session management
- Add biometric authentication for mobile

##  Testing

### Backend Testing
```bash
cd payments
./mvnw test
```

### API Testing
- Import `UPI_Payment_System.postman_collection.json` into Postman
- Swagger UI available at: `http://localhost:8080/swagger-ui.html`

##  Deployment

### Backend Deployment
1. Build the JAR:
```bash
./mvnw clean package
```

2. Run the JAR:
```bash
java -jar target/payments-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment

#### Web
```bash
npm run build
```

#### Android APK
```bash
eas build --platform android
```

#### iOS
```bash
eas build --platform ios
```

##  Known Issues & Limitations

- Daily limit reset is manual (needs scheduled job)
- No transaction reversal mechanism
- No dispute resolution system
- Limited to P2P transfers (no merchant payments)
- No QR code scanning
- No bank account linking

##  Future Enhancements

- [ ] QR code generation and scanning
- [ ] Bank account integration
- [ ] Merchant payment support
- [ ] Bill payments and recharges
- [ ] Transaction analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Biometric authentication
- [ ] Transaction scheduling
- [ ] Split payments
- [ ] Request money feature
- [ ] Transaction disputes
- [ ] Admin dashboard

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

##  Author

Rugved

##  Acknowledgments

- Spring Boot for the robust backend framework
- React Native & Expo for cross-platform mobile development
- React Native Paper for Material Design components
- PostgreSQL for reliable data storage

##  Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: This is a demonstration project for educational purposes. For production use, implement additional security measures, compliance checks, and proper testing.
