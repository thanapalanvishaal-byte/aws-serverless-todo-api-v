# Dil Pickle To-Do

A serverless To-Do app: an AWS-hosted CRUD API on the backend, and a Flutter mobile app on the front end.

## Repository structure

This repo contains two independent projects:

```
aws-serverless-todo-api-v/
├── aws-serverless-todo-api/    ← Backend: AWS Lambda + API Gateway + DynamoDB
└── front_end_todo_app/          ← Frontend: Flutter mobile app
```

They're kept in one repository for convenience, but each has its own setup, dependencies, and README — see the links below.

## Backend — [`aws-serverless-todo-api/`](./aws-serverless-todo-api)

A serverless REST API built with AWS SAM (Lambda + API Gateway + DynamoDB), with full CRUD support and per-user task isolation.

- **Live API**: `https://dr2ep70ghd.execute-api.us-east-1.amazonaws.com/dev`
- **Endpoints**: `POST /tasks`, `GET /tasks`, `GET /tasks/{id}`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`
- **Isolation**: every request requires an `X-User-Id` header; tasks are scoped to that id via a composite DynamoDB key (`userId` + `taskId`)
- Setup and deployment instructions: [`aws-serverless-todo-api/README.md`](./aws-serverless-todo-api/README.md)

## Frontend — [`front_end_todo_app/`](./front_end_todo_app)

A Flutter app ("Dil Pickle To-Do") that connects to the backend above — add, complete, and delete tasks, with a dark themed UI matching the project's Figma design.

- Talks to the same live API listed above via the same `X-User-Id` header, persisted per device
- Setup, running locally, and building an APK: [`front_end_todo_app/README.md`](./front_end_todo_app/README.md)

## Quick start

**Backend** (requires AWS CLI + SAM CLI configured):
```bash
cd aws-serverless-todo-api
npm install
sam build
sam deploy --guided
```

**Frontend** (requires Flutter SDK):
```bash
cd front_end_todo_app
flutter pub get
flutter run
```

To build a release APK:
```bash
cd front_end_todo_app
flutter clean
flutter pub get
flutter build apk --release
```
Output: `front_end_todo_app/build/app/outputs/flutter-apk/app-release.apk`
