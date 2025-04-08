# Node.js TypeScript API Template

A scalable and modular Node.js TypeScript API template for quickly bootstrapping new projects.

## Features

- **TypeScript** for type safety
- **Express.js** for API routing
- **PostgreSQL** for database
- **Role-based Access Control (RBAC)** for permissions management
- **JWT Authentication** for secure API access
- **db-migrate** for database migrations
- **Winston** for logging
- **Husky** for git hooks
- **ESLint** and **Prettier** for code quality
- **Mocha & Chai** for testing
- **Configuration script** for easy project setup

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL

### Project Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the configuration script:
   ```
   npm run configure
   ```
   This will guide you through setting up your project name, environment variables, and other configurations.

4. Start the development server:
   ```
   npm run dev
   ```

### Project Structure

```
.
├── migrations/       # Database migrations
├── scripts/          # Utility scripts
├── src/
│   ├── config/       # Application configuration
│   ├── modules/      # Feature modules
│   │   ├── auth/     # Authentication module
│   │   ├── user/     # User module
│   ├── routes/       # API routes
│   ├── shared/       # Shared code
│   └── index.ts      # Application entry point
└── tests/            # Test files
```

### Role-Based Access Control

The template includes a built-in role-based access control system:

- Users have a role (admin or user)
- Roles have permissions
- API endpoints can be protected with permission requirements

#### Default Roles and Permissions

- **Admin**: Has all permissions
  - CRUD operations on users
  - Manage roles and permissions
  
- **User**: Has limited permissions
  - Read and update their own profile

#### Custom Permissions

You can easily define and assign custom permissions through the permissions API.

### Authentication

The authentication system uses JWT tokens for API access:

- Register: `/api/v1/auth/register`
- Login: `/api/v1/auth/login`
- Current User: `/api/v1/auth/me`

### Environment Variables

The following environment variables are required:

- `APP_NODE_ENV` - Node environment (development, test, production)
- `APP_PORT` - Port to run the server on
- `APP_DATABASE_URL` - PostgreSQL connection string
- `APP_SECRET` - Secret key for authentication

See `.env.example` for all required environment variables.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback database migrations
- `npm run migrate:create <name>` - Create a new migration
- `npm run configure` - Run the project configuration script

## License

This project is licensed under the MIT License. 