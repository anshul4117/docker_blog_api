# 🐳 Docker Complete Guide — From Zero to Deployment

> **Context:** This guide uses YOUR Blogging Platform API as the example throughout.
> **Prerequisite:** Docker Desktop installed and running on macOS.

---

## 📖 Part 1: Core Concepts

### What is Docker?

Think of Docker like a **shipping container** for your app:

```
Without Docker:
  Your app needs → Node.js v20 + MongoDB v7 + specific npm packages
  Problem: Every machine is different → things break

With Docker:
  Your app + ALL its dependencies → packed into one container
  Result: Runs EXACTLY the same everywhere ✅
```

### Key Terms

| Term | What it is | Real-Life Analogy |
|------|-----------|-------------------|
| **Image** | A blueprint/recipe for your app | A Class in JavaScript |
| **Container** | A running instance of an image | An Object created from that Class |
| **Dockerfile** | Instructions to build an image | The constructor function |
| **Docker Compose** | Runs multiple containers together | Running your API + MongoDB together |
| **Volume** | Persistent storage for containers | A hard drive that survives restarts |
| **Network** | Communication channel between containers | A private LAN between services |

### Image vs Container

```
Image (Blueprint)              Container (Running Instance)
┌──────────────────┐          ┌──────────────────┐
│  Node.js 20      │  ──────► │  Node.js 20      │  ← Actually running
│  Your Code       │  build   │  Your Code       │
│  Dependencies    │          │  Dependencies    │
│  Config          │          │  Config          │
└──────────────────┘          └──────────────────┘
                              ┌──────────────────┐
                     ──────►  │  Same image but  │  ← You can run
                              │  another copy!   │     multiple containers
                              └──────────────────┘
```

---

## 🔨 Part 2: Building Images

### Your Dockerfile Explained (Line by Line)

```dockerfile
# 1. Start from official Node.js image (Alpine = lightweight Linux)
FROM node:20-alpine

# 2. Create /app folder inside the container and cd into it
WORKDIR /app

# 3. Copy package.json first (Docker caches this layer)
COPY package*.json ./

# 4. Install dependencies inside the container
RUN npm ci --only=production

# 5. Copy your source code into the container
COPY . .

# 6. Switch to non-root user (security best practice)
USER node

# 7. Tell Docker this container uses port 3000
EXPOSE 3000

# 8. Health check — Docker pings this endpoint to verify app is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 9. Command to run when container starts
CMD ["node", "server.js"]
```

### Build Commands

```bash
# Build an image from your Dockerfile
docker build -t blog-api .
#             │            │
#             │            └── "." means use current directory
#             └── "-t blog-api" names the image "blog-api"

# Build with a specific tag/version
docker build -t blog-api:v1.0 .

# List all images on your machine
docker images

# Remove an image
docker rmi blog-api
```

### What happens during `docker build`?

```
Step 1/9: FROM node:20-alpine
  → Downloads Node.js base image (only first time, then cached)

Step 2/9: WORKDIR /app
  → Creates /app directory inside image

Step 3/9: COPY package*.json ./
  → Copies package.json into image

Step 4/9: RUN npm ci --only=production
  → Installs your npm packages INSIDE the image

Step 5/9: COPY . .
  → Copies your source code

... and so on
```

> **Why copy package.json BEFORE the source code?**
> Docker caches each step. If your code changes but package.json doesn't,
> Docker skips the `npm ci` step (saves time on rebuilds!).

---

## 🚀 Part 3: Running Containers

### Basic Run Commands

```bash
# Run a container from an image
docker run blog-api
#          └── image name

# Run in DETACHED mode (background)
docker run -d blog-api
#          └── "-d" = detached, runs in background

# Run with PORT MAPPING
docker run -d -p 3000:3000 blog-api
#              │     │
#              │     └── container's internal port
#              └── your Mac's port
# Now accessible at: http://localhost:3000

# Run with a CUSTOM NAME
docker run -d -p 3000:3000 --name my-api blog-api
#                           └── gives container a name

# Run with ENVIRONMENT VARIABLES
docker run -d -p 3000:3000 \
  -e PORT=3000 \
  -e MONGO_URI=mongodb://localhost:27017/blog \
  -e NODE_ENV=development \
  blog-api
```

### Port Mapping Explained

```
Your Mac                          Docker Container
┌─────────────┐                  ┌─────────────┐
│             │   -p 3000:3000   │             │
│  port 3000  │ ◄──────────────► │  port 3000  │
│             │                  │  (Express)   │
└─────────────┘                  └─────────────┘

Browser → localhost:3000 → forwards to → container:3000
```

---

## 🔍 Part 4: Managing Containers

### Check Status

```bash
# Show RUNNING containers
docker ps

# Show ALL containers (running + stopped)
docker ps -a

# Output explained:
# CONTAINER ID   IMAGE       STATUS          PORTS                    NAMES
# cb11ee31cb0f   blog-api    Up 5 minutes    0.0.0.0:3000->3000/tcp   my-api    ← Running ✅
# a1b2c3d4e5f6   blog-api    Exited (0)      -                        old-api   ← Stopped 🔴
# f6e5d4c3b2a1   blog-api    Exited (1)      -                        crash-api ← Crashed ❌
```

### Start / Stop / Restart

```bash
# Stop a running container
docker stop my-api        # by name
docker stop cb11ee31cb0f  # by ID (first 12 chars enough)

# Start a stopped container
docker start my-api

# Restart a container
docker restart my-api

# Force kill (if stop doesn't work)
docker kill my-api
```

### View Logs

```bash
# View all logs
docker logs my-api

# Stream logs in real-time (like tail -f)
docker logs -f my-api

# Show last 50 lines
docker logs --tail 50 my-api
```

### Go Inside a Container

```bash
# Open a shell inside running container
docker exec -it my-api sh
#            │
#            └── "-it" = interactive terminal

# Once inside, you can:
ls              # see files
cat server.js   # view code
node -v         # check node version
exit            # leave the container
```

### Remove Containers

```bash
# Remove a stopped container
docker rm my-api

# Force remove a running container
docker rm -f my-api

# Remove ALL stopped containers
docker container prune
```

---

## 🎼 Part 5: Docker Compose (Multiple Containers)

### Why Docker Compose?

Your project needs TWO containers running together:

```
┌─────────────────┐        ┌─────────────────┐
│   blog-api      │ ────►  │   blog-mongodb   │
│   (Node.js)     │        │   (MongoDB)      │
│   Port 3000     │        │   Port 27017     │
└─────────────────┘        └─────────────────┘
       └──────────── app-network ────────────┘
```

Running them manually would be:
```bash
# Without Compose (painful):
docker network create app-network
docker run -d --name blog-mongodb --network app-network mongo:7
docker run -d --name blog-api --network app-network -p 3000:3000 \
  -e MONGO_URI=mongodb://mongodb:27017/blogging-platform blog-api
```

With Compose → **one file, one command**.

### Your docker-compose.yml Explained

```yaml
version: '3.8'

services:
  # --- Service 1: Your API ---
  backend:
    build:                          # Build image from Dockerfile
      context: .
      dockerfile: Dockerfile
    container_name: blog-api        # Name the container
    restart: unless-stopped         # Auto-restart if it crashes
    ports:
      - '3000:3000'                 # Mac:Container port mapping
    environment:                    # Env vars passed to container
      - NODE_ENV=development
      - PORT=3000
      - MONGO_URI=mongodb://mongodb:27017/blogging-platform
      #                   ^^^^^^^ ← Docker service name, NOT localhost!
    depends_on:
      - mongodb                     # Start MongoDB BEFORE this
    networks:
      - app-network                 # Connect to shared network

  # --- Service 2: MongoDB ---
  mongodb:
    image: mongo:7                  # Use official MongoDB image
    container_name: blog-mongodb
    restart: unless-stopped
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db         # Persist data to named volume
    networks:
      - app-network

volumes:
  mongo-data:                       # Named volume definition
    driver: local

networks:
  app-network:                      # Network definition
    driver: bridge
```

### Docker Compose Commands

```bash
# ┌─────────────────────────────────────────────────────────┐
# │                  MOST USED COMMANDS                      │
# └─────────────────────────────────────────────────────────┘

# Build images + Start all containers
docker-compose up --build

# Same but in background (detached)
docker-compose up --build -d

# Stop all containers
docker-compose down

# Stop + delete database volume (FULL RESET)
docker-compose down -v

# ┌─────────────────────────────────────────────────────────┐
# │                  MONITORING COMMANDS                     │
# └─────────────────────────────────────────────────────────┘

# View logs of all services
docker-compose logs

# Stream logs of specific service
docker-compose logs -f backend
docker-compose logs -f mongodb

# Check status of compose services
docker-compose ps

# ┌─────────────────────────────────────────────────────────┐
# │                  INDIVIDUAL SERVICE                      │
# └─────────────────────────────────────────────────────────┘

# Restart only backend
docker-compose restart backend

# Rebuild only backend (after code change)
docker-compose up --build -d backend

# Shell into backend container
docker exec -it blog-api sh

# Shell into MongoDB
docker exec -it blog-mongodb mongosh
```

### How Containers Talk to Each Other

```
WRONG:  MONGO_URI=mongodb://localhost:27017/blog     ← localhost = YOUR Mac
RIGHT:  MONGO_URI=mongodb://mongodb:27017/blog       ← mongodb = Docker service name

Docker creates internal DNS:
  "mongodb" → resolves to → 172.18.0.2 (container IP)
  "backend" → resolves to → 172.18.0.3 (container IP)
```

---

## 💾 Part 6: Volumes (Data Persistence)

### The Problem

```
Without Volume:
  docker-compose down → MongoDB container removed → ALL DATA GONE 💀

With Volume:
  docker-compose down → Container removed → Data saved in volume ✅
  docker-compose up   → New container → Reconnects to saved data
```

### How It Works

```yaml
# In docker-compose.yml:
volumes:
  - mongo-data:/data/db
#   ^^^^^^^^^^  ^^^^^^^^^
#   Volume name   Path inside container where MongoDB stores data
```

### Volume Commands

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect docker_mongo-data

# Remove a specific volume (DELETES DATA!)
docker volume rm docker_mongo-data

# Remove all unused volumes
docker volume prune
```

---

## 🧹 Part 7: Cleanup Commands

```bash
# ┌─────────────────────────────────────────────────────────┐
# │              CLEAN UP DOCKER RESOURCES                   │
# └─────────────────────────────────────────────────────────┘

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (⚠️ deletes data!)
docker volume prune

# NUCLEAR OPTION: Remove EVERYTHING unused
docker system prune -a
# This removes: stopped containers, unused networks,
#               unused images, build cache

# Check disk usage
docker system df
```

---

## 🌐 Part 8: Deploying to Production

### Option 1: Deploy to Railway (Easiest)

```bash
# 1. Go to railway.app → Sign up with GitHub
# 2. New Project → Deploy from GitHub Repo
# 3. Select "anshul4117/docker_blog_api"
# 4. Railway auto-detects Dockerfile
# 5. Add environment variables:
#    PORT=3000
#    MONGO_URI=<your MongoDB Atlas connection string>
#    NODE_ENV=production
# 6. Deploy! → Get a public URL
```

### Option 2: Deploy to Render

```bash
# 1. Go to render.com → Sign up with GitHub
# 2. New → Web Service → Connect repo
# 3. Select "Docker" as environment
# 4. Add environment variables
# 5. Deploy!
```

### Option 3: Deploy to a VPS (AWS EC2 / DigitalOcean)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Install Docker Compose
sudo apt install docker-compose -y

# 4. Clone your repo
git clone https://github.com/anshul4117/docker_blog_api.git
cd docker_blog_api

# 5. Create .env file
cp .env.example .env
nano .env  # edit with your production values

# 6. Run!
docker-compose up --build -d

# 7. Your API is live at:
# http://your-server-ip:3000
```

### Production Checklist

| # | Task | Why |
|---|------|-----|
| 1 | Use MongoDB Atlas (cloud DB) | Better than self-hosting MongoDB |
| 2 | Set `NODE_ENV=production` | Hides stack traces in errors |
| 3 | Use HTTPS (SSL certificate) | Security requirement |
| 4 | Add rate limiting | Prevent API abuse |
| 5 | Set up CI/CD (GitHub Actions) | Auto-deploy on git push |

---

## 📋 Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│              DOCKER CHEAT SHEET                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  BUILD:    docker build -t blog-api .                │
│  RUN:      docker run -d -p 3000:3000 blog-api       │
│  STOP:     docker stop blog-api                      │
│  START:    docker start blog-api                     │
│  LOGS:     docker logs -f blog-api                   │
│  SHELL:    docker exec -it blog-api sh               │
│  REMOVE:   docker rm blog-api                        │
│  IMAGES:   docker images                             │
│  STATUS:   docker ps -a                              │
│                                                      │
│  COMPOSE UP:     docker-compose up --build -d        │
│  COMPOSE DOWN:   docker-compose down                 │
│  COMPOSE LOGS:   docker-compose logs -f              │
│  COMPOSE RESET:  docker-compose down -v              │
│                                                      │
│  CLEANUP:        docker system prune -a              │
│                                                      │
└─────────────────────────────────────────────────────┘
```
