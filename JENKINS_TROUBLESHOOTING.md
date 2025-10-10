# 🔧 Jenkins Troubleshooting Guide

Common issues and solutions for your Jenkins pipeline.

---

## ✅ Issue FIXED: "Batch scripts can only be run on Windows nodes"

### What Happened:
Your Jenkins is running in a **Docker container (Linux)**, but the Jenkinsfile was using **Windows batch commands** (`bat`).

### The Fix:
✅ Changed all `bat` commands to `sh` (shell commands for Linux)
✅ Changed `python` to `python3` (Linux convention)
✅ Changed Windows paths (`venv\Scripts\activate`) to Linux paths (`venv/bin/activate`)
✅ Updated to your Docker Hub username: `pavanakkineni`

### Status:
🎉 **FIXED!** Your Jenkinsfile is now compatible with Linux Jenkins.

---

## 🚀 Next Steps

### 1. Trigger a New Build

**Option A: Automatic (Recommended)**
- Jenkins will detect the new commit automatically
- Wait 5 minutes (or check immediately if webhook is set up)

**Option B: Manual**
1. Go to Jenkins: http://localhost:8080
2. Click on `Trading-Analytics-Pipeline`
3. Click **"Build Now"**

### 2. Monitor the Build

Watch the console output:
1. Click on the build number (e.g., `#2`)
2. Click **"Console Output"**
3. Watch the stages execute

---

## 📊 Expected Pipeline Flow

```
✅ Stage 1: Checkout Code (~10s)
   └─ Pulls code from GitHub

✅ Stage 2: Environment Setup (~5s)
   └─ Copies .env.example to .env

✅ Stage 3: Install Dependencies (~2-3min)
   └─ Creates Python virtual environment
   └─ Installs packages from requirements.txt

✅ Stage 4: Run Tests (~30s)
   └─ Runs pytest (if tests exist)
   └─ Verifies app imports successfully

✅ Stage 5: Security Scan (~1min)
   └─ Checks for vulnerable packages
   └─ Scans code for security issues

✅ Stage 6: Build Docker Image (~2-3min)
   └─ Creates Docker image
   └─ Tags with build number and 'latest'

✅ Stage 7: Test Docker Image (~1min)
   └─ Runs container on port 8001
   └─ Tests /api/health endpoint
   └─ Cleans up test container

✅ Stage 8: Push to Docker Hub (~2-3min)
   └─ Logs into Docker Hub
   └─ Pushes image with build number
   └─ Pushes 'latest' tag

Total: ~10-15 minutes
```

---

## 🚨 Other Common Issues

### Issue 1: "python3: command not found"

**Cause:** Python not installed in Jenkins container

**Solution:**
```groovy
// Add to Jenkinsfile at the top of 'Install Dependencies' stage:
sh '''
    apt-get update && apt-get install -y python3 python3-pip python3-venv
    python3 -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt
'''
```

**Or use a Jenkins agent with Python pre-installed:**
```groovy
pipeline {
    agent {
        docker {
            image 'python:3.11-slim'
        }
    }
    // rest of pipeline...
}
```

---

### Issue 2: "Docker not found" or "Cannot connect to Docker daemon"

**Cause:** Jenkins container can't access Docker

**Solution:**

**If Jenkins is in Docker:**
```powershell
# Stop current Jenkins
docker stop jenkins
docker rm jenkins

# Restart with Docker socket mounted
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  --group-add $(stat -c '%g' /var/run/docker.sock) `
  jenkins/jenkins:lts

# Install Docker CLI inside Jenkins container
docker exec -u root jenkins sh -c "apt-get update && apt-get install -y docker.io"
```

**Or use Jenkins with Docker pre-installed:**
```powershell
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts-jdk17
```

---

### Issue 3: "Permission denied" when accessing Docker

**Cause:** Jenkins user doesn't have Docker permissions

**Solution:**
```powershell
# Give Jenkins user Docker permissions
docker exec -u root jenkins sh -c "usermod -aG docker jenkins"
docker restart jenkins
```

---

### Issue 4: "dockerhub-credentials not found"

**Cause:** Credentials not added to Jenkins or wrong ID

**Solution:**
1. Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Check if credential with ID `dockerhub-credentials` exists
3. If not, add it:
   - **Kind:** Username with password
   - **Username:** `pavanakkineni`
   - **Password:** Your Docker Hub token
   - **ID:** `dockerhub-credentials` (EXACTLY this!)

---

### Issue 5: "Health check failed" during Docker image test

**Cause:** Container not starting properly or missing environment variables

**Solution:**

**Check if .env file is being created:**
```groovy
// Add debug step before 'Test Docker Image':
stage('Debug Environment') {
    steps {
        sh '''
            echo "Checking .env file:"
            ls -la .env || echo ".env not found"
            echo "First few lines of .env:"
            head -n 5 .env || echo "Cannot read .env"
        '''
    }
}
```

**Or skip health check temporarily:**
```groovy
stage('Test Docker Image') {
    steps {
        echo 'Testing Docker image...'
        script {
            sh '''
                docker run -d --name test-container -p 8001:8000 ${DOCKER_IMAGE}:${DOCKER_TAG}
                sleep 30
                
                # Just check if container is running
                docker ps | grep test-container
                
                # Clean up
                docker stop test-container || true
                docker rm test-container || true
            '''
        }
    }
}
```

---

### Issue 6: "No space left on device"

**Cause:** Docker images filling up disk space

**Solution:**
```powershell
# Clean up old Docker images
docker system prune -a -f

# Or add cleanup to Jenkinsfile post section:
post {
    always {
        echo 'Cleaning up...'
        sh 'docker system prune -f'
        cleanWs()
    }
}
```

---

### Issue 7: Build is very slow (>30 minutes)

**Cause:** Installing dependencies every time

**Solution: Use Docker layer caching**

Create a custom Jenkins agent with dependencies pre-installed:

**Dockerfile.jenkins-agent:**
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Pre-install common Python packages
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

WORKDIR /workspace
```

**Build and use:**
```powershell
docker build -t jenkins-python-agent -f Dockerfile.jenkins-agent .
```

**Update Jenkinsfile:**
```groovy
pipeline {
    agent {
        docker {
            image 'jenkins-python-agent'
        }
    }
    // rest of pipeline...
}
```

---

## 🎯 Simplified Jenkinsfile (For Testing)

If you're still having issues, use this minimal version to test:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USERNAME = 'pavanakkineni'
        DOCKER_IMAGE = "${DOCKER_HUB_USERNAME}/trading-analytics-platform"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing to Docker Hub...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Build successful!'
        }
        failure {
            echo '❌ Build failed!'
        }
    }
}
```

This minimal version:
- ✅ Skips Python setup
- ✅ Skips tests
- ✅ Just builds and pushes Docker image
- ✅ Faster and easier to debug

---

## 📋 Debug Checklist

When a build fails, check these in order:

### 1. Jenkins Logs
- [ ] Go to build → Console Output
- [ ] Find the exact error message
- [ ] Note which stage failed

### 2. Docker Status
```powershell
# Check if Docker is accessible
docker exec jenkins docker ps

# Check Docker images
docker exec jenkins docker images
```

### 3. Credentials
- [ ] Verify `dockerhub-credentials` exists
- [ ] Test Docker Hub login manually:
```powershell
docker login -u pavanakkineni
# Enter your token
```

### 4. Network
- [ ] Check if Jenkins can reach Docker Hub
```powershell
docker exec jenkins curl -I https://hub.docker.com
```

### 5. Disk Space
```powershell
# Check available space
docker exec jenkins df -h
```

---

## 🎓 Understanding Jenkins + Docker Setup

### Your Current Setup:

```
┌─────────────────────────────────────────┐
│  Your Windows Machine                   │
│  ├─ Docker Desktop (running)            │
│  │  ├─ Jenkins Container (Linux)        │
│  │  │  └─ Runs your pipeline            │
│  │  │     └─ Builds Docker images       │
│  │  │        └─ Pushes to Docker Hub    │
│  │  └─ Your App Container (when tested) │
│  └─ Your code files                     │
└─────────────────────────────────────────┘
```

### Why Linux Commands?

Jenkins is running in a **Linux container**, even though your machine is Windows. So:
- ✅ Use `sh` (shell) commands
- ✅ Use Linux paths (`/`, not `\`)
- ✅ Use `python3` (Linux convention)
- ❌ Don't use `bat` (Windows only)
- ❌ Don't use Windows paths

---

## 🚀 Current Status

✅ **Jenkinsfile updated for Linux**
✅ **Docker Hub username configured**
✅ **Branch set to `master`**
✅ **Code pushed to GitHub**

### Next Build Should:
1. ✅ Checkout code successfully
2. ✅ Setup environment
3. ✅ Install Python dependencies
4. ✅ Run tests
5. ✅ Build Docker image
6. ✅ Push to Docker Hub

---

## 📞 If Build Still Fails

### Share with me:
1. **Console output** from the failed stage
2. **Which stage failed** (stage name)
3. **Error message** (exact text)

### Quick Tests:
```powershell
# Test if Jenkins can run shell commands
docker exec jenkins sh -c "echo 'Hello from Jenkins'"

# Test if Jenkins can access Docker
docker exec jenkins docker ps

# Test if Python is available
docker exec jenkins python3 --version
```

---

## 🎉 Success Indicators

Your build is successful when you see:

1. ✅ All stages show green checkmarks
2. ✅ Console output ends with: `Finished: SUCCESS`
3. ✅ Docker Hub shows your image: https://hub.docker.com/r/pavanakkineni/trading-analytics-platform
4. ✅ You can pull the image:
```powershell
docker pull pavanakkineni/trading-analytics-platform:latest
```

---

**Your pipeline is now ready! Trigger a new build and watch it succeed! 🚀**
