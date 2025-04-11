# NNA Registry Service Frontend

This is the frontend application for the NNA Registry Service, built with React, TypeScript, and Material UI.

## Project Overview

The NNA Registry Service Frontend provides a user interface for managing digital assets in the NNA Framework. It includes features for asset registration, management, and retrieval using a dual addressing system (Human-Friendly Names and NNA Addresses).

## Tech Stack

- React with TypeScript
- Material UI for components and styling
- React Router for navigation
- Axios for API requests
- React Hook Form for form handling and validation
- Yup for schema validation

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment configuration:
   ```
   cp .env.example .env.local
   ```
4. Update the `.env.local` file with your configuration values

### Development

Start the development server:

```
npm start
```

The application will be available at http://localhost:3000 by default.

### Building for Production

Build the application for production:

```
npm run build:prod
```

This builds the app with optimized settings and no source maps. The build artifacts will be available in the `build` directory.

### Running Tests

```
npm test
```

### Linting

```
npm run lint
npm run lint:fix  # To automatically fix issues
```

### Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Features

- User authentication (login/register)
- Asset management (create, view, update, delete)
- Asset searching and filtering
- Layer-based taxonomy validation
- File uploads and management
- Role-based access control (user/admin)

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/services`: API services
- `src/hooks`: Custom React hooks
- `src/context`: React context providers
- `src/types`: TypeScript interfaces and types
- `src/utils`: Utility functions
- `src/assets`: Static assets (images, icons, etc.)

## API Integration

This frontend application integrates with the NNA Registry Service Backend API. Make sure the backend service is running and properly configured in your environment variables.

## License

This project is proprietary and confidential.