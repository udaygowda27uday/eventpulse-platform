pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out EventPulse source code...'
                checkout scm
            }
        }

        stage('Frontend Install') {
            steps {
                dir('client') {
                    bat 'npm ci'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('client') {
                    bat 'npm run build'
                }
            }
        }

        stage('Backend Install') {
            steps {
                dir('server') {
                    bat 'npm ci'
                }
            }
        }

        stage('Security Audit') {
            steps {
                dir('server') {
                    bat 'npm audit --audit-level=high'
                }
            }
        }
    }

    post {
        success {
            echo 'EventPulse CI pipeline completed successfully.'
        }

        failure {
            echo 'EventPulse CI pipeline failed. Check the failed stage and console output.'
        }
    }
}