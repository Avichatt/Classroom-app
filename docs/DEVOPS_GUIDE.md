# 🚀 DevOps Guide — Google Classroom Clone

## Overview

This guide covers the complete **infrastructure, CI/CD pipeline, deployment strategy, monitoring, and scaling** needed to run the Classroom Clone in production.

---

## 🏗️ Infrastructure Architecture

```
                    ┌─────────────┐
                    │   Cloudflare │
                    │   DNS + CDN  │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼─────────┐    ┌─────────▼─────────┐
    │   Frontend (CDN)   │    │   API Gateway      │
    │   Vercel / S3+CF   │    │   (AWS ALB / Nginx) │
    │   Static React SPA │    │                     │
    └───────────────────┘    └─────────┬───────────┘
                                       │
                            ┌──────────┴──────────┐
                            │                     │
                   ┌────────▼────────┐   ┌────────▼────────┐
                   │  API Server 1   │   │  API Server 2   │
                   │  (ECS / K8s)    │   │  (ECS / K8s)    │
                   └────────┬────────┘   └────────┬────────┘
                            │                     │
              ┌─────────────┼─────────────────────┘
              │             │
    ┌─────────▼───┐  ┌──────▼──────┐  ┌──────────┐
    │ PostgreSQL   │  │   Redis     │  │  AWS S3   │
    │ (RDS)        │  │ (ElastiCache)│  │ (Files)   │
    └─────────────┘  └─────────────┘  └──────────┘
```

---

## 🐳 Docker Configuration

### Backend Dockerfile

```dockerfile
# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
USER appuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (for SPA routing)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### docker-compose.yml (Full Stack Local)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - api

  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://classroom:secret@postgres:5432/classroom_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: classroom_db
      POSTGRES_USER: classroom
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U classroom"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Optional: PgAdmin for DB management
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@classroom.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  pgdata:
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ──── LINT & TYPE CHECK ────
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  # ──── UNIT TESTS ────
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          JWT_SECRET: test-secret

  # ──── BUILD FRONTEND ────
  build-frontend:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: dist/

  # ──── BUILD & PUSH DOCKER (Backend) ────
  build-backend:
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./server
          push: true
          tags: ghcr.io/${{ github.repository }}/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ──── DEPLOY ────
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-frontend, build-backend]
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Deploy Frontend to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Backend to AWS ECS
        run: |
          aws ecs update-service \
            --cluster classroom-staging \
            --service api \
            --force-new-deployment
```

---

## ☁️ AWS Deployment (Production)

### Option A: AWS ECS (Fargate) — Recommended

```
Frontend:  S3 + CloudFront (static SPA)
Backend:   ECS Fargate (containerized API)
Database:  RDS PostgreSQL (Multi-AZ)
Cache:     ElastiCache Redis
Storage:   S3 (file uploads)
Secrets:   AWS Secrets Manager
DNS:       Route53
SSL:       ACM (free certs)
Logs:      CloudWatch
```

### Terraform Skeleton (infrastructure as code)

```hcl
# main.tf

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  name    = "classroom-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
}

# RDS PostgreSQL
resource "aws_db_instance" "classroom" {
  identifier           = "classroom-db"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.medium"
  allocated_storage    = 50
  db_name              = "classroom_db"
  username             = "classroom_admin"
  password             = var.db_password
  skip_final_snapshot  = false
  multi_az             = true
  backup_retention_period = 7
  vpc_security_group_ids  = [aws_security_group.db.id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "classroom" {
  cluster_id           = "classroom-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
}

# S3 Bucket for uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "classroom-uploads-prod"
}

# S3 Bucket for frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "classroom-frontend-prod"
  website { index_document = "index.html" error_document = "index.html" }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"
  }
  enabled             = true
  default_root_object = "index.html"
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-frontend"
    forwarded_values { query_string = false; cookies { forward = "none" } }
    viewer_protocol_policy = "redirect-to-https"
  }
  # SPA fallback
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}
```

### Option B: Vercel + Railway (Simpler)

```
Frontend:  Vercel (zero-config React deploy)
Backend:   Railway (Dockerfile deploy)
Database:  Railway PostgreSQL
Cache:     Upstash Redis (serverless)
Storage:   Cloudflare R2 (S3-compatible, cheaper)
```

Deploy commands:
```bash
# Frontend → Vercel
npx vercel --prod

# Backend → Railway
railway up
```

### Option C: DigitalOcean (Budget)

```
Frontend:  DO App Platform (static site)
Backend:   DO App Platform (Docker)
Database:  DO Managed PostgreSQL ($15/mo)
Cache:     DO Managed Redis ($15/mo)
Storage:   DO Spaces (S3-compatible)
```

---

## 📊 Monitoring & Observability

### Application Monitoring

```yaml
# docker-compose additions for monitoring
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana
    ports: ["3002:3000"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
```

### Key Metrics to Track

| Category | Metric | Alert Threshold |
|----------|--------|-----------------|
| **API** | Response time p95 | > 500ms |
| **API** | Error rate (5xx) | > 1% |
| **API** | Request rate | > 1000 rps |
| **DB** | Connection pool usage | > 80% |
| **DB** | Query time p95 | > 100ms |
| **Redis** | Memory usage | > 80% |
| **S3** | Upload failures | > 0.5% |
| **Auth** | Failed login rate | > 10/min per IP |
| **System** | CPU usage | > 80% |
| **System** | Memory usage | > 85% |

### Health Check Endpoint

```typescript
// GET /health
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDB(),
      redis: await checkRedis(),
      s3: await checkS3(),
    },
  };
  const isHealthy = Object.values(health.checks).every(Boolean);
  res.status(isHealthy ? 200 : 503).json(health);
});
```

---

## 🔒 Security Checklist

| # | Item | Status |
|---|------|--------|
| 1 | HTTPS everywhere (TLS 1.3) | ⬜ |
| 2 | JWT with short expiry (15min) + refresh tokens | ⬜ |
| 3 | Password hashing with bcrypt (cost factor 12) | ⬜ |
| 4 | Rate limiting (express-rate-limit) | ⬜ |
| 5 | CORS restricted to frontend domain only | ⬜ |
| 6 | Helmet.js for security headers | ⬜ |
| 7 | Input validation (Zod) on all endpoints | ⬜ |
| 8 | SQL injection prevention (parameterized queries via ORM) | ⬜ |
| 9 | XSS prevention (CSP headers + sanitization) | ⬜ |
| 10 | File upload validation (type + size + virus scan) | ⬜ |
| 11 | Secrets in environment variables (never in code) | ⬜ |
| 12 | Dependency scanning (npm audit, Snyk) | ⬜ |
| 13 | Database backups (automated daily, 7-day retention) | ⬜ |
| 14 | Audit logging for all admin actions | ⬜ |
| 15 | Brute force protection (account lockout after N failures) | ⬜ |

---

## 📈 Scaling Strategy

### Horizontal Scaling

```
Phase 1 (0-500 users):    1 API instance, 1 DB, no Redis
Phase 2 (500-5000 users): 2 API instances, 1 DB, Redis cache
Phase 3 (5000-50000):     4+ API instances, RDS Multi-AZ, ElastiCache
Phase 4 (50000+):         Kubernetes, read replicas, CDN, queue workers
```

### Cost Estimates (AWS)

| Resource | Size | Monthly Cost |
|----------|------|-------------|
| ECS Fargate (2 tasks) | 0.5 vCPU, 1GB | ~$30 |
| RDS PostgreSQL | db.t3.medium | ~$65 |
| ElastiCache Redis | cache.t3.micro | ~$15 |
| S3 (100GB) | Standard | ~$3 |
| CloudFront | 100GB transfer | ~$10 |
| Route53 | 1 hosted zone | ~$1 |
| **Total** | | **~$124/mo** |

---

## 📦 Backup Strategy

```
Daily:   Automated incremental backup (RDS snapshots)
Weekly:  Full database dump + S3 sync
Monthly: Cross-region backup replication
```

Script for manual backup:
```bash
#!/bin/bash
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://classroom-backups/$(date +%Y/%m)/
```
