# Metaverse Social Practice Backend

This is the NestJS backend for the Metaverse Social Practice application. It provides a robust API for managing scenarios, users, and authentication.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Different roles for users, scenario owners, and admins
- **Scenario Management**: Create, read, update, and delete scenarios
- **Session Tracking**: Start sessions and record interactions
- **Strict Configuration**: Fail-fast approach with no default fallbacks

## Prerequisites

- Node.js 18 or higher
- MongoDB 6.0 or higher
- npm or yarn

## Environment Variables

This application uses a strict fail-fast configuration approach. All environment variables must be explicitly set in all environments with no default fallbacks.

Copy the `.env.example` file to `.env` and fill in all required values:

```bash
cp .env.example .env
```

Required environment variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/social-eye

# JWT Authentication
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Docker Deployment

This application can be deployed using Docker. A Dockerfile is provided in the root directory.

```bash
# Build the Docker image
docker build -t social-eye-backend .

# Run the Docker container
docker run -p 3001:3001 --env-file .env social-eye-backend
```

For Docker Compose deployment, see the `docker-compose.yml` file in the project root.

## API Documentation

When running in development mode, Swagger documentation is available at:

```
http://localhost:3001/api/docs
```

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

## License

This project is proprietary and confidential.
