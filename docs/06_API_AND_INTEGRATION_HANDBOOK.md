# API and Integration Handbook

## 📋 Document Information

| **Document Type** | API and Integration Handbook |
| ----------------- | ---------------------------- |
| **Version**       | 1.1.0                        |
| **Last Updated**  | December 28, 2024            |
| **Owner**         | Backend Development Team      |
| **Status**        | Phase 1 - 90% Complete       |

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Core API Endpoints](#core-api-endpoints)
4. [Data Models & Schemas](#data-models--schemas)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks & Integrations](#webhooks--integrations)
8. [SDKs & Client Libraries](#sdks--client-libraries)
9. [Testing & Validation](#testing--validation)
10. [Deployment & Environment](#deployment--environment)

## Overview

The Hestia Platform API provides comprehensive access to all platform functionality through RESTful endpoints. This handbook serves as the definitive reference for integrating with the Hestia Platform.

### Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.hestia.com/api/v1`
- **Production**: `https://api.hestia.com/api/v1`

### API Versioning
- Current version: `v1`
- Version specified in URL path
- Backward compatibility maintained for 12 months

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

## Authentication & Authorization

### JWT Token Authentication

**Status**: ✅ **Implemented**

The API uses JWT tokens for authentication with the following flow:

#### 1. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

#### 2. Token Refresh
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

#### 3. Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### Role-Based Access Control (RBAC)

**Status**: ✅ **Implemented**

Available roles:
- `user`: Basic user permissions
- `admin`: Administrative permissions
- `moderator`: Content moderation permissions

### API Key Authentication

**Status**: ✅ **Implemented**

For service-to-service communication:

```http
X-API-Key: your-api-key-here
```

## Core API Endpoints

### User Management

**Status**: ✅ **Implemented**

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /user-profile/current
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

#### Get All Users (Admin)
```http
GET /users?page=1&limit=10&search=john
Authorization: Bearer <access_token>
```

### User Profile Management

**Status**: ✅ **Implemented**

#### Create User Profile
```http
POST /user-profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "allergies": ["nuts", "shellfish"],
    "cookingSkillLevel": "intermediate"
  }
}
```

#### Get Current Profile
```http
GET /user-profile/current
Authorization: Bearer <access_token>
```

#### Search Profiles
```http
GET /user-profile/search?query=john&page=1&limit=10
Authorization: Bearer <access_token>
```

### Authentication Endpoints

**Status**: ✅ **Implemented**

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-here"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123!"
}
```

#### Change Password
```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

## Data Models & Schemas

### User Entity
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Profile Entity
```typescript
interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: Address;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address Schema
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

### User Preferences Schema
```typescript
interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  cookingSkillLevel: CookingSkillLevel;
  preferredCuisines: string[];
  spiceTolerance: SpiceTolerance;
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2024-12-28T10:30:00Z",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `CONFLICT_ERROR` - Resource conflict
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `INTERNAL_ERROR` - Internal server error

## Rate Limiting

**Status**: ✅ **Implemented**

### Rate Limits

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **API Keys**: 10000 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640689200
```

## Webhooks & Integrations

**Status**: 🔄 **Planned for Phase 2**

### Webhook Events

- `user.created` - New user registration
- `user.updated` - User profile update
- `user.deleted` - User account deletion
- `profile.created` - New profile creation
- `profile.updated` - Profile update

### Webhook Configuration

```json
{
  "url": "https://your-app.com/webhooks/hestia",
  "events": ["user.created", "user.updated"],
  "secret": "webhook-secret-key"
}
```

## SDKs & Client Libraries

**Status**: 🔄 **Planned for Phase 2**

### Planned SDKs

- JavaScript/TypeScript SDK
- Python SDK
- Java SDK
- .NET SDK
- Mobile SDKs (iOS/Android)

### Example Usage (Planned)

```javascript
import { HestiaClient } from '@hestia/sdk';

const client = new HestiaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.hestia.com/api/v1'
});

// Get current user
const user = await client.auth.getCurrentUser();

// Create profile
const profile = await client.profiles.create({
  firstName: 'John',
  lastName: 'Doe'
});
```

## Testing & Validation

### API Testing

**Status**: ✅ **Implemented**

#### Test Endpoints

- **Health Check**: `GET /health`
- **API Status**: `GET /api/status`

#### Test Data

Use the provided test data endpoints for development:

```http
GET /test/users
GET /test/profiles
```

### Validation

**Status**: ✅ **Implemented**

All endpoints include comprehensive input validation:

- Email format validation
- Password strength requirements
- Required field validation
- Data type validation
- Business rule validation

## Deployment & Environment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hestia

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=hestia-uploads

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=3000
NODE_ENV=development
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Health Checks

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-12-28T10:30:00Z",
  "version": "1.1.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy"
  }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 28, 2024 | Updated implementation status, added completed endpoints |
| 1.0.0 | Dec 20, 2024 | Initial API documentation |

## Support & Contact

For API support and questions:
- **Email**: api-support@hestia.com
- **Documentation**: https://docs.hestia.com/api
- **Status Page**: https://status.hestia.com
