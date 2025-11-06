# JB SQUARE Frontend Architecture

## Overview

JB SQUARE uses a multi-frontend architecture to separate public-facing content from administrative functionality:

- **Main Frontend** (`/`) - Next.js 14 application for public users to view announcements and business content
- **Admin Frontend** (`/admin`) - SvelteKit backoffice for administrators to manage crawling and content
- **Backend API** (`/api`) - FastAPI backend serving both frontends

## Folder Structure

```
jb_square/
├── backend/                    # FastAPI backend
├── frontend-main/              # Next.js main public site (formerly jb2_wireframe-main)
├── frontend-admin/             # SvelteKit admin panel (formerly frontend)
├── nginx/                      # Reverse proxy configuration
├── docker-compose.yml          # Development environment
└── docker-compose.prod.yml     # Production environment
```

## Service Architecture

### 1. Main Frontend (frontend-main)
- **Framework**: Next.js 14
- **Purpose**: Public-facing website
- **URL**: `http://domain.com/`
- **Port**: 3100 (internal)
- **Features**:
  - Public announcement viewing
  - Business content display
  - Company information
  - Public statistics

### 2. Admin Frontend (frontend-admin)
- **Framework**: SvelteKit
- **Purpose**: Administrative backoffice
- **URL**: `http://domain.com/admin`
- **Port**: 80 (internal)
- **Base Path**: `/admin`
- **Features**:
  - Content management
  - Crawling configuration
  - Data analytics
  - System settings

### 3. Backend API
- **Framework**: FastAPI (Python)
- **URL**: `http://domain.com/api`
- **Port**: 8000 (internal)
- **Documentation**: `http://domain.com/docs`

### 4. Nginx Reverse Proxy
- **Purpose**: Route traffic to appropriate services
- **External Ports**: 80 (HTTP), 443 (HTTPS)
- **Routing Rules**:
  - `/` → frontend-main (Next.js)
  - `/admin` → frontend-admin (SvelteKit)
  - `/_app/` → frontend-admin static assets
  - `/api/` → backend
  - `/docs`, `/redoc`, `/openapi.json` → backend documentation

## Docker Configuration

### Development (docker-compose.yml)
```yaml
services:
  backend:
    ports: ["8000:8000"]
    environment:
      - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3100,http://localhost

  frontend-main:
    ports: ["3100:3100"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api

  frontend-admin:
    ports: ["3000:80"]

  nginx:
    ports: ["80:80", "443:443"]
```

### Production (docker-compose.prod.yml)
- No direct port exposure except through nginx
- Health checks for all services
- Restart policies
- Production environment variables

## Key Configuration Files

### frontend-admin/svelte.config.js
```javascript
kit: {
  adapter: adapter({...}),
  paths: {
    base: '/admin'  // Critical for subdirectory routing
  }
}
```

### nginx/conf.d/default.conf
- Defines upstream servers for load balancing
- Routes requests based on URL path
- Handles WebSocket connections
- Adds security headers

### .env Configuration
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3100,http://domain.com,http://admin.domain.com
```

## Deployment

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access services
# Main site: http://localhost
# Admin: http://localhost/admin
# API: http://localhost/api
```

### Production Deployment
```bash
# On EC2 server
cd /home/ec2-user/jb_square
bash scripts/deploy.sh
```

## Migration Notes

### From Old Structure
- `frontend/` → `frontend-admin/` (now serves at `/admin`)
- `jb2_wireframe-main/` → `frontend-main/` (now serves at `/`)
- Updated all Docker configurations
- Modified nginx routing rules
- Added base path to SvelteKit configuration

### Breaking Changes
- Admin panel moved from `/` to `/admin`
- Frontend ports changed (3000 → admin, 3100 → main)
- CORS origins must include both frontend URLs

## Troubleshooting

### Common Issues

1. **Admin panel not loading at /admin**
   - Check `svelte.config.js` has `paths.base: '/admin'`
   - Verify nginx routes `/admin` to `frontend-admin`

2. **CORS errors**
   - Ensure `.env` includes all frontend origins
   - Restart backend after changing CORS settings

3. **502 Bad Gateway**
   - Check if all containers are running: `docker-compose ps`
   - View specific service logs: `docker-compose logs [service-name]`

4. **Static assets not loading**
   - Verify nginx routes `/_app/` to frontend-admin
   - Check SvelteKit build output in frontend-admin/build

## Security Considerations

- All external traffic goes through nginx
- Internal services not directly exposed
- CORS configured for specific origins only
- Security headers added by nginx
- HTTPS should be enabled in production

## Future Enhancements

- [ ] Implement SSL/TLS certificates
- [ ] Add CDN for static assets
- [ ] Implement rate limiting
- [ ] Add monitoring and alerting
- [ ] Setup CI/CD pipeline