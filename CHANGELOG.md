# Changelog

## [0.2.0] - 2024-04-26
### Added
- Vercel deployment integration
  - Connected GitHub repository to Vercel
  - Set up automatic deployments from stable-frontend branch
  - Configured production environment variables
- GitHub Actions CI/CD
  - Added auto-deploy.yml workflow
  - Configured Vercel deployment secrets
  - Set up automated build and deployment pipeline

### Changed
- Repository Structure
  - Maintained separate frontend repository for independent deployment
  - Configured stable-frontend as production branch

### Infrastructure
- Vercel Configuration
  - Project ID: prj_BCRQAk6lzNYKp8QOWzexQh0agvpL
  - Team: equalsajaymadhok's projects
  - Production Branch: stable-frontend
  - Environment Variables:
    - REACT_APP_API_URL: https://registry.reviz.dev/api
    - REACT_APP_REAL_API_URL: https://registry.reviz.dev/api

### Documentation
- Added deployment test section in README.md
- Updated deployment configuration documentation

## [0.1.0] - 2024-04-26
### Added
- Basic authentication system
  - User registration with email, username, and password
  - Login functionality (currently email-only login)
  - JWT-based authentication
- Asset management system
  - Asset registration endpoint
  - Asset retrieval endpoints
  - Batch upload functionality
  - Asset curation endpoint
- Storage system
  - Local storage configuration for development
  - GCP storage configuration for production
- Documentation
  - Swagger API documentation at /api/docs
  - Project setup documentation