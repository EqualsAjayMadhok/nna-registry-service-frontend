## Deployment Test
Last deployment test: April 26, 2024

# NNA Registry Service Frontend

This is the frontend application for the NNA Registry Service, built with React, TypeScript, and Material UI. The application provides a user interface for managing digital assets within the NNA Framework.

## Project Overview

The NNA Registry Service Frontend provides a comprehensive interface for asset registration, management, and retrieval using a dual addressing system (Human-Friendly Names and NNA Addresses). It supports the full lifecycle of digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

## Tech Stack

- React 18 with TypeScript
- Material UI for components and styling
- React Router for navigation
- Axios for API requests
- React Hook Form for form handling and validation
- Yup for schema validation
- Context API for state management

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd nna-registry-service/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment for development with mock data
   ```
   echo "REACT_APP_USE_MOCK_DATA=true" > .env.local
   ```

### Development

Start the development server:

```
npm start
```

The application will be available at http://localhost:3000 by default.

### Demo Mode

The application includes a demo mode with mock data that can be used without setting up the backend. This is enabled by default in the development environment.

To login in demo mode:
- Email: demo@example.com
- Password: any password will work

### Building for Production

Build the application for production:

```
npm run build
```

This builds the app with optimized settings. The build artifacts will be available in the `build` directory.

### Serving the Production Build

To serve the production build locally:

```
npx serve -s build
```

### Running Tests

```
npm test
```

### Linting

```
npm run lint
npm run lint:fix  # To automatically fix issues
```

## Features

- User authentication (login/register)
- Dashboard with asset statistics and quick access
- Asset browsing with filtering and pagination
- Detailed asset views
- Asset registration with taxonomy validation
- Multi-step asset creation workflow
- Layer-based taxonomy validation
- Role-based access control (user/admin)
- Mock data mode for demonstration

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/services`: API services and mock data implementations
- `src/contexts`: React context providers
- `src/types`: TypeScript interfaces and types
- `src/utils`: Utility functions
- `src/assets`: Static assets (images, icons, etc.)

## API Integration

By default, the frontend works with mock data for demonstration purposes. To connect to a real backend:

1. Set up the NNA Registry Service backend (see main repository README)
2. Update `.env.local` to point to your backend API:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_USE_MOCK_DATA=false
   ```

## Deployment Options

### Static Hosting (Recommended for Demo)

The built application is a static site that can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `build` directory to:
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Firebase Hosting

### Docker (For Production)

A Dockerfile is included for containerized deployment:

```
docker build -t nna-frontend .
docker run -p 80:80 nna-frontend
```

## License

This project is proprietary and confidential.
