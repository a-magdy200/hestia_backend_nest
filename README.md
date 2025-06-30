<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🏠 Hestia Enterprise SaaS Platform - Backend API

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/your-org/hestia-backend-nest/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen?style=flat-square)](https://github.com/your-org/hestia-backend-nest)
[![Security](https://img.shields.io/badge/security-scanned-brightgreen?style=flat-square)](https://github.com/your-org/hestia-backend-nest/security)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

A comprehensive, enterprise-grade NestJS backend API for the Hestia Recipe Management Platform, featuring advanced automation, security, and quality enforcement.

## 🚀 Features

### Core Platform Features

- **Recipe Management**: Full CRUD operations with advanced search and filtering
- **Ingredient Database**: Comprehensive ingredient catalog with nutritional data
- **User Management**: Multi-tenant user system with role-based access control
- **Shopping Lists**: Collaborative shopping list management
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Real-time Updates**: WebSocket support for live data synchronization

### Enterprise Features

- **Multi-tenancy**: Complete tenant isolation and management
- **Advanced Search**: Custom search engine with full-text search capabilities
- **File Management**: Multi-provider storage (Local, S3, Wasabi) with image processing
- **Audit Logging**: Comprehensive audit trail for compliance
- **Performance Monitoring**: Real-time metrics and performance tracking
- **Security**: JWT authentication, RBAC, encryption, and vulnerability scanning

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 18.x LTS
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x with TypeORM
- **Cache**: Redis 7.x
- **Message Queue**: RabbitMQ 3.12.x
- **Search**: Custom search engine implementation

### DevOps & Quality

- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus & Grafana
- **Logging**: ELK Stack
- **Security**: Snyk, OWASP Dependency Check, CodeQL
- **Testing**: Jest, Supertest, MSW
- **Documentation**: TypeDoc, Swagger

## 📋 Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- PostgreSQL 15.x
- Redis 7.x
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/hestia-backend-nest.git
cd hestia-backend-nest
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Run migrations
pnpm run db:migrate

# Seed initial data
pnpm run db:seed
```

### 4. Start Development Server

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`

## 🔧 Available Scripts

### Development

```bash
pnpm run start:dev          # Start development server with hot reload
pnpm run start:debug        # Start with debug mode
pnpm run build              # Build for production
pnpm run start:prod         # Start production server
```

### Testing & Quality

```bash
pnpm run test               # Run unit tests
pnpm run test:watch         # Run tests in watch mode
pnpm run test:cov           # Run tests with coverage
pnpm run test:e2e           # Run end-to-end tests
pnpm run accessibility:test # Run accessibility tests
pnpm run lint               # Run ESLint
pnpm run type-check         # Run TypeScript type checking
pnpm run quality-gate       # Run all quality checks
```

### Security & Compliance

```bash
pnpm run security           # Run security scans
pnpm run security:monitor   # Monitor dependencies with Snyk
pnpm run license:check      # Check license compliance
pnpm run license:report     # Generate license report
```

### Documentation

```bash
pnpm run docs:generate      # Generate API documentation
pnpm run docs:serve         # Serve documentation locally
pnpm run swagger:generate   # Generate Swagger documentation
```

### Database Management

```bash
pnpm run db:migrate         # Run database migrations
pnpm run db:migrate:revert  # Revert last migration
pnpm run db:seed            # Seed database with test data
pnpm run db:reset           # Reset and reseed database
```

### Dependency Management

```bash
pnpm run deps:check         # Check for outdated dependencies
pnpm run deps:update        # Update dependencies
pnpm run deps:audit         # Audit dependencies for vulnerabilities
```

### Release & Deployment

```bash
pnpm run release            # Create semantic release
pnpm run release:dry-run    # Dry run semantic release
pnpm run deploy:staging     # Deploy to staging
pnpm run deploy:production  # Deploy to production
```

### Docker Operations

```bash
pnpm run docker:build       # Build Docker image
pnpm run docker:run         # Run Docker container
pnpm run docker:compose     # Start with Docker Compose
```

### Monitoring & Health

```bash
pnpm run health:check       # Check application health
pnpm run monitoring:start   # Start PM2 monitoring
pnpm run monitoring:status  # Check monitoring status
```

## 🔒 Security Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-tenant user isolation
- Session management with Redis
- **Comprehensive IAM System**: Advanced identity and access management with multi-strategy authentication, profile management, and compliance features

### Data Protection

- Encryption at rest for sensitive data
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Security Scanning

- Automated vulnerability scanning with Snyk
- OWASP Dependency Check integration
- CodeQL analysis for security vulnerabilities
- Container security scanning with Trivy
- Secrets scanning with TruffleHog

## 📚 Documentation

### Core Documentation

- **[Project Overview & Vision](docs/01_PROJECT_OVERVIEW_AND_VISION.md)**: Strategic vision and business objectives
- **[Business Requirements](docs/02_BUSINESS_REQUIREMENTS_AND_USE_CASES.md)**: Detailed business requirements and use cases
- **[Feature Catalog](docs/03_FEATURE_CATALOG_AND_SPECIFICATIONS.md)**: Comprehensive feature specifications
- **[Technical Architecture](docs/04_TECHNICAL_ARCHITECTURE_AND_DESIGN.md)**: System architecture and design patterns
- **[Domain Model](docs/05_DOMAIN_MODEL_AND_ENTITY_REFERENCE.md)**: Entity relationships and data models
- **[API Handbook](docs/06_API_AND_INTEGRATION_HANDBOOK.md)**: API documentation and integration guides
- **[Security & Compliance](docs/07_SECURITY_COMPLIANCE_AND_DATA_PROTECTION.md)**: Security standards and compliance requirements
- **[Localization](docs/08_LOCALIZATION_AND_INTERNATIONALIZATION.md)**: Internationalization and localization features
- **[Testing Strategy](docs/09_TESTING_STRATEGY_AND_QUALITY_ASSURANCE.md)**: Testing approaches and quality assurance
- **[Technical Guidelines](docs/10_TECHNICAL_GUIDELINES_AND_RESTRICTIONS.md)**: Development standards and restrictions

### Specialized Documentation

- **[IAM System & Profile Management](docs/14_IAM_SYSTEM_AND_PROFILE_MANAGEMENT.md)**: Comprehensive identity and access management system
- **[Enterprise Application](docs/ENTERPRISE_APPLICATION_DOCUMENTATION.md)**: Enterprise-specific features and configurations
- **[Roadmap](docs/13_ROADMAP.md)**: Development roadmap and future plans
- **[Versioning](docs/12_VERSIONING.md)**: Version management and release strategy
- **[Backlog](docs/11_BACKLOG.md)**: Feature backlog and prioritization

### Interactive Documentation

- Swagger UI at `/api`
- OpenAPI 3.0 specification
- Request/response examples
- Authentication documentation
- Error code reference

## 📊 Quality Assurance

### Automated Testing

- **Unit Tests**: 90%+ coverage requirement
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing
- **Accessibility Tests**: WCAG compliance checking
- **Contract Tests**: API contract validation with Dredd

### Code Quality

- **ESLint**: Code linting with strict rules
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Complexity Analysis**: Cyclomatic complexity monitoring
- **Import Sorting**: Consistent import organization

### Pre-commit Hooks

- Automatic linting and formatting
- Type checking
- Unit test execution
- Security scanning
- Performance analysis

## 🔄 CI/CD Pipeline

### Quality Enforcement

- Automated testing on every commit
- Code coverage reporting
- Security vulnerability scanning
- Performance benchmarking
- Accessibility compliance checking

### Deployment Automation

- Staging deployment on merge to develop
- Production deployment on merge to main
- Automated rollback on failure
- Health check monitoring
- Performance monitoring

### Release Management

- Semantic versioning with conventional commits
- Automated changelog generation
- GitHub releases with release notes
- Dependency update automation with Renovate

## 📈 Monitoring & Observability

### Application Monitoring

- Real-time performance metrics
- Error tracking and alerting
- Request/response logging
- Database query monitoring
- Memory and CPU usage tracking

### Infrastructure Monitoring

- Container health monitoring
- Database performance metrics
- Cache hit/miss ratios
- Queue processing metrics
- Storage usage monitoring

### Logging

- Structured logging with correlation IDs
- Log aggregation with ELK Stack
- Error log analysis
- Audit trail logging
- Performance log analysis

## 🏗️ Architecture

### Clean Architecture

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External concerns (database, APIs)
- **Presentation Layer**: Controllers and DTOs

### Design Patterns

- Repository pattern for data access
- Factory pattern for service creation
- Strategy pattern for different implementations
- Observer pattern for event handling
- Decorator pattern for cross-cutting concerns

### Database Design

- Multi-tenant schema with tenant isolation
- Optimized indexes for performance
- Full-text search capabilities
- Audit trail tables
- Soft delete implementation

## 📚 API Documentation

### Interactive Documentation

- Swagger UI at `/api`
- OpenAPI 3.0 specification
- Request/response examples
- Authentication documentation
- Error code reference

### API Endpoints

- **Health Check**: `/health`
- **Users**: `/api/v1/users`
- **Recipes**: `/api/v1/recipes`
- **Ingredients**: `/api/v1/ingredients`
- **Shopping Lists**: `/api/v1/shopping-lists`

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Run quality checks: `pnpm run quality-gate`
5. Commit using conventional commits: `pnpm run commit`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Create a Pull Request

### Code Standards

- Follow TypeScript best practices
- Maintain 90%+ test coverage
- Use conventional commit messages
- Follow ESLint and Prettier configurations
- Write comprehensive documentation

### Pull Request Process

- All PRs require passing CI checks
- Code review by at least one maintainer
- Security scan must pass
- Performance benchmarks must be met
- Documentation must be updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Create an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues using the [security template](.github/ISSUE_TEMPLATE/security_vulnerability.md)

### Community

- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md)

## 🏆 Acknowledgments

- **NestJS Team**: For the excellent framework
- **TypeORM Team**: For the powerful ORM
- **Jest Team**: For the testing framework
- **ESLint Team**: For the linting tools
- **All Contributors**: For making this project better

---

**Built with ❤️ by the Hestia Development Team**

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Contributor Guide: Quality & Architecture Standards

This project enforces strict technical guidelines for code quality, maintainability, and production readiness. All contributors must follow these standards:

### Key Rules

- **Clean Architecture**: Use controllers, services, repositories, entities, DTOs, interfaces, utils, middleware, guards, interceptors, filters, and tests in their respective folders.
- **Naming**: Use kebab-case for files, PascalCase for classes/interfaces, camelCase for variables, UPPER_SNAKE_CASE for constants.
- **File/Function/Class Size**: Adhere to strict line/method/property limits (see `docs/10_TECHNICAL_GUIDELINES_AND_RESTRICTIONS.md`).
- **Documentation**: All public APIs and interfaces must be documented with JSDoc.
- **Error Handling**: Use custom error classes and structured logging.
- **Input Validation**: Validate all DTOs and inputs.
- **Testing**: ≥90% unit test coverage required. All tests must be meaningful.
- **Import Order**: Node, third-party, internal, relative. No circular or unused imports.

### Local Quality Checks

Before committing, run:

```sh
pnpm run lint
pnpm run type-check
pnpm run test:unit
```

Or simply commit—pre-commit hooks will enforce these checks.

### Full Quality Gate (CI/CD)

To run all checks locally:

```sh
pnpm run quality-gate
```

See `docs/10_TECHNICAL_GUIDELINES_AND_RESTRICTIONS.md` for full details.
