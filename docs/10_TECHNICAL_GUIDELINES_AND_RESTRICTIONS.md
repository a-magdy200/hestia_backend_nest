# Technical Guidelines and Restrictions

## 📋 Document Information

| **Document Type** | Technical Guidelines and Restrictions |
| ----------------- | ------------------------------------- |
| **Version**       | 1.1.0                                 |
| **Last Updated**  | December 28, 2024                     |
| **Owner**         | Architecture Team                     |
| **Status**        | Phase 1 - 90% Complete                |

---

## 🎯 Executive Summary

This document defines comprehensive technical guidelines and strict restrictions to ensure 100% quality code delivery, maintainability, performance, and production readiness for the Hestia Enterprise SaaS Platform. These guidelines enforce clean architecture principles, SOLID design patterns, comprehensive error handling, and zero-tolerance quality standards across all development activities.

### **Quality Philosophy & Principles**

- **🚫 Zero Tolerance**: No known issues, no technical debt, no shortcuts - ever
- **🚀 Production Ready**: Every commit must be production-ready with comprehensive testing
- **📖 Maintainable**: Code must be self-documenting, easily maintainable, and future-proof
- **⚡ Performant**: All code must meet strict performance benchmarks and optimization standards
- **🛡️ Secure**: Security-first approach in all implementations with comprehensive validation
- **🏗️ Scalable**: Code must support infinite scalability and enterprise-grade requirements
- **🌍 Global**: Code must support internationalization, localization, and multi-tenancy
- **🤖 Automated**: Comprehensive automation for testing, deployment, and quality assurance

---

## 🏗️ Architecture Principles

### **Clean Architecture Enforcement**

#### **Layer Separation**

```typescript
// STRICT: No cross-layer dependencies
// ✅ CORRECT
Controller → Service → Repository → Database

// ❌ FORBIDDEN
Controller → Database (Direct access)
Service → Controller (Reverse dependency)
```

#### **Dependency Inversion**

```typescript
// STRICT: Depend on abstractions, not concretions
// ✅ CORRECT
interface UserRepository {
  findById(id: string): Promise<User>;
}

class UserService {
  constructor(private userRepo: UserRepository) {}
}

// ❌ FORBIDDEN
class UserService {
  constructor(private userRepo: PostgreSQLUserRepository) {}
}
```

### **SOLID Principles Enforcement**

#### **Single Responsibility Principle (SRP)**

```typescript
// STRICT: One class, one reason to change
// ✅ CORRECT
class UserAuthenticationService {
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // Only authentication logic
  }
}

class UserProfileService {
  async updateProfile(userId: string, profile: Profile): Promise<void> {
    // Only profile management logic
  }
}

// ❌ FORBIDDEN
class UserService {
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // Authentication logic
  }

  async updateProfile(userId: string, profile: Profile): Promise<void> {
    // Profile logic
  }

  async sendEmail(userId: string, email: Email): Promise<void> {
    // Email logic
  }
}
```

#### **Open/Closed Principle (OCP)**

```typescript
// STRICT: Open for extension, closed for modification
// ✅ CORRECT
interface PaymentProcessor {
  process(payment: Payment): Promise<PaymentResult>;
}

class StripePaymentProcessor implements PaymentProcessor {
  async process(payment: Payment): Promise<PaymentResult> {
    // Stripe implementation
  }
}

class PayPalPaymentProcessor implements PaymentProcessor {
  async process(payment: Payment): Promise<PaymentResult> {
    // PayPal implementation
  }
}

// ❌ FORBIDDEN
class PaymentService {
  async process(payment: Payment): Promise<PaymentResult> {
    if (payment.provider === 'stripe') {
      // Stripe logic
    } else if (payment.provider === 'paypal') {
      // PayPal logic
    }
  }
}
```

---

## 📏 Strict Code Quality Restrictions

### **File Size Limits**

#### **Maximum File Sizes**

```typescript
// STRICT ENFORCEMENT
- Controller files: ≤ 200 lines
- Service files: ≤ 300 lines
- Repository files: ≤ 250 lines
- Entity files: ≤ 150 lines
- DTO files: ≤ 100 lines
- Interface files: ≤ 50 lines
- Test files: ≤ 400 lines
- Configuration files: ≤ 100 lines
```

#### **Violation Consequences**

- **Automatic Rejection**: Files exceeding limits are automatically rejected
- **Mandatory Refactoring**: Split files into smaller, focused modules
- **Code Review Block**: Cannot proceed without size compliance

### **Function Size Limits**

#### **Maximum Function Sizes**

```typescript
// STRICT ENFORCEMENT
- Controller methods: ≤ 20 lines
- Service methods: ≤ 30 lines
- Repository methods: ≤ 25 lines
- Utility functions: ≤ 15 lines
- Test functions: ≤ 50 lines
- Async functions: ≤ 25 lines
```

#### **Function Complexity Rules**

```typescript
// STRICT: Maximum cyclomatic complexity
- All functions: ≤ 5 complexity points
- Critical functions: ≤ 3 complexity points
- Test functions: ≤ 8 complexity points

// Complexity calculation:
// +1 for each if, else if, else
// +1 for each for, while, do-while
// +1 for each case in switch
// +1 for each &&, || operator
```

### **Class Size Limits**

#### **Maximum Class Sizes**

```typescript
// STRICT ENFORCEMENT
- Controllers: ≤ 5 methods
- Services: ≤ 8 methods
- Repositories: ≤ 6 methods
- Entities: ≤ 10 properties
- DTOs: ≤ 8 properties
- Value Objects: ≤ 5 properties
```

#### **Class Responsibility Rules**

```typescript
// STRICT: One class, one responsibility
// ✅ CORRECT
class UserAuthenticationService {
  async authenticate(credentials: Credentials): Promise<AuthResult> {}
  async validateToken(token: string): Promise<boolean> {}
  async refreshToken(refreshToken: string): Promise<AuthResult> {}
}

// ❌ FORBIDDEN
class UserService {
  // Authentication methods
  async authenticate(credentials: Credentials): Promise<AuthResult> {}
  async validateToken(token: string): Promise<boolean> {}

  // Profile methods
  async updateProfile(userId: string, profile: Profile): Promise<void> {}
  async getProfile(userId: string): Promise<Profile> {}

  // Email methods
  async sendWelcomeEmail(userId: string): Promise<void> {}
  async sendPasswordResetEmail(email: string): Promise<void> {}
}
```

---

## 🔤 Naming & Documentation Restrictions

### **Variable Naming Rules**

#### **Strict Naming Conventions**

```typescript
// STRICT ENFORCEMENT
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Classes: PascalCase
- Interfaces: PascalCase with 'I' prefix
- Enums: PascalCase
- Files: kebab-case
- Directories: kebab-case

// ✅ CORRECT
const userService = new UserService();
const MAX_RETRY_ATTEMPTS = 3;
interface IUserRepository {}
enum UserStatus {}
// user-authentication.service.ts

// ❌ FORBIDDEN
const UserService = new userService();
const maxRetryAttempts = 3;
interface UserRepository {}
enum userStatus {}
// UserAuthenticationService.ts
```

#### **Descriptive Naming Requirements**

```typescript
// STRICT: Names must be self-documenting
// ✅ CORRECT
const isUserAuthenticated = await validateUserToken(token);
const hasValidPermissions = await checkUserPermissions(userId, resource);
const shouldRetryRequest = attemptCount < MAX_RETRY_ATTEMPTS;

// ❌ FORBIDDEN
const flag = await validateUserToken(token);
const check = await checkUserPermissions(userId, resource);
const retry = attemptCount < MAX_RETRY_ATTEMPTS;
```

### **Documentation Requirements**

#### **Mandatory Documentation**

```typescript
// STRICT: All public APIs must be documented
/**
 * Authenticates a user with email and password
 * @param credentials - User credentials containing email and password
 * @returns Promise resolving to authentication result
 * @throws AuthenticationError when credentials are invalid
 * @throws ValidationError when credentials format is invalid
 */
async authenticate(credentials: Credentials): Promise<AuthResult> {
  // Implementation
}

// STRICT: All interfaces must be documented
/**
 * Repository interface for user data operations
 * Provides CRUD operations for user entities
 */
interface IUserRepository {
  /**
   * Finds a user by their unique identifier
   * @param id - User's unique identifier
   * @returns Promise resolving to user or null if not found
   */
  findById(id: string): Promise<User | null>;
}
```

#### **Code Comments Rules**

```typescript
// STRICT: Comments must explain WHY, not WHAT
// ✅ CORRECT
// Retry logic needed because external service is occasionally unreliable
if (attemptCount < MAX_RETRY_ATTEMPTS) {
  await retryRequest();
}

// ❌ FORBIDDEN
// Check if attempt count is less than max retry attempts
if (attemptCount < MAX_RETRY_ATTEMPTS) {
  await retryRequest();
}
```

---

## 🚫 Import & Dependency Restrictions

### **Import Rules**

#### **Strict Import Organization**

```typescript
// STRICT: Imports must be organized in this order
// 1. Node.js built-in modules
import { readFileSync } from 'fs';
import { join } from 'path';

// 2. Third-party libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 3. Internal modules (absolute paths)
import { User } from '@/entities/user.entity';
import { IUserRepository } from '@/repositories/user.repository.interface';

// 4. Relative imports
import { UserDto } from './user.dto';
import { UserMapper } from './user.mapper';

// ❌ FORBIDDEN: Mixed import order
import { User } from '@/entities/user.entity';
import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
```

#### **Import Restrictions**

```typescript
// STRICT: No circular dependencies
// ❌ FORBIDDEN
// user.service.ts
import { UserController } from './user.controller';

// user.controller.ts
import { UserService } from './user.service';

// STRICT: No unused imports
// ❌ FORBIDDEN
import { Injectable, Controller, Get, Post } from '@nestjs/common';
// Only Injectable and Get are used

// STRICT: No wildcard imports
// ❌ FORBIDDEN
import * as utils from './utils';
// ✅ CORRECT
import { formatDate, validateEmail } from './utils';
```

### **Dependency Injection Rules**

#### **Constructor Injection Only**

```typescript
// STRICT: Use constructor injection only
// ✅ CORRECT
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}
}

// ❌ FORBIDDEN
@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject()
  private emailService: EmailService;
}
```

---

## ⚠️ Error Handling Restrictions

### **Comprehensive Error Handling**

#### **Mandatory Error Handling**

```typescript
// STRICT: All async operations must have error handling
// ✅ CORRECT
async createUser(userData: CreateUserDto): Promise<User> {
  try {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  } catch (error) {
    this.logger.error('Failed to create user', { error, userData });
    throw new UserCreationError('Failed to create user', error);
  }
}

// ❌ FORBIDDEN
async createUser(userData: any): Promise<User> {
  return this.userRepository.create(userData);
}
```

#### **Custom Error Classes**

```typescript
// STRICT: Use custom error classes for all errors
// ✅ CORRECT
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ❌ FORBIDDEN
throw new Error('User not found');
throw new Error('Invalid email format');
```

### **Error Logging Requirements**

#### **Structured Error Logging**

```typescript
// STRICT: All errors must be logged with context
// ✅ CORRECT
try {
  await this.processUserData(userId);
} catch (error) {
  this.logger.error('Failed to process user data', {
    userId,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    operation: 'processUserData',
  });
  throw error;
}

// ❌ FORBIDDEN
try {
  await this.processUserData(userId);
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

---

## 🔒 Security Restrictions

### **Input Validation**

#### **Strict Input Validation**

```typescript
// STRICT: All inputs must be validated
// ✅ CORRECT
async createUser(userData: CreateUserDto): Promise<User> {
  // Validate DTO
  const validationResult = await validate(CreateUserDto, userData);
  if (validationResult.length > 0) {
    throw new ValidationError('Invalid user data', validationResult);
  }

  // Sanitize inputs
  const sanitizedData = this.sanitizeUserData(userData);

  // Process validated data
  return this.userRepository.create(sanitizedData);
}

// ❌ FORBIDDEN
async createUser(userData: any): Promise<User> {
  return this.userRepository.create(userData);
}
```

### **SQL Injection Prevention**

#### **Parameterized Queries Only**

```typescript
// STRICT: Use parameterized queries only
// ✅ CORRECT
async findByEmail(email: string): Promise<User | null> {
  return this.userRepository.findOne({
    where: { email }
  });
}

// ❌ FORBIDDEN
async findByEmail(email: string): Promise<User | null> {
  return this.userRepository.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
}
```

---

## 🚀 Performance Restrictions

### **Database Query Optimization**

#### **N+1 Query Prevention**

```typescript
// STRICT: Prevent N+1 queries
// ✅ CORRECT
async getUsersWithProfiles(): Promise<User[]> {
  return this.userRepository.find({
    relations: ['profile'],
    select: ['id', 'email', 'profile.id', 'profile.firstName']
  });
}

// ❌ FORBIDDEN
async getUsersWithProfiles(): Promise<User[]> {
  const users = await this.userRepository.find();
  for (const user of users) {
    user.profile = await this.profileRepository.findOne({
      where: { userId: user.id }
    });
  }
  return users;
}
```

### **Memory Management**

#### **Memory Leak Prevention**

```typescript
// STRICT: Prevent memory leaks
// ✅ CORRECT
async processLargeDataset(): Promise<void> {
  const batchSize = 1000;
  let offset = 0;

  while (true) {
    const batch = await this.repository.find({
      skip: offset,
      take: batchSize
    });

    if (batch.length === 0) break;

    await this.processBatch(batch);
    offset += batchSize;

    // Clear references
    batch.length = 0;
  }
}

// ❌ FORBIDDEN
async processLargeDataset(): Promise<void> {
  const allData = await this.repository.find(); // Loads everything into memory
  for (const item of allData) {
    await this.processItem(item);
  }
}
```

---

## 🧪 Testing Restrictions

### **Test Coverage Requirements**

#### **Mandatory Coverage Levels**

```typescript
// STRICT ENFORCEMENT
- Unit Tests: ≥ 90% coverage
- Integration Tests: ≥ 80% coverage
- E2E Tests: ≥ 70% coverage
- Critical Paths: 100% coverage
- Error Paths: 100% coverage
```

#### **Test Quality Requirements**

```typescript
// STRICT: Tests must be meaningful
// ✅ CORRECT
describe('UserService.authenticate', () => {
  it('should authenticate valid credentials', async () => {
    const credentials = { email: 'test@example.com', password: 'validPassword' };
    const result = await userService.authenticate(credentials);

    expect(result.isAuthenticated).toBe(true);
    expect(result.user.email).toBe(credentials.email);
  });

  it('should reject invalid credentials', async () => {
    const credentials = { email: 'test@example.com', password: 'wrongPassword' };

    await expect(userService.authenticate(credentials)).rejects.toThrow(InvalidCredentialsError);
  });
});

// ❌ FORBIDDEN
describe('UserService', () => {
  it('should work', async () => {
    expect(true).toBe(true);
  });
});
```

---

## 🔧 Tooling & Automation

### **Pre-commit Hooks**

#### **Mandatory Pre-commit Checks**

```bash
# STRICT: All checks must pass before commit
npm run lint          # ESLint + Prettier
npm run type-check    # TypeScript compilation
npm run test:unit     # Unit tests
npm run test:coverage # Coverage check
npm run security      # Security scan
npm run build         # Production build
```

### **CI/CD Pipeline Enforcement**

#### **Quality Gates**

```yaml
# STRICT: All gates must pass
quality_gates:
  - code_coverage >= 90%
  - security_scan_score >= 0
  - performance_budget_met: true
  - no_critical_vulnerabilities: true
  - all_tests_passing: true
  - build_successful: true
  - linting_passed: true
```

### **SonarQube Integration**

#### **Quality Gate Configuration**

```yaml
# STRICT: SonarQube quality gates
sonarqube:
  quality_gates:
    - reliability_rating: A
    - security_rating: A
    - security_hotspots_reviewed: 100%
    - maintainability_rating: A
    - code_smells: 0
    - bugs: 0
    - vulnerabilities: 0
    - coverage: 90%
    - duplicated_lines: 3%
```

---

## 📊 Monitoring & Metrics

### **Performance Monitoring**

#### **Mandatory Metrics**

```typescript
// STRICT: All endpoints must be monitored
@Controller('users')
export class UserController {
  @Get(':id')
  @UseInterceptors(PerformanceInterceptor)
  async getUser(@Param('id') id: string): Promise<User> {
    // Implementation
  }
}

// Performance interceptor
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.metrics.recordApiCall({
          endpoint: request.route.path,
          method: request.method,
          duration,
          statusCode: context.switchToHttp().getResponse().statusCode,
        });
      }),
    );
  }
}
```

### **Error Tracking**

#### **Comprehensive Error Tracking**

```typescript
// STRICT: All errors must be tracked
@Injectable()
export class ErrorTrackingService {
  trackError(error: Error, context: ErrorContext): void {
    this.errorTracker.captureException(error, {
      tags: {
        service: context.service,
        operation: context.operation,
        userId: context.userId,
      },
      extra: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      },
    });
  }
}
```

---

## 🚨 Violation Consequences

### **Zero Tolerance Policy**

#### **Immediate Actions**

- **Automatic Rejection**: Code violating restrictions is automatically rejected
- **Build Failure**: CI/CD pipeline fails on any violation
- **Review Block**: Code reviews cannot proceed with violations
- **Merge Prevention**: Violations prevent merging to main branch

#### **Escalation Process**

1. **First Violation**: Warning and mandatory fix
2. **Second Violation**: Code review required
3. **Third Violation**: Team lead review required
4. **Fourth Violation**: Architecture team review required
5. **Fifth Violation**: Disciplinary action

### **Quality Enforcement Tools**

#### **Automated Enforcement**

```yaml
# GitHub Actions workflow
name: Quality Enforcement
on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type checking
        run: npm run type-check
      - name: Run tests
        run: npm run test:coverage
      - name: Security scan
        run: npm run security
      - name: Performance check
        run: npm run performance
      - name: Quality gate
        run: npm run quality-gate
```

---

## 📚 Best Practices Reference

### **Code Organization**

#### **File Structure**

```
src/
├── controllers/          # HTTP controllers
├── services/            # Business logic
├── repositories/        # Data access
├── entities/           # Domain entities
├── dto/                # Data transfer objects
├── interfaces/         # Type definitions
├── utils/              # Utility functions
├── config/             # Configuration
├── middleware/         # Custom middleware
├── guards/             # Authentication guards
├── interceptors/       # Request/response interceptors
├── filters/            # Exception filters
└── tests/              # Test files
```

### **Naming Conventions**

#### **File Naming**

```
user-authentication.service.ts
user-profile.controller.ts
user-repository.interface.ts
create-user.dto.ts
user.entity.ts
user.mapper.ts
user.validator.ts
user.constants.ts
```

### **Code Examples**

#### **Service Implementation**

```typescript
@Injectable()
export class UserAuthenticationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly logger: ILogger,
  ) {}

  async authenticate(credentials: AuthenticateUserDto): Promise<AuthenticationResult> {
    try {
      // Validate input
      await this.validateCredentials(credentials);

      // Find user
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        throw new InvalidCredentialsError('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await this.passwordService.verify(
        credentials.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new InvalidCredentialsError('Invalid email or password');
      }

      // Generate tokens
      const tokens = await this.tokenService.generateTokens(user.id);

      // Log successful authentication
      this.logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
      });

      return {
        user: this.mapUserToDto(user),
        tokens,
      };
    } catch (error) {
      this.logger.error('Authentication failed', {
        email: credentials.email,
        error: error.message,
      });
      throw error;
    }
  }
}
```

---

## 📋 Compliance Checklist

### **Pre-commit Checklist**

- [ ] Code follows naming conventions
- [ ] File size within limits
- [ ] Function size within limits
- [ ] Class size within limits
- [ ] All imports organized correctly
- [ ] No unused imports
- [ ] No circular dependencies
- [ ] All public APIs documented
- [ ] Error handling implemented
- [ ] Input validation implemented
- [ ] Unit tests written and passing
- [ ] Test coverage meets requirements
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scan passes
- [ ] Performance benchmarks met

### **Code Review Checklist**

- [ ] Architecture principles followed
- [ ] SOLID principles applied
- [ ] Clean code practices used
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Error handling comprehensive
- [ ] Logging appropriate
- [ ] Documentation complete
- [ ] Tests meaningful and comprehensive
- [ ] No technical debt introduced

---

_This document enforces strict quality standards to ensure the Hestia platform maintains enterprise-grade quality, performance, and maintainability. All development must comply with these guidelines without exception._
