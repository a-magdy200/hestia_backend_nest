# IAM API Reference

## 📋 Document Information

| **Document Type** | IAM API Reference |
| ----------------- | ----------------- |
| **Version**       | 1.1.0             |
| **Last Updated**  | December 28, 2024 |
| **Owner**         | Backend Development Team |
| **Status**        | Phase 1 - 90% Complete |

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Management Endpoints](#user-management-endpoints)
4. [User Profile Endpoints](#user-profile-endpoints)
5. [Role Management Endpoints](#role-management-endpoints)
6. [Permission Management Endpoints](#permission-management-endpoints)
7. [Session Management Endpoints](#session-management-endpoints)
8. [Data Models](#data-models)
9. [Error Codes](#error-codes)
10. [Rate Limiting](#rate-limiting)

## Overview

The IAM (Identity and Access Management) API provides comprehensive user authentication, authorization, and profile management capabilities for the Hestia Platform.

### Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.hestia.com/api/v1`
- **Production**: `https://api.hestia.com/api/v1`

### Authentication
All endpoints require JWT Bearer token authentication except for login and register endpoints.

```http
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register User

**Status**: ✅ **Implemented**

```http
POST /auth/register
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    },
    "message": "User registered successfully. Please check your email for verification."
  }
}
```

### Login User

**Status**: ✅ **Implemented**

```http
POST /auth/login
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
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
      "role": "user",
      "isEmailVerified": true,
      "isActive": true
    }
  }
}
```

### Verify Email

**Status**: ✅ **Implemented**

```http
POST /auth/verify-email
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "verification-token-here"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

### Resend Verification Email

**Status**: ✅ **Implemented**

```http
POST /auth/resend-verification
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent successfully"
  }
}
```

### Forgot Password

**Status**: ✅ **Implemented**

```http
POST /auth/forgot-password
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent successfully"
  }
}
```

### Reset Password

**Status**: ✅ **Implemented**

```http
POST /auth/reset-password
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

### Change Password

**Status**: ✅ **Implemented**

```http
POST /auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

### Refresh Token

**Status**: ✅ **Implemented**

```http
POST /auth/refresh
Authorization: Bearer <refresh-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

**Status**: ✅ **Implemented**

```http
POST /auth/logout
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Revoke All Tokens

**Status**: ✅ **Implemented**

```http
POST /auth/revoke-all-tokens
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "All tokens revoked successfully"
  }
}
```

### Get Current User

**Status**: ✅ **Implemented**

```http
GET /auth/me
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

## User Management Endpoints

### Get All Users (Admin)

**Status**: ✅ **Implemented**

```http
GET /users?page=1&limit=10&search=john&role=user&isActive=true
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isEmailVerified": true,
        "isActive": true,
        "createdAt": "2024-12-28T10:30:00Z",
        "updatedAt": "2024-12-28T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Get User by ID (Admin)

**Status**: ✅ **Implemented**

```http
GET /users/{userId}
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

### Create User (Admin)

**Status**: ✅ **Implemented**

```http
POST /users
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "user",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

## User Profile Endpoints

### Create User Profile

**Status**: ✅ **Implemented**

```http
POST /user-profile
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
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

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
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
      },
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

### Get Current Profile

**Status**: ✅ **Implemented**

```http
GET /user-profile/current
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
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
      },
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

### Update Current Profile

**Status**: ✅ **Implemented**

```http
PUT /user-profile/current
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "preferences": {
    "dietaryRestrictions": ["vegetarian", "vegan"],
    "allergies": ["nuts"],
    "cookingSkillLevel": "advanced"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "preferences": {
        "dietaryRestrictions": ["vegetarian", "vegan"],
        "allergies": ["nuts"],
        "cookingSkillLevel": "advanced"
      },
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

### Get Profile by ID

**Status**: ✅ **Implemented**

```http
GET /user-profile/{profileId}
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
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
      },
      "createdAt": "2024-12-28T10:30:00Z",
      "updatedAt": "2024-12-28T10:30:00Z"
    }
  }
}
```

### Get All Profiles (Admin)

**Status**: ✅ **Implemented**

```http
GET /user-profile?page=1&limit=10&search=john
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890",
        "createdAt": "2024-12-28T10:30:00Z",
        "updatedAt": "2024-12-28T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Search Profiles

**Status**: ✅ **Implemented**

```http
GET /user-profile/search?query=john&page=1&limit=10
Authorization: Bearer <access-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890",
        "createdAt": "2024-12-28T10:30:00Z",
        "updatedAt": "2024-12-28T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## Role Management Endpoints

**Status**: 🔄 **Planned for Phase 2**

### Get All Roles

```http
GET /roles
Authorization: Bearer <access-token>
```

### Create Role

```http
POST /roles
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Update Role

```http
PUT /roles/{roleId}
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Delete Role

```http
DELETE /roles/{roleId}
Authorization: Bearer <access-token>
```

## Permission Management Endpoints

**Status**: 🔄 **Planned for Phase 2**

### Get All Permissions

```http
GET /permissions
Authorization: Bearer <access-token>
```

### Assign Permission to Role

```http
POST /roles/{roleId}/permissions
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Remove Permission from Role

```http
DELETE /roles/{roleId}/permissions/{permissionId}
Authorization: Bearer <access-token>
```

## Session Management Endpoints

**Status**: 🔄 **Planned for Phase 2**

### Get User Sessions

```http
GET /sessions
Authorization: Bearer <access-token>
```

### Revoke Session

```http
DELETE /sessions/{sessionId}
Authorization: Bearer <access-token>
```

## Data Models

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

### User Role Enum

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}
```

### Gender Enum

```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}
```

### Cooking Skill Level Enum

```typescript
enum CookingSkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}
```

### Spice Tolerance Enum

```typescript
enum SpiceTolerance {
  MILD = 'mild',
  MEDIUM = 'medium',
  HOT = 'hot',
  EXTREME = 'extreme'
}
```

## Error Codes

### Authentication Errors

- `AUTH_INVALID_CREDENTIALS` - Invalid email or password
- `AUTH_EMAIL_NOT_VERIFIED` - Email not verified
- `AUTH_ACCOUNT_DISABLED` - Account is disabled
- `AUTH_TOKEN_EXPIRED` - Access token expired
- `AUTH_TOKEN_INVALID` - Invalid access token
- `AUTH_REFRESH_TOKEN_EXPIRED` - Refresh token expired
- `AUTH_REFRESH_TOKEN_INVALID` - Invalid refresh token

### Validation Errors

- `VALIDATION_EMAIL_REQUIRED` - Email is required
- `VALIDATION_EMAIL_INVALID` - Invalid email format
- `VALIDATION_PASSWORD_REQUIRED` - Password is required
- `VALIDATION_PASSWORD_WEAK` - Password is too weak
- `VALIDATION_FIRST_NAME_REQUIRED` - First name is required
- `VALIDATION_LAST_NAME_REQUIRED` - Last name is required

### Authorization Errors

- `AUTHZ_INSUFFICIENT_PERMISSIONS` - Insufficient permissions
- `AUTHZ_ROLE_REQUIRED` - Role is required
- `AUTHZ_ADMIN_REQUIRED` - Admin role required

### Resource Errors

- `RESOURCE_NOT_FOUND` - Resource not found
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `RESOURCE_CONFLICT` - Resource conflict

### System Errors

- `INTERNAL_SERVER_ERROR` - Internal server error
- `SERVICE_UNAVAILABLE` - Service unavailable
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

## Rate Limiting

### Rate Limits

- **Authentication Endpoints**: 10 requests per minute
- **User Management Endpoints**: 100 requests per hour
- **Profile Management Endpoints**: 100 requests per hour
- **Admin Endpoints**: 1000 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640689200
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 28, 2024 | Updated implementation status, added completed endpoints |
| 1.0.0 | Dec 20, 2024 | Initial IAM API documentation |

## Support & Contact

For IAM API support and questions:
- **Email**: iam-support@hestia.com
- **Documentation**: https://docs.hestia.com/iam
- **Status Page**: https://status.hestia.com
