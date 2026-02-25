# 🧪 Docker Hands-On Lab — Practice Guide

> **Project:** Blogging Platform API
> **Goal:** Learn Docker by doing — follow each exercise in order.
> **Time:** ~45 minutes

---

## Pre-Check

Before starting, verify Docker is running:

```bash
docker --version
docker-compose --version
```

Make sure you're in the project directory:

```bash
cd /Users/anshul/Projects/Docker
```

---

## Lab 1: Build Your First Image

**Concept:** A Dockerfile is a recipe. `docker build` bakes it into an image.

### Exercise 1.1 — Build the image

```bash
docker build -t blog-api:v1 .
```

### Exercise 1.2 — Verify image was created

```bash
docker images
```

**Expected output:**

```
REPOSITORY   TAG     IMAGE ID       SIZE
blog-api     v1      abc123def456   ~180MB
mongo        7       xyz789...      ~700MB
```

### Exercise 1.3 — Inspect image layers

```bash
docker history blog-api:v1
```

**What to observe:** Each line = one Dockerfile instruction. Notice how `COPY` and `RUN npm ci` are separate layers.

### Exercise 1.4 — Build again (notice the cache!)

```bash
docker build -t blog-api:v1 .
```

**What to observe:** Every step says `CACHED`. Docker is smart — nothing changed, so it skips the work.

### Exercise 1.5 — Tag your image

```bash
# Create a "latest" tag pointing to same image
docker tag blog-api:v1 blog-api:latest

# Verify both tags exist
docker images | grep blog-api
```

### ✅ Checkpoint: You should see `blog-api` with tags `v1` and `latest`.

---

## Lab 2: Run a Container Manually

**Concept:** An image is a blueprint. A container is a running instance.

### Exercise 2.1 — Start MongoDB first

```bash
docker run -d \
  --name test-mongo \
  -p 27018:27017 \
  mongo:7
```

**Explanation:**
- `-d` = runs in background
- `--name test-mongo` = names the container
- `-p 27018:27017` = maps Mac port 27018 → container port 27017 (using 27018 to avoid conflicts)

### Exercise 2.2 — Verify MongoDB is running

```bash
docker ps
```

### Exercise 2.3 — Run your API container

```bash
docker run -d \
  --name test-api \
  -p 3001:3000 \
  -e PORT=3000 \
  -e MONGO_URI=mongodb://host.docker.internal:27018/test-blog \
  -e NODE_ENV=development \
  blog-api:v1
```

**Key learning:** `host.docker.internal` = special Docker hostname that points to your Mac (since both containers aren't on the same network yet).

### Exercise 2.4 — Test the API

```bash
curl http://localhost:3001/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

### Exercise 2.5 — View container logs

```bash
docker logs test-api
```

### Exercise 2.6 — Stream logs in real-time

```bash
# Run in one terminal:
docker logs -f test-api

# In ANOTHER terminal, hit the API:
curl http://localhost:3001/api/v1/posts
```

**What to observe:** The log updates live with the GET request.



Press `Ctrl+C` to stop streaming.

### Exercise 2.7 — Clean up

```bash
docker stop test-api test-mongo
docker rm test-api test-mongo
```

### ✅ Checkpoint: `docker ps -a` should show no containers named `test-*`.

---

## Lab 3: Go Inside a Container

**Concept:** Containers are mini Linux machines. You can shell into them.

### Exercise 3.1 — Start a container

```bash
docker run -d --name explore-api -p 3001:3000 \
  -e MONGO_URI=mongodb://localhost:27017/test \
  blog-api:v1
```

### Exercise 3.2 — Shell into it

```bash
docker exec -it explore-api sh
```

**You're now INSIDE the container!** Try these:

```bash
# Check where you are
pwd
# Expected: /app

# List files
ls -la
# You'll see server.js, src/, package.json etc.

# Check Node version
node -v
# Expected: v20.x.x

# Check the OS
cat /etc/os-release
# Expected: Alpine Linux (tiny ~5MB OS)

# Check running processes
ps aux
# You'll see "node server.js"

# Check environment variables
env | grep MONGO

# Exit the container
exit
```

### Exercise 3.3 — Run a one-off command

```bash
# Without interactive shell, just run one command:
docker exec explore-api node -v
docker exec explore-api ls /app/src
```

### Exercise 3.4 — Clean up

```bash
docker stop explore-api && docker rm explore-api
```

### ✅ Checkpoint: You explored the filesystem, OS, and process inside a container.

---

## Lab 4: Docker Compose — Multi-Container

**Concept:** Compose runs multiple containers with one command, on a shared network.

### Exercise 4.1 — Start everything

```bash
docker-compose up --build
```

**Watch the output carefully:**
1. MongoDB starts first (`depends_on`)
2. API starts and connects to MongoDB
3. You see: `✅ MongoDB Connected Successfully`

### Exercise 4.2 — Test CRUD operations

Open a **new terminal** and run these one by one:

```bash
# CREATE a post
curl -s -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Lab Test",
    "content": "Testing Docker Compose with my blogging platform",
    "author": "Anshul Kumar",
    "tags": ["docker", "lab"]
  }' | python3 -m json.tool
```

Copy the `_id` from the response, then:

```bash
# READ all posts
curl -s http://localhost:3000/api/v1/posts | python3 -m json.tool

# READ single post (replace <ID> with actual _id)
curl -s http://localhost:3000/api/v1/posts/<ID> | python3 -m json.tool

# UPDATE post
curl -s -X PATCH http://localhost:3000/api/v1/posts/<ID> \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated in Docker Lab"}' | python3 -m json.tool

# DELETE post
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X DELETE http://localhost:3000/api/v1/posts/<ID>
```

### Exercise 4.3 — Check container status

```bash
docker-compose ps
```

### Exercise 4.4 — View logs per service

```bash
# API logs only
docker-compose logs backend

# MongoDB logs only
docker-compose logs mongodb

# Stream all logs
docker-compose logs -f
```

### Exercise 4.5 — Stop (keep in first terminal)

Press `Ctrl+C` in the terminal running `docker-compose up`.

### ✅ Checkpoint: You ran API + MongoDB together and tested all CRUD operations.

---

## Lab 5: Volumes — Data Persistence

**Concept:** Without volumes, data dies with the container. Volumes keep it alive.

### Exercise 5.1 — Start and create data

```bash
docker-compose up --build -d

# Create a post
curl -s -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Persistence Test","content":"This data should survive a restart","author":"Anshul"}' \
  | python3 -m json.tool

# Verify it exists
curl -s http://localhost:3000/api/v1/posts | python3 -m json.tool
```

**Note the post count.**

### Exercise 5.2 — Stop containers (data should survive)

```bash
docker-compose down
docker ps -a  # No containers running
```

### Exercise 5.3 — Restart and check data

```bash
docker-compose up -d

# Wait 5 seconds for MongoDB to start
sleep 5

# Check — your post should STILL be there!
curl -s http://localhost:3000/api/v1/posts | python3 -m json.tool
```

**✅ Data survived!** Because `mongo-data` volume persists.

### Exercise 5.4 — Now destroy the volume

```bash
docker-compose down -v
#                    └── "-v" removes volumes too

# Start fresh
docker-compose up -d
sleep 5

# Check — data should be GONE
curl -s http://localhost:3000/api/v1/posts | python3 -m json.tool
```

**Expected:** Empty data array. Volume was deleted, so MongoDB started fresh.

### Exercise 5.5 — Inspect the volume

```bash
docker-compose down

# List volumes
docker volume ls

# Inspect details
docker volume inspect docker_mongo-data
```

### ✅ Checkpoint: You proved `down` keeps data, `down -v` destroys it.

---

## Lab 6: Networking

**Concept:** Containers on the same Docker network can reach each other by service name.

### Exercise 6.1 — Start services

```bash
docker-compose up -d
```

### Exercise 6.2 — Inspect the network

```bash
# List networks
docker network ls

# Inspect your project's network
docker network inspect docker_app-network
```

**What to observe:** Both `blog-api` and `blog-mongodb` are listed with their IP addresses.

### Exercise 6.3 — Test networking from inside

```bash
# Shell into the API container
docker exec -it blog-api sh

# Inside the container, ping MongoDB by service name
wget -qO- http://mongodb:27017 || echo "MongoDB is reachable on port 27017"

# Check DNS resolution
nslookup mongodb

# Exit
exit
```

**Key learning:** Inside Docker network, `mongodb` resolves to the MongoDB container's IP. That's why `MONGO_URI=mongodb://mongodb:27017/...` works!

### Exercise 6.4 — Clean up

```bash
docker-compose down
```

### ✅ Checkpoint: You understand how Docker DNS lets containers find each other.

---

## Lab 7: Rebuilding After Code Changes

**Concept:** When you change code, you need to rebuild the image.

### Exercise 7.1 — Make a code change

Edit `src/app.js` — change the health check response:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: 'v1.0.0',       // ← Add this line
    timestamp: new Date().toISOString(),
  });
});
```

### Exercise 7.2 — Rebuild and restart

```bash
# Method 1: Rebuild everything
docker-compose up --build -d

# Method 2: Rebuild only backend
docker-compose up --build -d backend
```

### Exercise 7.3 — Test the change

```bash
curl -s http://localhost:3000/health | python3 -m json.tool
```

**Expected:** You should see `"version": "v1.0.0"` in the response.

### Exercise 7.4 — Clean up

```bash
docker-compose down
```

> **Revert the change** in `src/app.js` if you don't want to keep it.

### ✅ Checkpoint: You know how to update code and rebuild containers.

---

## Lab 8: Full Cleanup

**Concept:** Docker uses disk space. Clean up regularly.

### Exercise 8.1 — Check disk usage

```bash
docker system df
```

### Exercise 8.2 — Clean up unused resources

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes (⚠️ deletes data)
docker volume prune -f
```

### Exercise 8.3 — Nuclear cleanup (removes EVERYTHING)

```bash
docker system prune -a -f
```

### Exercise 8.4 — Verify clean state

```bash
docker images
docker ps -a
docker volume ls
```

### ✅ Checkpoint: Your Docker environment is clean.

---

## 🏆 Lab Completion Checklist

| Lab | Concept Learned | Done? |
|-----|----------------|-------|
| **1** | Building images, layer caching, tagging | ⬜ |
| **2** | Running containers, port mapping, env vars | ⬜ |
| **3** | Shelling into containers, exploring the filesystem | ⬜ |
| **4** | Docker Compose, multi-container CRUD testing | ⬜ |
| **5** | Volume persistence — `down` vs `down -v` | ⬜ |
| **6** | Container networking, DNS resolution | ⬜ |
| **7** | Rebuilding after code changes | ⬜ |
| **8** | Cleanup and disk management | ⬜ |

> **Congratulations!** 🎉 After completing all 8 labs, you have hands-on experience with every major Docker concept used in production.
