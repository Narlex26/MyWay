pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building'
                // Add yout Windows build command here
                bat 'echo Running build commands'
            }
        }
        stage('Send gif'){
            steps {
                echo 'Sending gif to Discord'
                bat '''
                curl -H "Content-Type: application/json" ^
                  -X POST ^
                  -d "{ \\"content\\": \\"Voici un gif ! https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif\\" }" ^
                  "https://discord.com/api/webhooks/1376464326076010617/HzMpLJtrkzp1iv-FISrN432LfTCd4RMSrBLaiNRV8A2nPzJ0SpxwFnW6AyBq5Qi9qMff"
                '''
            }
        }
    }
}