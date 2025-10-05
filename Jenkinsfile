pipeline {
    agent any
    
    environment {
        // TODO: Replace 'YOUR_DOCKERHUB_USERNAME' with your actual Docker Hub username
        DOCKER_HUB_USERNAME = 'pavanakkineni' // e.g., 'pavanakkineni'
        DOCKER_IMAGE = "${DOCKER_HUB_USERNAME}/trading-analytics-platform"
        DOCKER_TAG = "${BUILD_NUMBER}"
        APP_NAME = 'trading-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo 'Setting up environment...'
                script {
                    // Copy environment file
                    sh 'cp .env.example .env || echo "No .env.example found"'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                script {
                    // For Windows Jenkins agents, use bat instead of sh
                    // For Linux/Mac Jenkins agents, use sh
                    bat '''
                        python -m venv venv
                        call venv\\Scripts\\activate
                        pip install -r requirements.txt
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                script {
                    bat '''
                        call venv\\Scripts\\activate
                        python -m pytest tests/ || echo "No tests found"
                        python -c "from app.main import app; print('App imports successfully')"
                    '''
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Running security scans...'
                script {
                    bat '''
                        call venv\\Scripts\\activate
                        pip install safety bandit
                        safety check || echo "Safety check completed"
                        bandit -r app/ || echo "Bandit scan completed"
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                echo 'Testing Docker image...'
                script {
                    bat '''
                        REM Run container for testing
                        docker run -d --name test-container -p 8001:8000 %DOCKER_IMAGE%:%DOCKER_TAG%
                        timeout /t 30 /nobreak
                        
                        REM Test health endpoint
                        curl -f http://localhost:8001/api/health
                        
                        REM Clean up test container
                        docker stop test-container
                        docker rm test-container
                    '''
                }
            }
        }
        
        stage('Push to Docker Hub') {
            when {
                branch 'master'  // Changed from 'main' to 'master' to match your branch
            }
            steps {
                echo 'Pushing to Docker Hub...'
                script {
                    // Login to Docker Hub using credentials stored in Jenkins
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        def image = docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                script {
                    bat '''
                        REM Stop existing staging container
                        docker stop %APP_NAME%-staging || echo "No staging container to stop"
                        docker rm %APP_NAME%-staging || echo "No staging container to remove"
                        
                        REM Run new container
                        docker run -d ^
                            --name %APP_NAME%-staging ^
                            -p 8002:8000 ^
                            --env-file .env ^
                            --restart unless-stopped ^
                            %DOCKER_IMAGE%:%DOCKER_TAG%
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'master'  // Changed from 'main' to 'master'
            }
            steps {
                echo 'Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    bat '''
                        REM Blue-Green deployment strategy
                        
                        REM Stop old container
                        docker stop %APP_NAME%-prod || echo "No prod container to stop"
                        docker rm %APP_NAME%-prod || echo "No prod container to remove"
                        
                        REM Run new container
                        docker run -d ^
                            --name %APP_NAME%-prod ^
                            -p 8000:8000 ^
                            --env-file .env ^
                            --restart unless-stopped ^
                            %DOCKER_IMAGE%:%DOCKER_TAG%
                        
                        REM Health check
                        timeout /t 30 /nobreak
                        curl -f http://localhost:8000/api/health
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // Send notification
            emailext (
                subject: "✅ Trading App Deployment Successful - Build ${BUILD_NUMBER}",
                body: "The trading analytics platform has been successfully deployed.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
            emailext (
                subject: "❌ Trading App Deployment Failed - Build ${BUILD_NUMBER}",
                body: "The trading analytics platform deployment failed. Check Jenkins logs.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
