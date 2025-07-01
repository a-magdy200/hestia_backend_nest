# Hestia IAM System - Deployment Guide

## 📋 Document Information

| **Document Type**  | IAM System Deployment Guide                            |
| ------------------ | ------------------------------------------------------ |
| **Version**        | 1.1.0                                                  |
| **Last Updated**   | December 28, 2024                                      |
| **Next Review**    | February 28, 2025                                      |
| **Document Owner** | DevOps Team                                            |
| **Stakeholders**   | DevOps Engineers, System Administrators, Security Team |
| **Classification** | Infrastructure Deployment Guide                        |
| **Status**         | Phase 1 - 90% Complete                                |

---

## 🎯 Overview

This guide provides comprehensive instructions for deploying the Hestia IAM system in various environments, including development, staging, and production. It covers infrastructure setup, configuration, security hardening, and monitoring.

---

## 🏗️ Infrastructure Requirements

### **Minimum System Requirements**

#### **Application Server**

- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04 LTS or later

#### **Database Server**

- **CPU**: 4 cores (8 cores recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD
- **OS**: Ubuntu 20.04 LTS or later

#### **Redis Server**

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or later

### **Network Requirements**

- **Bandwidth**: 100 Mbps (1 Gbps recommended)
- **Latency**: < 50ms between services
- **SSL/TLS**: Required for all communications
- **Firewall**: Configured for required ports

---

## 🐳 Docker Deployment

### **Docker Compose Configuration**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # IAM Application
  iam-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hestia-iam-app
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/hestia_iam
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - ENCRYPTION_MASTER_KEY=${ENCRYPTION_MASTER_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    networks:
      - hestia-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: hestia-iam-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=hestia_iam
      - POSTGRES_USER=hestia_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - '5432:5432'
    networks:
      - hestia-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U hestia_user -d hestia_iam']
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: hestia-iam-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    networks:
      - hestia-network
    healthcheck:
      test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: hestia-iam-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - iam-app
    networks:
      - hestia-network

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: hestia-iam-prometheus
    restart: unless-stopped
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - hestia-network

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: hestia-iam-grafana
    restart: unless-stopped
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - hestia-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  hestia-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### **Dockerfile**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Install dependencies for building
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

---

## ☁️ Cloud Deployment

### **AWS Deployment**

#### **ECS Fargate Configuration**

```yaml
# task-definition.json
{
  'family': 'hestia-iam',
  'networkMode': 'awsvpc',
  'requiresCompatibilities': ['FARGATE'],
  'cpu': '1024',
  'memory': '2048',
  'executionRoleArn': 'arn:aws:iam::123456789012:role/ecsTaskExecutionRole',
  'taskRoleArn': 'arn:aws:iam::123456789012:role/hestia-iam-task-role',
  'containerDefinitions':
    [
      {
        'name': 'hestia-iam-app',
        'image': '123456789012.dkr.ecr.us-east-1.amazonaws.com/hestia-iam:latest',
        'portMappings': [{ 'containerPort': 3000, 'protocol': 'tcp' }],
        'environment':
          [
            { 'name': 'NODE_ENV', 'value': 'production' },
            {
              'name': 'DATABASE_URL',
              'value': 'postgresql://user:password@rds-endpoint:5432/hestia_iam',
            },
            { 'name': 'REDIS_URL', 'value': 'redis://elasticache-endpoint:6379' },
          ],
        'secrets':
          [
            {
              'name': 'JWT_ACCESS_SECRET',
              'valueFrom': 'arn:aws:secretsmanager:us-east-1:123456789012:secret:hestia/jwt-access-secret',
            },
            {
              'name': 'JWT_REFRESH_SECRET',
              'valueFrom': 'arn:aws:secretsmanager:us-east-1:123456789012:secret:hestia/jwt-refresh-secret',
            },
            {
              'name': 'ENCRYPTION_MASTER_KEY',
              'valueFrom': 'arn:aws:secretsmanager:us-east-1:123456789012:secret:hestia/encryption-master-key',
            },
          ],
        'logConfiguration':
          {
            'logDriver': 'awslogs',
            'options':
              {
                'awslogs-group': '/ecs/hestia-iam',
                'awslogs-region': 'us-east-1',
                'awslogs-stream-prefix': 'ecs',
              },
          },
        'healthCheck':
          {
            'command': ['CMD-SHELL', 'curl -f http://localhost:3000/health || exit 1'],
            'interval': 30,
            'timeout': 5,
            'retries': 3,
            'startPeriod': 60,
          },
      },
    ],
}
```

#### **RDS Database Setup**

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier hestia-iam-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username hestia_user \
  --master-user-password secure-password \
  --allocated-storage 20 \
  --storage-type gp2 \
  --storage-encrypted \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name hestia-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window 03:00-04:00 \
  --preferred-maintenance-window sun:04:00-sun:05:00 \
  --deletion-protection
```

#### **ElastiCache Redis Setup**

```bash
# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id hestia-iam-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --port 6379 \
  --vpc-security-group-ids sg-87654321 \
  --subnet-group-name hestia-cache-subnet-group \
  --transit-encryption-enabled \
  --at-rest-encryption-enabled
```

### **Google Cloud Platform Deployment**

#### **Cloud Run Configuration**

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hestia-iam
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1'
        autoscaling.knative.dev/maxScale: '10'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
        - image: gcr.io/hestia-project/iam:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              value: 'postgresql://user:password@/hestia_iam?host=/cloudsql/hestia-project:us-central1:hestia-iam-db'
            - name: REDIS_URL
              value: 'redis://10.0.0.1:6379'
          envFrom:
            - secretRef:
                name: hestia-iam-secrets
          resources:
            limits:
              cpu: '1000m'
              memory: '2Gi'
            requests:
              cpu: '500m'
              memory: '1Gi'
```

---

## 🔧 Configuration Management

### **Environment Configuration**

#### **Production Environment Variables**

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/hestia_iam
DATABASE_SSL=true
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=secure-redis-password
REDIS_SSL=true

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=hestia-platform
JWT_AUDIENCE=hestia-users

# Encryption Configuration
ENCRYPTION_MASTER_KEY=your-32-byte-master-key
PASSWORD_PEPPER=your-password-pepper-key

# Session Configuration
SESSION_SECRET=your-session-secret-min-32-chars
SESSION_TIMEOUT=1800000
SESSION_MAX_CONCURRENT=5
SESSION_SECURE_COOKIES=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# MFA Configuration
MFA_TOTP_ALGORITHM=sha1
MFA_TOTP_DIGITS=6
MFA_TOTP_PERIOD=30
MFA_SMS_RATE_LIMIT=3
MFA_SMS_COOLDOWN=1800

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://hestia.com/api/v1/auth/oauth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=https://hestia.com/api/v1/auth/oauth/microsoft/callback

# SAML Configuration
SAML_ENTRY_POINT=https://your-idp.com/sso
SAML_ISSUER=hestia-platform
SAML_CERT=your-saml-certificate
SAML_CALLBACK_URL=https://hestia.com/api/v1/auth/saml/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@hestia.com

# File Storage Configuration
STORAGE_PROVIDER=aws-s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=hestia-uploads
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Monitoring Configuration
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_ENABLED=true
GRAFANA_PORT=3001

# Security Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=https://hestia.com,https://app.hestia.com
SECURITY_HEADERS_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true

# Audit Configuration
AUDIT_LOG_RETENTION_DAYS=2555
AUDIT_LOG_ENCRYPTION=true
SIEM_ENDPOINT=https://your-siem.com/api/events
```

### **Configuration Validation**

```typescript
// config/validation.ts
import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  ENCRYPTION_MASTER_KEY: string;

  @IsBoolean()
  DATABASE_SSL: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

---

## 🔒 Security Hardening

### **SSL/TLS Configuration**

#### **Nginx SSL Configuration**

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name hestia.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name hestia.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/hestia.crt;
        ssl_certificate_key /etc/nginx/ssl/hestia.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://iam-app:3000;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://iam-app:3000;
        }

        # Proxy configuration
        location / {
            proxy_pass http://iam-app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
    }
}
```

### **Firewall Configuration**

#### **UFW Firewall Rules**

```bash
#!/bin/bash
# firewall-setup.sh

# Reset firewall
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# SSH access
ufw allow 22/tcp

# HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Application ports
ufw allow 3000/tcp

# Database (restrict to internal network)
ufw allow from 10.0.0.0/8 to any port 5432
ufw allow from 172.16.0.0/12 to any port 5432
ufw allow from 192.168.0.0/16 to any port 5432

# Redis (restrict to internal network)
ufw allow from 10.0.0.0/8 to any port 6379
ufw allow from 172.16.0.0/12 to any port 6379
ufw allow from 192.168.0.0/16 to any port 6379

# Monitoring ports (restrict to internal network)
ufw allow from 10.0.0.0/8 to any port 9090
ufw allow from 172.16.0.0/12 to any port 9090
ufw allow from 192.168.0.0/16 to any port 9090

# Enable firewall
ufw --force enable
```

---

## 📊 Monitoring & Observability

### **Prometheus Configuration**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alert_rules.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  - job_name: 'hestia-iam'
    static_configs:
      - targets: ['iam-app:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
```

### **Grafana Dashboard**

```json
// monitoring/grafana/dashboards/iam-dashboard.json
{
  "dashboard": {
    "title": "Hestia IAM Dashboard",
    "panels": [
      {
        "title": "Authentication Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(hestia_auth_requests_total[5m])",
            "legendFormat": "{{method}}"
          }
        ]
      },
      {
        "title": "Active Sessions",
        "type": "stat",
        "targets": [
          {
            "expr": "hestia_active_sessions",
            "legendFormat": "Active Sessions"
          }
        ]
      },
      {
        "title": "Failed Login Attempts",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(hestia_failed_logins_total[5m])",
            "legendFormat": "Failed Logins"
          }
        ]
      }
    ]
  }
}
```

### **Health Check Endpoint**

```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async checkHealth(): Promise<HealthStatus> {
    const checks = {
      application: await this.healthService.checkApplication(),
      database: await this.databaseService.checkConnection(),
      redis: await this.redisService.checkConnection(),
      disk: await this.healthService.checkDiskSpace(),
      memory: await this.healthService.checkMemoryUsage(),
    };

    const isHealthy = Object.values(checks).every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('ready')
  async checkReadiness(): Promise<HealthStatus> {
    // Check if application is ready to serve requests
    const checks = {
      database: await this.databaseService.checkConnection(),
      redis: await this.redisService.checkConnection(),
    };

    const isReady = Object.values(checks).every(check => check.status === 'healthy');

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
```

---

## 🚀 Deployment Scripts

### **Automated Deployment Script**

```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
DOCKER_REGISTRY="your-registry.com"
IMAGE_NAME="hestia-iam"

echo "Deploying Hestia IAM System..."
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"

# Load environment variables
source .env.$ENVIRONMENT

# Build and push Docker image
echo "Building Docker image..."
docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$VERSION .
docker push $DOCKER_REGISTRY/$IMAGE_NAME:$VERSION

# Update deployment
echo "Updating deployment..."
kubectl set image deployment/hestia-iam hestia-iam=$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION

# Wait for rollout
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/hestia-iam

# Run health checks
echo "Running health checks..."
for i in {1..30}; do
  if curl -f http://hestia.com/health > /dev/null 2>&1; then
    echo "Health check passed!"
    break
  fi
  echo "Health check failed, retrying in 10 seconds..."
  sleep 10
done

# Run smoke tests
echo "Running smoke tests..."
npm run test:smoke

echo "Deployment completed successfully!"
```

### **Database Migration Script**

```bash
#!/bin/bash
# migrate.sh

set -e

echo "Running database migrations..."

# Run migrations
npm run db:migrate

# Verify migration status
npm run db:migrate:status

echo "Database migrations completed successfully!"
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions**

#### **Database Connection Issues**

```bash
# Check database connectivity
psql -h localhost -U hestia_user -d hestia_iam -c "SELECT 1;"

# Check database logs
docker logs hestia-iam-postgres

# Restart database service
docker-compose restart postgres
```

#### **Redis Connection Issues**

```bash
# Check Redis connectivity
redis-cli -h localhost -p 6379 ping

# Check Redis logs
docker logs hestia-iam-redis

# Restart Redis service
docker-compose restart redis
```

#### **Application Issues**

```bash
# Check application logs
docker logs hestia-iam-app

# Check application health
curl -f http://localhost:3000/health

# Restart application
docker-compose restart iam-app
```

### **Log Analysis**

```bash
# View real-time logs
docker-compose logs -f iam-app

# Search for errors
docker-compose logs iam-app | grep ERROR

# Check specific time range
docker-compose logs --since="2024-12-28T10:00:00" iam-app
```

---

## 📚 Additional Resources

### **Documentation**

- [IAM System Overview](docs/14_IAM_SYSTEM_AND_PROFILE_MANAGEMENT.md)
- [API Reference](docs/17_IAM_API_REFERENCE.md)
- [Security Best Practices](docs/16_IAM_SECURITY_BEST_PRACTICES.md)

### **Tools**

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

### **Support**

- [Deployment Issues](https://github.com/hestia/iam-system/issues)
- [Community Forum](https://community.hestia.com)
- [Support Email](support@hestia.com)

---

_This deployment guide is part of the Hestia Enterprise SaaS Platform documentation suite. For questions or support, please refer to the resources above or create an issue in the GitHub repository._
