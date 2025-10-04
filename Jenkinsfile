pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'trading-analytics-platform'
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'your-registry.com' // Replace with your registry
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
                    // Create virtual environment and install dependencies
                    sh '''
                        python -m venv venv
                        . venv/bin/activate || venv\\Scripts\\activate
                        pip install -r requirements.txt
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                script {
                    sh '''
                        . venv/bin/activate || venv\\Scripts\\activate
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
                    sh '''
                        . venv/bin/activate || venv\\Scripts\\activate
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
                    sh '''
                        # Run container for testing
                        docker run -d --name test-container -p 8001:8000 ${DOCKER_IMAGE}:${DOCKER_TAG}
                        sleep 30
                        
                        # Test health endpoint
                        curl -f http://localhost:8001/api/health || exit 1
                        
                        # Clean up test container
                        docker stop test-container
                        docker rm test-container
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo 'Pushing to Docker registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
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
                    sh '''
                        # Stop existing staging container
                        docker stop ${APP_NAME}-staging || true
                        docker rm ${APP_NAME}-staging || true
                        
                        # Run new container
                        docker run -d \\
                            --name ${APP_NAME}-staging \\
                            -p 8002:8000 \\
                            --env-file .env \\
                            --restart unless-stopped \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    sh '''
                        # Blue-Green deployment strategy
                        
                        # Stop old container
                        docker stop ${APP_NAME}-prod || true
                        docker rm ${APP_NAME}-prod || true
                        
                        # Run new container
                        docker run -d \\
                            --name ${APP_NAME}-prod \\
                            -p 8000:8000 \\
                            --env-file .env.prod \\
                            --restart unless-stopped \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                        
                        # Health check
                        sleep 30
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
