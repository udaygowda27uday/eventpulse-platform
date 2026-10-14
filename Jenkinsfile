
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

        stage('Backend Validation') {
            steps {
                dir('server') {
                    echo 'Checking backend JavaScript syntax...'
                    bat 'node --check index.js'

                    echo 'Checking installed backend dependencies...'
                    bat 'npm ls --depth=0'
                }
            }
        }

        stage('Security Audit') {
            steps {
                dir('server') {
                    bat 'npm audit --omit=dev --audit-level=high'
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

        always {
            echo 'EventPulse CI pipeline execution finished.'
        }
    }
}
