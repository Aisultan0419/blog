# Cyberpunk Blog API - Secure RESTful Blogging Platform

A production-ready, secure RESTful API for a blogging platform with Node.js, Express, MongoDB, featuring authentication, authorization, and comprehensive security controls. Built with Clean Architecture principles and a cyberpunk-themed frontend.

## 📋 Features

- ✅ **Full CRUD operations** for blog posts (Create, Read, Update, Delete)
- ✅ **User authentication** with register/login/logout
- ✅ **Role-based access control** (authenticated as admin, unauthenticated as user)
- ✅ **Ownership-based authorization** (only post author can modify)
- ✅ **Comprehensive security measures** (hashing, JWT, rate limiting, validation)
- ✅ **Docker containerization** with MongoDB
- ✅ **Cyberpunk-themed responsive frontend**
- ✅ **API documentation** with Postman collection

## 🏗️ Project Structure

```
Blog-crud/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── domain/         # Business entities & repositories
│   │   ├── application/    # Use cases & DTOs
│   │   ├── infrastructure/ # Database & security implementations
│   │   └── api/           # Controllers, routes, middleware
│   ├── server.js          # Application entry point
│   ├── package.json       # Dependencies
│   └── .env              # Environment configuration
├── frontend/              # Cyberpunk-themed UI
│   ├── index.html        # Main HTML file
│   ├── style.css         # Cyberpunk styling
│   └── script.js         # Frontend logic
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Multi-container setup
└── postman_collection.json # API documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm**
- **MongoDB** (local installation or Docker)
- **Docker** (optional, for containerized deployment)

### Method 1: Local Development

1. **Clone and setup:**
```bash
git clone https://github.com/Aisultan0419/Blog-crud
cd Blog-crud/backend
npm install
```

2. **Configure environment:**
Create `.env` file in `backend/` directory:
```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=blogging_db
JWT_SECRET=n4R7pDk8qZ1sW5xY2vB3cV7tJ0mN8fH4K928
PORT=3000
```

3. **Start MongoDB:**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

4. **Run the application:**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

5. **Access the application:**
Open `http://localhost:3000` in your browser

### Method 2: Docker Deployment

1. **Using Docker Compose (recommended):**
```bash
docker-compose up --build
```

2. **Docker only:**
```bash
# Build image
docker build -t blog-crud .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017 \
  -e DB_NAME=blogging_db \
  -e JWT_SECRET=n4R7pDk8qZ1sW5xY2vB3cV7tJ0mN8fH4K928 \
  blog-crud
```

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Blog Posts (`/blogs`)
- `GET /blogs` - Get all blog posts (public)
- `GET /blogs/:id` - Get single post by ID (public)
- `POST /blogs` - Create new post (authenticated only)
- `PUT /blogs/:id` - Update post (author only)
- `DELETE /blogs/:id` - Delete post (author only)

## 🛡️ Security Features

### 1. **Password Security**
- bcrypt hashing with salt (10 rounds)
- No plaintext password storage
- Secure password comparison

### 2. **Session Management**
- JWT tokens in HttpOnly cookies
- Secure flag for HTTPS environments
- 24-hour token expiration
- SameSite strict policy

### 3. **Access Control**
- **Unauthenticated users**: Read-only access (GET endpoints)
- **Authenticated users**: Full CRUD on own content (admin role)
- Ownership verification for update/delete operations

### 4. **Input Protection**
- Server-side validation with express-validator
- XSS prevention through output encoding
- SQL/NoSQL injection protection
- Rate limiting on auth endpoints

### 5. **Data Privacy**
- Passwords never returned in API responses
- User data sanitization before response
- Generic error messages to prevent enumeration

## 🐳 Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
services:
  mongodb:
    image: mongo:latest
    ports: ["27017:27017"]
    environment:
      MONGO_INITDB_DATABASE: blogging_db
    volumes:
      - mongodb_data:/data/db

  api:
    build: .
    ports: ["3000:3000"]
    environment:
      MONGODB_URI: mongodb://mongodb:27017
      DB_NAME: blogging_db
      JWT_SECRET: n4R7pDk8qZ1sW5xY2vB3cV7tJ0mN8fH4K928
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

## 🎨 Frontend Features

- **Cyberpunk aesthetic** with neon green color scheme
- **Responsive design** with Flexbox and media queries
- **Real-time validation** with visual feedback
- **Interactive post management** (view, edit, delete)
- **User authentication flow** with proper UI states


## 📄 License

This project is for educational purposes as part of the Web Technologies 2 (Backend) course assignment.

## 👥 Author

Aisultan0419 - Secure RESTful Blogging API implementation

