# Hestia IAM System - API Reference Guide

## 📋 Document Information

| **Document Type**  | IAM System API Reference                                     |
| ------------------ | ------------------------------------------------------------ |
| **Version**        | 1.0.0                                                        |
| **Last Updated**   | December 28, 2024                                            |
| **Next Review**    | February 28, 2025                                            |
| **Document Owner** | API Development Team                                         |
| **Stakeholders**   | Frontend Developers, Mobile Developers, Integration Partners |
| **Classification** | Technical API Documentation                                  |
| **Status**         | Active - Implementation Ready                                |

---

## 🎯 Overview

This document provides a comprehensive API reference for the Hestia IAM system, including authentication, authorization, profile management, and security endpoints. All endpoints follow RESTful principles and return consistent JSON responses.

---

## 🔐 Authentication Endpoints

### **POST /api/v1/auth/login**

Authenticate a user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "mfaCode": "123456",
  "rememberMe": false,
  "deviceInfo": {
    "deviceId": "device-123",
    "deviceName": "Chrome on Windows",
    "deviceType": "desktop",
    "browser": "Chrome",
    "os": "Windows",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "mfaEnabled": true,
      "preferences": {
        "theme": "light",
        "language": "en",
        "timezone": "UTC"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    },
    "session": {
      "id": "session-123",
      "deviceName": "Chrome on Windows",
      "isActive": true,
      "expiresAt": "2024-12-28T18:30:00Z"
    },
    "mfaRequired": false
  },
  "message": "Login successful"
}
```

**Response (MFA Required - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "mfaRequired": true,
    "mfaMethods": ["totp", "sms", "email"]
  },
  "message": "MFA required"
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "remainingAttempts": 3,
      "lockoutTime": "2024-12-28T18:15:00Z"
    }
  },
  "timestamp": "2024-12-28T18:00:00Z",
  "requestId": "req-123456"
}
```

### **POST /api/v1/auth/register**

Register a new user account.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "acceptTerms": true,
  "marketingConsent": false
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-456",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "status": "PENDING",
      "emailVerified": false
    },
    "verificationRequired": true
  },
  "message": "Registration successful. Please check your email for verification."
}
```

### **POST /api/v1/auth/refresh**

Refresh an access token using a refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### **POST /api/v1/auth/logout**

Logout the current user and invalidate the session.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 204):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### **POST /api/v1/auth/mfa/setup**

Setup multi-factor authentication for the current user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "backupCodes": ["12345678", "87654321", "11223344"]
  },
  "message": "MFA setup successful"
}
```

### **POST /api/v1/auth/mfa/verify**

Verify MFA code for authentication.

**Request Body:**

```json
{
  "userId": "user-123",
  "token": "123456",
  "method": "totp"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "verified": true
  },
  "message": "MFA verification successful"
}
```

---

## 👤 Profile Management Endpoints

### **GET /api/v1/profile**

Get the current user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "avatar": "https://cdn.hestia.com/avatars/user-123.jpg",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "timezone": "America/New_York",
    "locale": "en-US",
    "status": "ACTIVE",
    "role": "USER",
    "emailVerified": true,
    "phoneVerified": false,
    "mfaEnabled": true,
    "mfaMethods": ["totp"],
    "preferences": {
      "theme": "dark",
      "language": "en",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "notifications": {
        "email": {
          "enabled": true,
          "types": ["security", "updates"]
        },
        "push": {
          "enabled": true,
          "types": ["security"]
        }
      }
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-12-28T18:00:00Z",
    "lastLoginAt": "2024-12-28T18:00:00Z"
  }
}
```

### **PUT /api/v1/profile**

Update the current user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "timezone": "America/New_York",
  "locale": "en-US"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "updatedAt": "2024-12-28T18:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

### **PUT /api/v1/profile/preferences**

Update user preferences.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "theme": "dark",
  "language": "en",
  "currency": "USD",
  "notifications": {
    "email": {
      "enabled": true,
      "types": ["security", "updates", "marketing"]
    },
    "push": {
      "enabled": false
    }
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "en",
    "currency": "USD",
    "notifications": {
      "email": {
        "enabled": true,
        "types": ["security", "updates", "marketing"]
      },
      "push": {
        "enabled": false
      }
    }
  },
  "message": "Preferences updated successfully"
}
```

### **POST /api/v1/profile/avatar**

Upload a new avatar image.

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
Form data with file field 'avatar'
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.hestia.com/avatars/user-123.jpg",
    "thumbnailUrl": "https://cdn.hestia.com/avatars/user-123-thumb.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

### **GET /api/v1/profile/sessions**

Get all active sessions for the current user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "session-123",
      "deviceId": "device-123",
      "deviceName": "Chrome on Windows",
      "deviceType": "desktop",
      "browser": "Chrome",
      "os": "Windows",
      "ipAddress": "192.168.1.1",
      "location": "New York, US",
      "isActive": true,
      "lastActivity": "2024-12-28T18:00:00Z",
      "expiresAt": "2024-12-28T18:30:00Z",
      "createdAt": "2024-12-28T17:30:00Z"
    },
    {
      "id": "session-456",
      "deviceId": "device-456",
      "deviceName": "Safari on iPhone",
      "deviceType": "mobile",
      "browser": "Safari",
      "os": "iOS",
      "ipAddress": "192.168.1.2",
      "location": "New York, US",
      "isActive": true,
      "lastActivity": "2024-12-28T17:45:00Z",
      "expiresAt": "2024-12-28T18:15:00Z",
      "createdAt": "2024-12-28T17:00:00Z"
    }
  ]
}
```

### **DELETE /api/v1/profile/sessions/{sessionId}**

Revoke a specific session.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 204):**

```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

## 🔐 OAuth 2.0 Endpoints

### **GET /api/v1/auth/oauth/{provider}/authorize**

Initiate OAuth 2.0 authorization flow.

**Query Parameters:**

```
provider: google|microsoft|github
redirect_uri: https://app.hestia.com/callback
state: random-state-string
scope: openid profile email
```

**Response (Redirect - 302):**

```
Redirects to OAuth provider's authorization page
```

### **GET /api/v1/auth/oauth/{provider}/callback**

Handle OAuth 2.0 callback.

**Query Parameters:**

```
code: authorization_code
state: state_string
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    },
    "isNewUser": false
  }
}
```

---

## 🛡️ SAML Endpoints

### **GET /api/v1/auth/saml/metadata**

Get SAML metadata for the service provider.

**Response (Success - 200):**

```xml
<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://hestia.com/saml">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="https://hestia.com/api/v1/auth/saml/callback"
                                 index="0"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

### **POST /api/v1/auth/saml/callback**

Handle SAML response from identity provider.

**Request Body:**

```
SAML Response (base64 encoded)
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "groups": ["users", "editors"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

## 🔍 Audit & Security Endpoints

### **GET /api/v1/security/audit-logs**

Get audit logs for the current user or tenant.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

```
page: 1
limit: 20
action: LOGIN|LOGOUT|PROFILE_UPDATE
startDate: 2024-12-01
endDate: 2024-12-28
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-123",
        "userId": "user-123",
        "action": "LOGIN",
        "resource": "auth",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-12-28T18:00:00Z",
        "details": {
          "method": "password",
          "success": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### **GET /api/v1/security/permissions**

Get available permissions for the current user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "perm-1",
      "name": "user:read",
      "description": "Can read user information",
      "resource": "user",
      "action": "read",
      "category": "user_management"
    },
    {
      "id": "perm-2",
      "name": "recipe:create",
      "description": "Can create recipes",
      "resource": "recipe",
      "action": "create",
      "category": "recipe_management"
    }
  ]
}
```

### **POST /api/v1/security/check-permission**

Check if the current user has a specific permission.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "resource": "recipe",
  "action": "create",
  "resourceId": "recipe-123"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "hasPermission": true,
    "reason": "User has recipe:create permission"
  }
}
```

---

## 📊 Data Types

### **User Object**

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  timezone: string;
  locale: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'EDITOR' | 'VIEWER';
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  mfaMethods: string[];
  preferences: UserPreferences;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

### **UserPreferences Object**

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: NotificationSettings;
    push: NotificationSettings;
    sms: NotificationSettings;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analyticsOptIn: boolean;
  };
}
```

### **Session Object**

```typescript
interface Session {
  id: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isActive: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}
```

### **TokenPair Object**

```typescript
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
```

### **AuditLog Object**

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  timestamp: string;
}
```

---

## 🚨 Error Responses

### **Standard Error Format**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "timestamp": "2024-12-28T18:00:00Z",
  "requestId": "req-123456"
}
```

### **Common Error Codes**

| Code                       | HTTP Status | Description                          |
| -------------------------- | ----------- | ------------------------------------ |
| `INVALID_CREDENTIALS`      | 401         | Invalid email or password            |
| `ACCOUNT_LOCKED`           | 423         | Account temporarily locked           |
| `MFA_REQUIRED`             | 403         | Multi-factor authentication required |
| `INVALID_MFA_CODE`         | 401         | Invalid MFA code                     |
| `TOKEN_EXPIRED`            | 401         | Access token has expired             |
| `INVALID_TOKEN`            | 401         | Invalid or malformed token           |
| `INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions      |
| `RESOURCE_NOT_FOUND`       | 404         | Requested resource not found         |
| `VALIDATION_ERROR`         | 400         | Request validation failed            |
| `RATE_LIMIT_EXCEEDED`      | 429         | Rate limit exceeded                  |
| `INTERNAL_SERVER_ERROR`    | 500         | Internal server error                |

---

## 📋 Rate Limiting

### **Rate Limit Headers**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### **Rate Limits by Endpoint**

| Endpoint           | Limit | Window     |
| ------------------ | ----- | ---------- |
| `/auth/login`      | 5     | 15 minutes |
| `/auth/register`   | 3     | 1 hour     |
| `/auth/mfa/verify` | 3     | 5 minutes  |
| `/profile/*`       | 100   | 1 hour     |
| `/security/*`      | 50    | 1 hour     |

---

## 🔧 SDK Examples

### **JavaScript/TypeScript SDK**

```typescript
import { HestiaIAM } from '@hestia/iam-sdk';

const iam = new HestiaIAM({
  baseUrl: 'https://api.hestia.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Login
const auth = await iam.auth.login({
  email: 'user@example.com',
  password: 'password123',
});

// Get profile
const profile = await iam.profile.get();

// Update preferences
await iam.profile.updatePreferences({
  theme: 'dark',
  language: 'en',
});
```

### **Python SDK**

```python
from hestia_iam import HestiaIAM

iam = HestiaIAM(
    base_url="https://api.hestia.com",
    client_id="your-client-id",
    client_secret="your-client-secret"
)

# Login
auth = iam.auth.login(
    email="user@example.com",
    password="password123"
)

# Get profile
profile = iam.profile.get()

# Update preferences
iam.profile.update_preferences({
    "theme": "dark",
    "language": "en"
})
```

---

## 📚 Additional Resources

### **Documentation**

- [IAM System Overview](docs/14_IAM_SYSTEM_AND_PROFILE_MANAGEMENT.md)
- [Implementation Guide](docs/15_IAM_IMPLEMENTATION_GUIDE.md)
- [Security Best Practices](docs/16_IAM_SECURITY_BEST_PRACTICES.md)

### **SDK Downloads**

- [JavaScript/TypeScript SDK](https://npmjs.com/package/@hestia/iam-sdk)
- [Python SDK](https://pypi.org/project/hestia-iam/)
- [Java SDK](https://maven.org/artifact/com.hestia/iam-sdk)

### **Support**

- [API Status Page](https://status.hestia.com)
- [Developer Forum](https://community.hestia.com)
- [Support Email](support@hestia.com)

---

_This API reference is part of the Hestia Enterprise SaaS Platform documentation suite. For questions or support, please refer to the resources above or create an issue in the GitHub repository._
