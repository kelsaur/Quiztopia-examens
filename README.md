# Quiztopia Backend

Quiztopia - a serverless backend for an interactive quiz app. <br>
Built with **AWS Lambda, DynamoDB, and API Gateway**, deployed using **Serverless Framework**. **Middy** middleware is used for validation, JSON parsing, and error handling, **bcrypt** for password hashing and **JWT** for authentication.

## DynamoDB Table Design

Single-table design using `pk` (partition key) and `sk` (sort key).

- **User**
  - `pk = USER#username`, `sk = PROFILE`
- **Quiz**
  - `pk = QUIZ#quizId`, `sk = PROFILE`
  - `GSI1pk = QUIZZES` (used to list all quizzes)
- **Question**
  - `pk = QUIZ#quizId`, `sk = QUESTION#questionId`

## Endpoints

| Method | Path                          | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/auth/register`              | Register new user              |
| POST   | `/auth/login`                 | Log in, return JWT             |
| POST   | `/quizzes`                    | Create quiz `*`                |
| POST   | `/quizzes/{quizId}/questions` | Add question `*`               |
| DELETE | `/quizzes/{quizId}`           | Delete quiz + all questions`*` |
| GET    | `/quizzes/{quizId}`           | Get quiz + all questions       |
| GET    | `/quizzes`                    | List all quizzes               |

`*` only for logged in and authenticated users <br>
Protected routes require `Authorization: Bearer <token>` header.

## Set up

1. Clone the repo
   ```bash
   git clone https://github.com/kelsaur/Quiztopia-examens
   cd Quiztopia
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   DYNAMODB_TABLE=Quiztopia-table
   SLS_ORG=orgName
   SLS_SERVICE=serviceName
   AWS_IAM_ROLE=yourIAMRole
   DYNAMODB_TABLE=yourTableName
   JWT_SECRET=yourSecretKey
   AWS_REGION=yourRegion
   ```
4. Deploy with Serverless
   ```bash
   npx serverless deploy
   ```
