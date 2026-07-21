# AWS Serverless To-Do CRUD API (AWS SAM)

A production-ready serverless CRUD API for managing to-do tasks, built with **AWS SAM**, AWS Lambda, API Gateway, and DynamoDB. Features **user isolation** via UUID/Device ID headers so users can only see and manage their own tasks.

## Architecture

- **AWS SAM** - Infrastructure as Code and deployment framework
- **AWS Lambda** - Serverless compute for API handlers
- **API Gateway** - REST API endpoints with CORS
- **DynamoDB** - NoSQL database with composite key (userId + taskId)

## Features

- ✅ Create, Read, Update, Delete (CRUD) operations
- 🔒 **User isolation** - Tasks are scoped to `X-User-Id` header (UUID/Device ID)
- 🛡️ Input validation and error handling
- 🔄 Auto-generated timestamps
- 📦 Infrastructure as Code via `template.yaml`

## API Endpoints

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| POST | `/tasks` | Create a new task | `X-User-Id` |
| GET | `/tasks` | Retrieve all tasks for user | `X-User-Id` |
| GET | `/tasks/{id}` | Retrieve a single task | `X-User-Id` |
| PUT | `/tasks/{id}` | Update a task | `X-User-Id` |
| DELETE | `/tasks/{id}` | Delete a task | `X-User-Id` |

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Docker](https://docs.docker.com/get-docker/) (for local testing)

```bash
# Verify installations
sam --version
aws --version
node --version
```

## Setup & Deployment

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd aws-serverless-todo-api
npm install
```

### 2. Build the SAM Application

```bash
sam build
```

### 3. Local Development

```bash
sam local start-api
```

API will be available at `http://localhost:3000`

### 4. Deploy to AWS

First time (guided):
```bash
sam deploy --guided
```

Subsequent deployments:
```bash
sam build && sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
```

Or use the npm script:
```bash
npm run deploy
```

### 5. Delete Stack

```bash
sam delete
# or
npm run delete
```

## Testing

### Using HTTP Client (VS Code REST Client)

Open `tests/test-endpoints.http` and send requests using the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

### Using cURL

```bash
# Set your user ID (UUID format)
USER_ID="user-$(uuidgen)"

# Create a task
curl -X POST https://YOUR_API_URL/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'

# Get all tasks
curl -H "X-User-Id: $USER_ID" \
  https://YOUR_API_URL/tasks

# Update a task (replace TASK_ID)
curl -X PUT https://YOUR_API_URL/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{"completed":true}'

# Delete a task
curl -X DELETE https://YOUR_API_URL/tasks/TASK_ID \
  -H "X-User-Id: $USER_ID"
```

## User Isolation

The API uses the `X-User-Id` header to identify users. This should be a UUID generated on the client device (e.g., using `uuid` library or `crypto.randomUUID()` in the browser) and stored persistently (localStorage, device keychain, etc.).

**Example client-side generation:**
```javascript
// Browser
const userId = localStorage.getItem('userId') || crypto.randomUUID();
localStorage.setItem('userId', userId);

// React Native
import * as SecureStore from 'expo-secure-store';
const userId = await SecureStore.getItemAsync('userId') 
  || crypto.randomUUID();
await SecureStore.setItemAsync('userId', userId);
```

## DynamoDB Table Schema

| Attribute | Type | Key | Description |
|-----------|------|-----|-------------|
| `userId` | String | Partition Key | User's UUID from header |
| `taskId` | String | Sort Key | Auto-generated UUID |
| `title` | String | | Task title |
| `description` | String | | Optional description |
| `completed` | Boolean | | Default: false |
| `createdAt` | String | | ISO 8601 timestamp |
| `updatedAt` | String | | ISO 8601 timestamp |

## Project Structure

```
aws-serverless-todo-api/
├── template.yaml          # SAM template (API Gateway, Lambda, DynamoDB)
├── samconfig.toml         # SAM deployment configuration
├── package.json           # Node.js dependencies & scripts
├── README.md              # This file
├── .gitignore
├── src/
│   ├── handlers/
│   │   ├── createTask.js  # POST /tasks
│   │   ├── getTasks.js    # GET /tasks
│   │   ├── getTask.js     # GET /tasks/{id}
│   │   ├── updateTask.js  # PUT /tasks/{id}
│   │   └── deleteTask.js  # DELETE /tasks/{id}
│   └── utils/
│       ├── response.js    # Standardized API responses
│       └── validate.js    # Input validation helpers
└── tests/
    └── test-endpoints.http # VS Code REST Client tests
```

## License

MIT

## Notes on this version

Two issues were found and fixed during review:

- `samconfig.toml` had a duplicate `[default.deploy.parameters]` table (invalid TOML — `sam` would fail to read the config). Merged into a single section.
- `template.yaml` had `Auth: DefaultAuthorizer: None` on the API resource without a matching authorizer defined, which is not a valid way to indicate "no auth" in SAM. Removed — omitting `Auth` entirely has the same effect safely.
- `validate.js`'s header lookup now matches `X-User-Id` case-insensitively instead of checking only two literal casings.
