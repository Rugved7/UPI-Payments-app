# UPI Payment System

A comprehensive Spring Boot-based digital payment system inspired by India's UPI (Unified Payments Interface). Features include wallet management, virtual payment addresses (VPAs), secure P2P transactions, and transaction limits.

## Features

### Core Functionality
- **User Authentication** - JWT-based secure authentication with role-based access control
- **Digital Wallet** - Auto-created wallet with ₹10,000 initial balance for each user
- **Virtual Payment Addresses (VPA)** - Create and manage UPI IDs (like username@bank)
- **P2P Transactions** - Secure peer-to-peer money transfers with UPI PIN verification
- **Transaction Limits** - Daily limits (₹1,00,000) and per-transaction limits (₹50,000)
- **Transaction History** - Complete audit trail of all transactions

### Security Features
- JWT token authentication (24-hour expiration)
- BCrypt password hashing
- Separate UPI PIN storage
- Pessimistic locking for concurrent transactions
- Transaction authorization checks
- Rate limiting on daily spending

### Technical Highlights
- Async transaction processing with thread pools
- Optimistic locking with versioning
- Scheduled jobs for daily limit resets
- Comprehensive exception handling
- Swagger/OpenAPI documentation
- PostgreSQL database with JPA/Hibernate

## Tech Stack

- **Framework**: Spring Boot 3.5.5
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **Documentation**: Springdoc OpenAPI (Swagger)
- **Build Tool**: Maven
- **ORM**: Hibernate/JPA

## Getting Started

### Prerequisites
- Java 21 or higher
- Maven 3.6+
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd payments
```

2. Update database configuration in `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/upi_payment
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build the project
```bash
./mvnw clean install
```

4. Run the application
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

Once the application is running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/check-email` - Check email availability
- `GET /api/v1/auth/check-phone` - Check phone availability

### Wallet Management
- `GET /api/v1/wallet` - Get wallet details
- `GET /api/v1/wallet/balance` - Get current balance

### VPA Management
- `POST /api/v1/vpa` - Create new VPA
- `GET /api/v1/vpa` - List all user VPAs
- `PATCH /api/v1/vpa/{vpa}/primary` - Set primary VPA
- `GET /api/v1/vpa/check-availability` - Check VPA availability
- `DELETE /api/v1/vpa/{vpa}` - Delete VPA

### UPI PIN
- `POST /api/v1/upi-pin/set` - Set UPI PIN
- `POST /api/v1/upi-pin/validate` - Validate UPI PIN
- `POST /api/v1/upi-pin/change` - Change UPI PIN

### Transactions
- `POST /api/v1/transaction/transfer` - Initiate money transfer
- `GET /api/v1/transaction/{transactionId}` - Get transaction details
- `GET /api/v1/transaction/history` - Get transaction history
- `GET /api/v1/transaction/status/{transactionId}` - Check transaction status

### Notifications
- `GET /api/v1/notifications` - Get all notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `GET /api/v1/notifications/unread/count` - Get unread count
- `PATCH /api/v1/notifications/{id}/read` - Mark notification as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

## Usage Example

### 1. Register a User
```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create VPA
```bash
curl -X POST http://localhost:8080/api/v1/vpa \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "Vpa": "john@paytm",
    "isPrimary": true
  }'
```

### 4. Set UPI PIN
```bash
curl -X POST "http://localhost:8080/api/v1/upi-pin/set?upiPin=1234" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 5. Send Money
```bash
curl -X POST http://localhost:8080/api/v1/transaction/transfer \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recieverVpa": "friend@paytm",
    "amount": 500,
    "description": "Lunch money",
    "upiPin": "1234"
  }'
```

## Database Schema

### Key Tables
- **users** - User accounts with authentication details
- **wallets** - Digital wallets with balance and limits
- **virtual_payment_address** - UPI IDs linked to wallets
- **transactions** - Transaction records with full audit trail
- **roles** - User roles (USER, ADMIN, BANK_ADMIN)

## Configuration

### Transaction Limits
Default limits (configurable per wallet):
- Daily Limit: ₹1,00,000
- Per Transaction Limit: ₹50,000
- Initial Wallet Balance: ₹10,000

### JWT Configuration
- Token Expiration: 24 hours
- Secret Key: Configured in application.properties

### Async Processing
- Core Pool Size: 10 threads
- Max Pool Size: 25 threads
- Queue Capacity: 100 tasks

## Testing

Run tests with:
```bash
./mvnw test
```

## Project Structure
```
src/main/java/com/rugved/paymentProject/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── exception/       # Exception handling
├── model/           # JPA entities
├── repository/      # Data access layer
├── security/        # Security configuration
├── service/         # Business logic
└── scheduler/       # Scheduled jobs
```

## Future Enhancements
- QR code generation for payments
- Payment request system
- Email/SMS notifications
- Transaction receipts (PDF)
- Refund/reversal functionality
- Spending analytics dashboard
- Biometric authentication
- Multi-currency support

## License
This project is licensed under the Apache License 2.0

## Contact
For questions or support, please contact: support@upipayment.com
