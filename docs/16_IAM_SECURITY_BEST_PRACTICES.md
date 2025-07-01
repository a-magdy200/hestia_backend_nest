# Hestia IAM System - Security Best Practices

## 📋 Document Information

| **Document Type**  | IAM Security Best Practices Guide                                  |
| ------------------ | ------------------------------------------------------------------ |
| **Version**        | 1.1.0                                                              |
| **Last Updated**   | December 28, 2024                                                  |
| **Next Review**    | February 28, 2025                                                  |
| **Document Owner** | Security Team                                                      |
| **Stakeholders**   | Development Team, DevOps Team, Security Team, Enterprise Customers |
| **Classification** | Security Guidelines Document                                       |
| **Status**         | Phase 1 - 90% Complete                                             |

---

## 🎯 Overview

This document outlines comprehensive security best practices for implementing and maintaining the Hestia IAM system. It covers authentication, authorization, data protection, and compliance requirements to ensure enterprise-grade security.

---

## 🔐 Authentication Security

### Password Security

#### **Password Policy Requirements**

```typescript
// Password validation service
@Injectable()
export class PasswordValidationService {
  private readonly PASSWORD_POLICY = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfo: true,
    maxAge: 90, // days
    historyCount: 5,
  };

  async validatePassword(password: string, user?: User): Promise<ValidationResult> {
    const errors: string[] = [];

    // Length check
    if (password.length < this.PASSWORD_POLICY.minLength) {
      errors.push(`Password must be at least ${this.PASSWORD_POLICY.minLength} characters long`);
    }

    // Character requirements
    if (this.PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password check
    if (this.PASSWORD_POLICY.preventCommonPasswords && (await this.isCommonPassword(password))) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    // User information check
    if (user && this.PASSWORD_POLICY.preventUserInfo && this.containsUserInfo(password, user)) {
      errors.push('Password cannot contain your personal information');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password),
    };
  }

  private async isCommonPassword(password: string): Promise<boolean> {
    const commonPasswords = await this.loadCommonPasswordsList();
    return commonPasswords.includes(password.toLowerCase());
  }

  private containsUserInfo(password: string, user: User): boolean {
    const userInfo = [user.email, user.firstName, user.lastName, user.displayName].filter(Boolean);

    return userInfo.some(info => password.toLowerCase().includes(info.toLowerCase()));
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 4, 20);

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

    // Deduct for patterns
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123|abc|qwe/i.test(password)) score -= 15;

    if (score >= 60) return 'strong';
    if (score >= 40) return 'medium';
    return 'weak';
  }
}
```

#### **Password Hashing**

```typescript
// Secure password hashing service
@Injectable()
export class PasswordHashingService {
  private readonly SALT_ROUNDS = 12;
  private readonly PEPPER = process.env.PASSWORD_PEPPER;

  async hashPassword(password: string): Promise<string> {
    // Add pepper before hashing
    const pepperedPassword = this.addPepper(password);

    // Hash with bcrypt
    return bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const pepperedPassword = this.addPepper(password);
    return bcrypt.compare(pepperedPassword, hash);
  }

  private addPepper(password: string): string {
    return crypto.createHmac('sha256', this.PEPPER).update(password).digest('hex');
  }
}
```

### JWT Token Security

#### **Secure Token Configuration**

```typescript
// JWT security configuration
export const JWT_SECURITY_CONFIG = {
  // Access token settings
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'hestia-platform',
    audience: 'hestia-users',
  },

  // Refresh token settings
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'hestia-platform',
    audience: 'hestia-refresh',
  },

  // Security settings
  security: {
    rotateRefreshTokens: true,
    maxRefreshTokensPerUser: 5,
    blacklistExpiredTokens: true,
    requireSecureCookies: true,
  },
};

// JWT service with security features
@Injectable()
export class SecureJWTService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokenPair(user: User): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions?.map(p => p.name) || [],
        jti: this.generateJTI(),
        iat: Math.floor(Date.now() / 1000),
      },
      {
        secret: JWT_SECURITY_CONFIG.accessToken.secret,
        expiresIn: JWT_SECURITY_CONFIG.accessToken.expiresIn,
        issuer: JWT_SECURITY_CONFIG.accessToken.issuer,
        audience: JWT_SECURITY_CONFIG.accessToken.audience,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
        jti: this.generateJTI(),
        iat: Math.floor(Date.now() / 1000),
      },
      {
        secret: JWT_SECURITY_CONFIG.refreshToken.secret,
        expiresIn: JWT_SECURITY_CONFIG.refreshToken.expiresIn,
        issuer: JWT_SECURITY_CONFIG.refreshToken.issuer,
        audience: JWT_SECURITY_CONFIG.refreshToken.audience,
      },
    );

    // Store refresh token in Redis for revocation
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async validateToken(token: string, type: 'access' | 'refresh' = 'access'): Promise<any> {
    try {
      const config =
        type === 'access' ? JWT_SECURITY_CONFIG.accessToken : JWT_SECURITY_CONFIG.refreshToken;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.secret,
        issuer: config.issuer,
        audience: config.audience,
      });

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(payload.jti)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async revokeToken(jti: string): Promise<void> {
    await this.redisService.setex(`blacklist:${jti}`, 86400, 'revoked');
  }

  private generateJTI(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh_tokens:${userId}`;
    await this.redisService.lpush(key, token);
    await this.redisService.ltrim(key, 0, JWT_SECURITY_CONFIG.security.maxRefreshTokensPerUser - 1);
    await this.redisService.expire(key, 7 * 24 * 60 * 60); // 7 days
  }

  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    return (await this.redisService.exists(`blacklist:${jti}`)) === 1;
  }
}
```

### Multi-Factor Authentication Security

#### **MFA Implementation Security**

```typescript
// Secure MFA service
@Injectable()
export class SecureMFAService {
  private readonly TOTP_CONFIG = {
    algorithm: 'sha1',
    digits: 6,
    period: 30,
    window: 1,
    issuer: 'Hestia Platform',
  };

  async setupTOTP(userId: string): Promise<MFASetup> {
    // Generate cryptographically secure secret
    const secret = speakeasy.generateSecret({
      name: this.TOTP_CONFIG.issuer,
      issuer: 'Hestia',
      length: 32,
    });

    // Encrypt secret before storing
    const encryptedSecret = await this.encryptSecret(secret.base32);

    // Generate backup codes
    const backupCodes = await this.generateSecureBackupCodes();

    // Store encrypted secret and backup codes
    await this.userRepository.update(userId, {
      mfaSecret: encryptedSecret,
      mfaEnabled: true,
      mfaMethods: ['totp'],
      backupCodes: JSON.stringify(backupCodes),
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32, // Only for initial setup
      qrCode,
      backupCodes: backupCodes.map(bc => bc.code),
    };
  }

  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret) {
      return false;
    }

    // Decrypt secret
    const secret = await this.decryptSecret(user.mfaSecret);

    // Verify TOTP with strict window
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: this.TOTP_CONFIG.window,
      algorithm: this.TOTP_CONFIG.algorithm,
    });
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.backupCodes) {
      return false;
    }

    const backupCodes = JSON.parse(user.backupCodes);
    const codeIndex = backupCodes.findIndex(
      bc => bc.code === code && !bc.used && !this.isBackupCodeExpired(bc),
    );

    if (codeIndex === -1) {
      return false;
    }

    // Mark code as used
    backupCodes[codeIndex].used = true;
    backupCodes[codeIndex].usedAt = new Date().toISOString();

    await this.userRepository.update(userId, {
      backupCodes: JSON.stringify(backupCodes),
    });

    return true;
  }

  private async generateSecureBackupCodes(): Promise<BackupCode[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({
        code,
        used: false,
        createdAt: new Date().toISOString(),
      });
    }
    return codes;
  }

  private isBackupCodeExpired(backupCode: BackupCode): boolean {
    const createdAt = new Date(backupCode.createdAt);
    const expiryDate = new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    return new Date() > expiryDate;
  }

  private async encryptSecret(secret: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('hestia-mfa', 'utf8'));

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private async decryptSecret(encryptedSecret: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

    const parts = encryptedSecret.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('hestia-mfa', 'utf8'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

---

## 🛡️ Authorization Security

### Role-Based Access Control (RBAC)

#### **Secure Permission System**

```typescript
// Secure permission system
@Injectable()
export class SecurePermissionService {
  private readonly PERMISSION_CACHE_TTL = 300; // 5 minutes

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any,
  ): Promise<boolean> {
    // Get user with permissions
    const user = await this.getUserWithPermissions(userId);

    if (!user || user.status !== 'ACTIVE') {
      return false;
    }

    // Check explicit permissions
    const hasPermission = user.permissions?.some(
      p => p.resource === resource && p.action === action,
    );

    if (!hasPermission) {
      return false;
    }

    // Check resource-level security
    if (context?.resourceId) {
      return await this.checkResourceAccess(user, resource, context.resourceId, action);
    }

    return true;
  }

  async checkResourceAccess(
    user: User,
    resourceType: string,
    resourceId: string,
    action: string,
  ): Promise<boolean> {
    // Get resource
    const resource = await this.getResource(resourceType, resourceId);

    if (!resource) {
      return false;
    }

    // Check ownership
    if (resource.userId === user.id) {
      return true;
    }

    // Check tenant isolation
    if (resource.tenantId && resource.tenantId !== user.tenantId) {
      await this.logSecurityEvent('CROSS_TENANT_ACCESS_ATTEMPT', {
        userId: user.id,
        resourceType,
        resourceId,
        userTenantId: user.tenantId,
        resourceTenantId: resource.tenantId,
      });
      return false;
    }

    // Check resource-specific policies
    return await this.evaluateResourcePolicies(user, resource, action);
  }

  private async getUserWithPermissions(userId: string): Promise<User> {
    const cacheKey = `user_permissions:${userId}`;

    // Try cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions', 'roles'],
    });

    if (user) {
      // Cache for 5 minutes
      await this.redisService.setex(cacheKey, this.PERMISSION_CACHE_TTL, JSON.stringify(user));
    }

    return user;
  }

  private async logSecurityEvent(event: string, details: any): Promise<void> {
    await this.auditService.logAction({
      userId: details.userId,
      action: event,
      resource: details.resourceType,
      resourceId: details.resourceId,
      details,
      severity: 'HIGH',
    });
  }
}
```

### Session Security

#### **Secure Session Management**

```typescript
// Secure session service
@Injectable()
export class SecureSessionService {
  private readonly SESSION_CONFIG = {
    maxConcurrentSessions: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    rememberMeTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  };

  async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    rememberMe: boolean = false,
  ): Promise<Session> {
    // Check concurrent sessions limit
    await this.enforceConcurrentSessionLimit(userId);

    // Generate secure session ID
    const sessionId = this.generateSecureSessionId();

    // Create session
    const session: Session = {
      id: sessionId,
      userId,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: deviceInfo.ipAddress,
      location: await this.getLocation(deviceInfo.ipAddress),
      isActive: true,
      lastActivity: new Date(),
      expiresAt: new Date(
        Date.now() +
          (rememberMe ? this.SESSION_CONFIG.rememberMeTimeout : this.SESSION_CONFIG.sessionTimeout),
      ),
      createdAt: new Date(),
      fingerprint: await this.generateDeviceFingerprint(deviceInfo),
    };

    // Store session
    await this.sessionRepository.create(session);
    await this.redisService.setex(
      `session:${sessionId}`,
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      JSON.stringify(session),
    );

    return session;
  }

  async validateSession(sessionId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    const session = await this.getSession(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await this.deactivateSession(sessionId);
      return false;
    }

    // Check device fingerprint
    const currentFingerprint = await this.generateDeviceFingerprint(deviceInfo);
    if (session.fingerprint !== currentFingerprint) {
      await this.logSecurityEvent('DEVICE_FINGERPRINT_MISMATCH', {
        sessionId,
        expectedFingerprint: session.fingerprint,
        actualFingerprint: currentFingerprint,
      });
      await this.deactivateSession(sessionId);
      return false;
    }

    // Update last activity
    await this.updateLastActivity(sessionId);

    return true;
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
    await this.redisService.del(`session:${sessionId}`);
  }

  async deactivateAllUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    for (const session of sessions) {
      if (session.id !== exceptSessionId) {
        await this.deactivateSession(session.id);
      }
    }
  }

  private async enforceConcurrentSessionLimit(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.count({
      where: { userId, isActive: true },
    });

    if (activeSessions >= this.SESSION_CONFIG.maxConcurrentSessions) {
      // Deactivate oldest session
      const oldestSession = await this.sessionRepository.findOne({
        where: { userId, isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (oldestSession) {
        await this.deactivateSession(oldestSession.id);
      }
    }
  }

  private generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async generateDeviceFingerprint(deviceInfo: DeviceInfo): Promise<string> {
    const fingerprintData = [
      deviceInfo.userAgent,
      deviceInfo.screenResolution,
      deviceInfo.timezone,
      deviceInfo.language,
      deviceInfo.platform,
    ].join('|');

    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  private async updateLastActivity(sessionId: string): Promise<void> {
    const now = new Date();
    await this.sessionRepository.update(sessionId, { lastActivity: now });

    // Update Redis cache
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = now;
      await this.redisService.setex(
        `session:${sessionId}`,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
        JSON.stringify(session),
      );
    }
  }
}
```

---

## 🔒 Data Protection

### Encryption Standards

#### **Data Encryption Service**

```typescript
// Data encryption service
@Injectable()
export class DataEncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly TAG_LENGTH = 16;

  async encryptData(data: string, context: string): Promise<string> {
    const key = await this.getEncryptionKey(context);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipher(this.ALGORITHM, key);
    cipher.setAAD(Buffer.from(context, 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  async decryptData(encryptedData: string, context: string): Promise<string> {
    const key = await this.getEncryptionKey(context);

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(this.ALGORITHM, key);
    decipher.setAAD(Buffer.from(context, 'utf8'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private async getEncryptionKey(context: string): Promise<Buffer> {
    // Use different keys for different contexts
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    const contextKey = crypto
      .createHash('sha256')
      .update(masterKey + context)
      .digest();

    return contextKey;
  }
}
```

### Secure Key Management

#### **Key Management Service**

```typescript
// Key management service
@Injectable()
export class KeyManagementService {
  private readonly KEY_ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000; // 90 days

  async rotateKeys(): Promise<void> {
    const keys = await this.getActiveKeys();

    for (const key of keys) {
      if (this.shouldRotateKey(key)) {
        await this.rotateKey(key);
      }
    }
  }

  async generateNewKey(keyType: string): Promise<EncryptionKey> {
    const key = {
      id: crypto.randomUUID(),
      type: keyType,
      key: crypto.randomBytes(32).toString('hex'),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.KEY_ROTATION_INTERVAL),
      isActive: true,
    };

    await this.keyRepository.create(key);
    return key;
  }

  private shouldRotateKey(key: EncryptionKey): boolean {
    return key.expiresAt < new Date();
  }

  private async rotateKey(key: EncryptionKey): Promise<void> {
    // Generate new key
    const newKey = await this.generateNewKey(key.type);

    // Re-encrypt data with new key
    await this.reEncryptData(key, newKey);

    // Deactivate old key
    await this.keyRepository.update(key.id, { isActive: false });
  }

  private async reEncryptData(oldKey: EncryptionKey, newKey: EncryptionKey): Promise<void> {
    // Implement data re-encryption logic
    // This is a complex operation that should be done in batches
  }
}
```

---

## 🔍 Security Monitoring

### Security Event Monitoring

#### **Security Monitoring Service**

```typescript
// Security monitoring service
@Injectable()
export class SecurityMonitoringService {
  private readonly RISK_THRESHOLDS = {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 75,
    privilegeEscalationAttempts: 1,
    crossTenantAccessAttempts: 1,
  };

  async monitorAuthenticationEvents(): Promise<void> {
    const recentEvents = await this.getRecentAuthEvents();

    for (const event of recentEvents) {
      const riskScore = await this.calculateRiskScore(event);

      if (riskScore > this.RISK_THRESHOLDS.suspiciousActivityScore) {
        await this.triggerSecurityAlert('HIGH_RISK_AUTH_EVENT', event);
      }
    }
  }

  async monitorPrivilegeEscalation(): Promise<void> {
    const escalations = await this.detectPrivilegeEscalation();

    for (const escalation of escalations) {
      await this.triggerSecurityAlert('PRIVILEGE_ESCALATION', escalation);
    }
  }

  async monitorUnusualActivity(): Promise<void> {
    const unusualActivity = await this.detectUnusualActivity();

    for (const activity of unusualActivity) {
      await this.triggerSecurityAlert('UNUSUAL_ACTIVITY', activity);
    }
  }

  private async calculateRiskScore(event: SecurityEvent): Promise<number> {
    let score = 0;

    // Failed login attempts
    if (event.action === 'LOGIN_FAILED') {
      score += 20;
    }

    // Unusual location
    if (await this.isUnusualLocation(event.ipAddress, event.userId)) {
      score += 30;
    }

    // Unusual time
    if (await this.isUnusualTime(event.timestamp, event.userId)) {
      score += 25;
    }

    // Multiple failed attempts
    const failedAttempts = await this.getFailedAttempts(event.userId, '1h');
    if (failedAttempts > this.RISK_THRESHOLDS.failedLoginAttempts) {
      score += 40;
    }

    return score;
  }

  private async triggerSecurityAlert(type: string, event: SecurityEvent): Promise<void> {
    const alert = {
      id: crypto.randomUUID(),
      type,
      event,
      timestamp: new Date(),
      severity: this.calculateSeverity(type),
      status: 'OPEN',
    };

    await this.alertRepository.create(alert);

    // Send notifications
    await this.sendSecurityNotifications(alert);

    // Log to SIEM
    await this.siemService.sendAlert(alert);
  }

  private calculateSeverity(type: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const severityMap = {
      HIGH_RISK_AUTH_EVENT: 'HIGH',
      PRIVILEGE_ESCALATION: 'CRITICAL',
      UNUSUAL_ACTIVITY: 'MEDIUM',
      CROSS_TENANT_ACCESS_ATTEMPT: 'HIGH',
    };

    return severityMap[type] || 'LOW';
  }
}
```

### Audit Logging

#### **Comprehensive Audit Service**

```typescript
// Comprehensive audit service
@Injectable()
export class ComprehensiveAuditService {
  async logSecurityEvent(event: SecurityAuditEvent): Promise<void> {
    const auditEntry = {
      id: crypto.randomUUID(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      correlationId: event.correlationId,
      sessionId: event.sessionId,
      tenantId: event.tenantId,
      severity: event.severity || 'INFO',
      timestamp: new Date(),
      metadata: {
        requestId: event.requestId,
        endpoint: event.endpoint,
        method: event.method,
        statusCode: event.statusCode,
      },
    };

    // Store in database
    await this.auditRepository.create(auditEntry);

    // Send to SIEM
    await this.siemService.sendEvent(auditEntry);

    // Store in cache for quick access
    await this.cacheAuditEntry(auditEntry);

    // Trigger alerts if necessary
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      await this.triggerSecurityAlert(auditEntry);
    }
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    reportType: ComplianceReportType,
  ): Promise<ComplianceReport> {
    const logs = await this.auditRepository.findByDateRange(startDate, endDate);

    return {
      period: { startDate, endDate },
      reportType,
      summary: await this.generateSummary(logs),
      details: await this.generateDetails(logs, reportType),
      compliance: await this.assessCompliance(logs, reportType),
      recommendations: await this.generateRecommendations(logs, reportType),
    };
  }

  private async cacheAuditEntry(entry: AuditEntry): Promise<void> {
    const key = `audit:${entry.id}`;
    await this.redisService.setex(key, 86400, JSON.stringify(entry)); // 24 hours
  }

  private async triggerSecurityAlert(entry: AuditEntry): Promise<void> {
    // Implement security alert logic
  }
}
```

---

## 🚨 Incident Response

### Security Incident Response

#### **Incident Response Service**

```typescript
// Incident response service
@Injectable()
export class IncidentResponseService {
  private readonly INCIDENT_SEVERITY_LEVELS = {
    LOW: { responseTime: 24 * 60 * 60 * 1000, escalationLevel: 1 },
    MEDIUM: { responseTime: 4 * 60 * 60 * 1000, escalationLevel: 2 },
    HIGH: { responseTime: 60 * 60 * 1000, escalationLevel: 3 },
    CRITICAL: { responseTime: 15 * 60 * 1000, escalationLevel: 4 },
  };

  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Create incident record
    const incidentRecord = await this.createIncidentRecord(incident);

    // Assess severity
    const severity = await this.assessIncidentSeverity(incident);

    // Take immediate actions
    await this.takeImmediateActions(incident, severity);

    // Escalate if necessary
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      await this.escalateIncident(incidentRecord);
    }

    // Start investigation
    await this.startInvestigation(incidentRecord);
  }

  private async takeImmediateActions(incident: SecurityIncident, severity: string): Promise<void> {
    switch (incident.type) {
      case 'UNAUTHORIZED_ACCESS':
        await this.blockUser(incident.userId);
        await this.deactivateAllSessions(incident.userId);
        break;

      case 'PRIVILEGE_ESCALATION':
        await this.revokeElevatedPermissions(incident.userId);
        await this.auditUserPermissions(incident.userId);
        break;

      case 'DATA_BREACH':
        await this.quarantineAffectedData(incident.resourceId);
        await this.notifyDataProtectionOfficer(incident);
        break;

      case 'MALWARE_DETECTION':
        await this.isolateAffectedSystems(incident.systemId);
        await this.scanForMalware(incident.systemId);
        break;
    }
  }

  private async blockUser(userId: string): Promise<void> {
    await this.userRepository.update(userId, { status: 'SUSPENDED' });
    await this.deactivateAllUserSessions(userId);
    await this.logSecurityEvent('USER_BLOCKED', { userId, reason: 'Security incident' });
  }

  private async escalateIncident(incident: IncidentRecord): Promise<void> {
    const escalation = {
      incidentId: incident.id,
      level: this.INCIDENT_SEVERITY_LEVELS[incident.severity].escalationLevel,
      timestamp: new Date(),
      assignedTo: await this.getEscalationContact(incident.severity),
    };

    await this.escalationRepository.create(escalation);
    await this.sendEscalationNotification(escalation);
  }
}
```

---

## 📋 Compliance Requirements

### GDPR Compliance

#### **Data Protection Implementation**

```typescript
// GDPR compliance service
@Injectable()
export class GDPRComplianceService {
  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    switch (request.type) {
      case 'ACCESS':
        await this.provideDataAccess(request.userId);
        break;

      case 'RECTIFICATION':
        await this.rectifyData(request.userId, request.data);
        break;

      case 'ERASURE':
        await this.eraseData(request.userId);
        break;

      case 'PORTABILITY':
        await this.provideDataPortability(request.userId);
        break;

      case 'RESTRICTION':
        await this.restrictProcessing(request.userId);
        break;
    }
  }

  async provideDataAccess(userId: string): Promise<UserDataExport> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sessions', 'auditLogs'],
    });

    return {
      personalData: this.extractPersonalData(user),
      processingActivities: await this.getProcessingActivities(userId),
      thirdPartySharing: await this.getThirdPartySharing(userId),
      dataRetention: await this.getDataRetentionInfo(userId),
    };
  }

  async eraseData(userId: string): Promise<void> {
    // Anonymize personal data
    await this.userRepository.update(userId, {
      email: `deleted_${userId}@deleted.com`,
      firstName: 'DELETED',
      lastName: 'DELETED',
      displayName: 'DELETED',
      phoneNumber: null,
      avatar: null,
      status: 'DELETED',
    });

    // Delete sessions
    await this.sessionRepository.delete({ userId });

    // Anonymize audit logs
    await this.auditRepository.update({ userId }, { userId: null, userEmail: 'DELETED' });

    // Log erasure
    await this.logDataErasure(userId);
  }

  private extractPersonalData(user: User): PersonalData {
    return {
      basicInfo: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
      },
      preferences: user.preferences,
      activityData: {
        lastLoginAt: user.lastLoginAt,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt,
      },
    };
  }
}
```

### SOC 2 Compliance

#### **SOC 2 Control Monitoring**

```typescript
// SOC 2 compliance service
@Injectable()
export class SOC2ComplianceService {
  async monitorAccessControls(): Promise<AccessControlReport> {
    const report = {
      timestamp: new Date(),
      failedLoginAttempts: await this.getFailedLoginAttempts(),
      privilegeEscalations: await this.getPrivilegeEscalations(),
      unauthorizedAccess: await this.getUnauthorizedAccess(),
      sessionManagement: await this.getSessionManagementMetrics(),
      compliance: true,
    };

    // Check compliance thresholds
    if (report.failedLoginAttempts > 100 || report.unauthorizedAccess > 10) {
      report.compliance = false;
      await this.triggerComplianceAlert('SOC2_ACCESS_CONTROL_VIOLATION', report);
    }

    return report;
  }

  async monitorDataProtection(): Promise<DataProtectionReport> {
    return {
      encryptionStatus: await this.checkEncryptionStatus(),
      backupStatus: await this.checkBackupStatus(),
      dataRetention: await this.checkDataRetention(),
      accessLogging: await this.checkAccessLogging(),
      compliance: true,
    };
  }

  async generateSOC2Report(): Promise<SOC2Report> {
    return {
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
      accessControls: await this.monitorAccessControls(),
      dataProtection: await this.monitorDataProtection(),
      incidentResponse: await this.monitorIncidentResponse(),
      businessContinuity: await this.monitorBusinessContinuity(),
      compliance: true,
    };
  }
}
```

---

## 🔧 Security Configuration

### Environment Security

```bash
# Security-critical environment variables
# JWT Secrets (use strong, unique secrets)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Encryption Keys (use strong, unique keys)
ENCRYPTION_MASTER_KEY=your-32-byte-master-key
PASSWORD_PEPPER=your-password-pepper-key

# Database Security
DATABASE_SSL=true
DATABASE_SSL_CA=/path/to/ca-certificate.pem

# Redis Security
REDIS_PASSWORD=your-strong-redis-password
REDIS_SSL=true

# Session Security
SESSION_SECRET=your-session-secret-min-32-chars
SESSION_SECURE_COOKIES=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff

# MFA Configuration
MFA_TOTP_ALGORITHM=sha1
MFA_TOTP_DIGITS=6
MFA_TOTP_PERIOD=30
MFA_SMS_RATE_LIMIT=3
MFA_SMS_COOLDOWN=1800

# Audit Configuration
AUDIT_LOG_RETENTION_DAYS=2555
AUDIT_LOG_ENCRYPTION=true
SIEM_ENDPOINT=https://your-siem.com/api/events
```

### Security Headers Configuration

```typescript
// Security headers middleware
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    );

    // HTTP Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  }
}
```

---

## 📚 Additional Resources

### Security Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001 Information Security](https://www.iso.org/isoiec-27001-information-security.html)

### Compliance Resources

- [GDPR Compliance Guide](https://gdpr.eu/)
- [SOC 2 Compliance](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

### Security Tools

- [Snyk Security Platform](https://snyk.io/)
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Nmap Security Scanner](https://nmap.org/)

---

_This security best practices guide is part of the Hestia Enterprise SaaS Platform documentation suite. For questions or support, please refer to the resources above or create an issue in the GitHub repository._
