# 🚀 Blogging Platform API

A production-structured, Dockerized RESTful API for a personal blogging platform built with **Node.js**, **Express**, and **MongoDB**.

> This project demonstrates REST API best practices, clean architecture, Docker & Docker Compose usage, environment-based configuration, pagination & search, centralized error handling, and production-ready project structure.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [API Examples](#-api-examples)
- [Error Handling](#-error-handling-strategy)
- [Scalability Considerations](#-scalability-considerations)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)
- [License](#-license)

---

## 📖 Overview

**Blogging Platform API** is a backend service that allows users to:

- ✍️ Create blog posts
- 📖 Retrieve blog posts (single & list)
- ✏️ Update blog posts (full & partial)
- 🗑️ Delete blog posts (soft delete)
- 🔍 Search blog posts
- 📄 Paginate results

This project is built to simulate real-world backend service architecture used in production systems.

---

## ✨ Features

- RESTful API design
- Versioned routes (`/api/v1`)
- Full CRUD operations
- Pagination support
- Text-based search (title & content)
- Centralized error handling
- Soft delete implementation
- Input validation middleware
- Dockerized backend service
- MongoDB containerized with persistent storage
- Environment-based configuration
- Graceful server shutdown

---

## 🛠 Tech Stack

| Layer           | Technology       |
| --------------- | ---------------- |
| **Runtime**     | Node.js (LTS)   |
| **Framework**   | Express.js       |
| **Database**    | MongoDB          |
| **ODM**         | Mongoose         |
| **Container**   | Docker           |
| **Orchestration** | Docker Compose |

---

## 🏗 Architecture

```
Client (Postman / Frontend)
         ↓
Express API (Docker Container)
         ↓
MongoDB (Docker Container)
```

### Design Pattern

```
Controller → Service → Model
```

| Layer          | Responsibility                        |
| -------------- | ------------------------------------- |
| **Controller** | Handles HTTP request/response         |
| **Service**    | Business logic & database operations  |
| **Model**      | Schema definition & data validation   |
| **Middleware**  | Error handling & input validation     |

---

## 📡 API Endpoints

**Base URL:** `/api/v1/posts`

### 1️⃣ Create Post

```
POST /api/v1/posts
```

**Request Body:**

```json
{
  "title": "My First Blog",
  "content": "This is blog content",
  "author": "Anshul Kumar",
  "tags": ["nodejs", "docker"]
}
```

**Response:** `201 Created` · `400 Bad Request`

---

### 2️⃣ Get All Posts

```
GET /api/v1/posts
```

| Parameter | Description                |
| --------- | -------------------------- |
| `search`  | Search by title/content    |
| `page`    | Page number (default: `1`) |
| `limit`   | Items per page (default: `10`, max: `100`) |

**Example:**

```
GET /api/v1/posts?search=node&page=1&limit=10
```

**Response:** `200 OK`

---

### 3️⃣ Get Single Post

```
GET /api/v1/posts/:id
```

**Response:** `200 OK` · `404 Not Found`

---

### 4️⃣ Update Post (Full)

```
PUT /api/v1/posts/:id
```

**Response:** `200 OK` · `404 Not Found`

---

### 5️⃣ Partial Update

```
PATCH /api/v1/posts/:id
```

**Response:** `200 OK` · `404 Not Found`

---

### 6️⃣ Delete Post

```
DELETE /api/v1/posts/:id
```

> Implements **soft delete** — sets `isDeleted: true`

**Response:** `204 No Content` · `404 Not Found`

---

## 📁 Project Structure

```
blogging-platform-api/
│
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── post.controller.js     # Request handlers
│   ├── services/
│   │   └── post.service.js        # Business logic
│   ├── models/
│   │   └── post.model.js          # Mongoose schema
│   ├── routes/
│   │   └── post.routes.js         # Route definitions
│   ├── middlewares/
│   │   ├── error.middleware.js     # Centralized error handler
│   │   └── validate.middleware.js  # Input validation
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   └── logger.js              # Winston logger
│   └── app.js                     # Express app setup
│
├── server.js                      # Entry point
├── Dockerfile                     # Docker build
├── docker-compose.yml             # Service orchestration
├── .env                           # Environment variables
├── .dockerignore                  # Docker exclusions
└── package.json                   # Dependencies & scripts
```

---

## 🚀 Getting Started (Without Docker)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/anshul4117/docker_blog_api.git
cd docker_blog_api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/blogging-platform
NODE_ENV=development
LOG_LEVEL=info
```

### 4️⃣ Start Server

```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

## 🐳 Docker Setup (Recommended)

This project is fully containerized.

### 1️⃣ Build & Start Containers

```bash
docker-compose up --build
```

**Services:**

| Service     | Description         |
| ----------- | ------------------- |
| `backend`   | Node.js API         |
| `mongodb`   | MongoDB database    |

### 2️⃣ Access Application

```
http://localhost:3000
```

### 3️⃣ Stop Containers

```bash
docker-compose down
```

### 4️⃣ Remove Volumes (Full Reset)

```bash
docker-compose down -v
```

---

## 🔐 Environment Variables

| Variable     | Description                | Default                                         |
| ------------ | -------------------------- | ----------------------------------------------- |
| `PORT`       | Server port                | `3000`                                          |
| `MONGO_URI`  | MongoDB connection string  | `mongodb://mongodb:27017/blogging-platform`     |
| `NODE_ENV`   | Environment mode           | `development`                                   |
| `LOG_LEVEL`  | Logging verbosity          | `info`                                          |

> **Note:** `mongodb` in the connection string is the Docker service name used for internal container networking. When running locally (without Docker), use `localhost` instead.

---

## 📝 API Examples

### Create a Post

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learning Docker",
    "content": "Docker is a platform for containerizing applications...",
    "author": "Anshul Kumar",
    "tags": ["docker", "devops"]
  }'
```

### Search Posts

```bash
curl "http://localhost:3000/api/v1/posts?search=docker&page=1&limit=5"
```

### Update a Post

```bash
curl -X PATCH http://localhost:3000/api/v1/posts/<post_id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Delete a Post

```bash
curl -X DELETE http://localhost:3000/api/v1/posts/<post_id>
```

---

## ⚠ Error Handling Strategy

- Centralized error middleware
- Custom `ApiError` class with HTTP status codes
- Mongoose error mapping (ValidationError, CastError, duplicate key)
- Proper HTTP status codes (`400`, `404`, `500`)
- **No stack trace exposure in production**

---

## 📈 Scalability Considerations

This project is structured for easy extension:

- 🔐 Add authentication (JWT)
- ⚡ Add Redis caching
- 🛡️ Add rate limiting
- 📊 Add request logging
- 📚 Add Swagger documentation
- 🧪 Add unit & integration testing
- 🔄 Add CI/CD pipeline
- ☸️ Deploy via Kubernetes

---

## 🧠 Learning Outcomes

This project helps you understand:

- RESTful conventions & API versioning
- HTTP status codes & error handling
- Service layer abstraction
- MongoDB indexing & text search
- Docker networking & containerization
- Production mindset for backend services
- Graceful shutdown patterns

---

## 📌 Version

`v1.0.0`

---

## 👨‍💻 Author

**Anshul Kumar**
Backend Developer (MERN Stack)
MCA Student | Pilkhua, India

> Passionate about scalable system design, production-ready backend services, and continuous learning.

- GitHub: [@anshul4117](https://github.com/anshul4117)

---

## 📄 License

This project is licensed for **educational and portfolio purposes**.
