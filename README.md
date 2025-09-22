# Real-Time Multi-Camera Face Detection Dashboard

A comprehensive microservices-based solution for real-time face detection across multiple camera streams with WebRTC video delivery.

## 🏗️ Architecture

This project implements a distributed architecture with three core microservices:

### 📱 Frontend Service (`/frontend`)
- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Features**: 
  - JWT authentication with protected routes
  - Camera management dashboard (CRUD operations)
  - Real-time WebRTC video grid display
  - Live alerts via WebSocket subscriptions
  - Responsive design for desktop and mobile

### 🔧 Backend API Service (`/services/backend`)
- **Tech Stack**: TypeScript + Hono + Prisma + PostgreSQL
- **Features**:
  - JWT authentication and user management
  - RESTful APIs for camera management
  - Events/alerts API with filtering and pagination
  - WebSocket server for real-time notifications
  - Database management with Prisma ORM

### 🤖 Worker Service (`/services/worker`)
- **Tech Stack**: Golang + Gin + FFmpeg + OpenCV + go-face
- **Features**:
  - Multiple RTSP stream processing
  - Real-time face detection with bounding boxes
  - Video overlay with FPS and camera metadata
  - MediaMTX integration for WebRTC streaming
  - Automatic reconnection and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Go 1.19+ (for worker service)
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd rtc-face-detection-dashboard
npm install
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp services/backend/.env.example services/backend/.env
cp services/worker/.env.example services/worker/.env

# Update configuration values in each .env file
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run database migrations
cd services/backend
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start All Services
```bash
# Option 1: Using Docker Compose (Recommended)
docker-compose up -d

# Option 2: Individual Services
npm run dev                    # Frontend (Port 3000)
npm run backend:dev           # Backend (Port 8080)
npm run worker:dev           # Worker (Port 8081)
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Worker API**: http://localhost:8081
- **MediaMTX**: http://localhost:8889

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_WEBRTC_URL=http://localhost:8889
```

### Backend (services/backend/.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rtc_dashboard
JWT_SECRET=your-super-secret-jwt-key
WORKER_API_URL=http://localhost:8081
```

### Worker (services/worker/.env)
```env
BACKEND_API_URL=http://localhost:8080/api
MEDIAMTX_URL=http://localhost:8889
OPENCV_LOG_LEVEL=ERROR
```

## 🔧 Development Guide

### Frontend Development
```bash
cd frontend
npm run dev
```
- Hot reload enabled
- TypeScript strict mode
- Tailwind CSS for styling
- React Router for navigation

### Backend Development
```bash
cd services/backend
npm run dev
```
- Auto-restart on file changes
- Prisma client regeneration
- API documentation at `/docs`

### Worker Development
```bash
cd services/worker
go mod tidy
go run main.go
```
- Hot reload with Air (install: `go install github.com/cosmtrek/air@latest`)
- OpenCV and FFmpeg integration
- Face detection model auto-download

## 🐳 Docker Deployment

### Build All Images
```bash
docker-compose build
```

### Production Deployment
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale worker instances
docker-compose up -d --scale worker=3
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Camera Management
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Add new camera
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera
- `POST /api/cameras/:id/start` - Start camera stream
- `POST /api/cameras/:id/stop` - Stop camera stream

### Events/Alerts
- `GET /api/events` - List events (with pagination)
- `GET /api/events/:id` - Get event details
- `DELETE /api/events/:id` - Delete event

### WebSocket Events
- `camera_status` - Camera online/offline status
- `face_detected` - New face detection alert
- `stream_stats` - Real-time streaming statistics

## 🧪 Testing

### Unit Tests
```bash
# Frontend tests
npm test

# Backend tests  
cd services/backend && npm test

# Worker tests
cd services/worker && go test ./...
```

### Integration Tests
```bash
# End-to-end tests with Cypress
npm run test:e2e

# API integration tests
npm run test:api
```

## 📈 Monitoring & Logs

### Application Logs
```bash
# View all service logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f worker
```

### Performance Monitoring
- Prometheus metrics at `/metrics` endpoints
- Grafana dashboard for visualization
- Health check endpoints for all services

## 🔒 Security

### Authentication
- JWT tokens with 24-hour expiry
- Refresh token rotation
- Password hashing with bcrypt

### Video Streaming
- HTTPS-only WebRTC connections
- Stream access control per camera
- Rate limiting on API endpoints

## 📦 Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and WebSocket services
│   │   └── types/          # TypeScript type definitions
│   └── public/
├── services/
│   ├── backend/            # Hono.js API server
│   │   ├── src/
│   │   │   ├── routes/     # API route handlers
│   │   │   ├── middleware/ # Authentication & validation
│   │   │   ├── services/   # Business logic
│   │   │   └── models/     # Database models
│   │   └── prisma/         # Database schema & migrations
│   └── worker/             # Golang face detection service
│       ├── cmd/            # Application entry points
│       ├── internal/       # Internal packages
│       ├── pkg/           # Public packages
│       └── configs/       # Configuration files
├── infrastructure/
│   ├── docker/            # Dockerfiles for each service
│   ├── nginx/             # Reverse proxy configuration
│   └── mediamtx/         # MediaMTX configuration
└── docs/                  # Additional documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Docker Containers Won't Start**
```bash
# Check Docker daemon status
docker system info

# Reset Docker state
docker-compose down -v
docker-compose up -d
```

**Database Connection Issues**
```bash
# Reset database
docker-compose down postgres
docker volume rm rtc_dashboard_postgres_data
docker-compose up -d postgres
```

**Video Streaming Problems**
```bash
# Check MediaMTX status
curl http://localhost:8889/v1/config/get

# Restart streaming services
docker-compose restart worker mediamtx
```

### Getting Help

- Create an issue for bugs or feature requests
- Check the [Wiki](wiki-url) for detailed guides
- Join our [Discord](discord-url) community

---

**Built with ❤️ for real-time computer vision applications**