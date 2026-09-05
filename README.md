# Expense Platform

A full-stack personal finance application for tracking income and expenses, organizing transactions into categories, and analyzing spending patterns over time.

I built this project primarily to learn and apply the full software development process: relational database design, REST API development, authentication, validation, testing, security fundamentals, frontend/backend integration, and production deployment.

## Live Demo

**Frontend:** https://expense-platform-frontend.vercel.app

**Backend API:** https://expense-platform-vvxr.onrender.com

> The backend may take a short time to respond after a period of inactivity depending on the hosting configuration.

---

## Features

### Authentication and Account Management

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Change name
- Change default currency
- Change password
- Delete account with password confirmation

### Transactions

- Create income and expense transactions
- Edit and delete transactions
- Assign transactions to categories
- Automatic category creation
- Optional payment method and notes
- Filter transactions
- Paginated transaction history

### Dashboard and Analytics

- Income and expense overview
- Category-based spending breakdown
- Transaction trends
- Multiple time periods
- Custom date ranges
- User-specific currency display
- Empty and loading states

### UI

- Responsive design
- Protected routes
- Loading and error feedback
- Delete confirmations
- Account settings

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts
- CSS

### Backend

- Node.js
- Express
- PostgreSQL
- `pg`
- JSON Web Tokens
- bcrypt
- Helmet
- express-rate-limit
- CORS

### Testing

- Jest
- Supertest

### Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

---

## Architecture

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │       Vercel         │
                    └──────────┬───────────┘
                               │ REST API / HTTPS
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │       Render         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Render         │
                    └──────────────────────┘
```

The frontend and backend are deployed independently. The frontend communicates with the backend through the REST API, while the backend is responsible for authentication, authorization, validation, business logic, and database access.

---

## Database Design

The application uses three primary tables:

### `users`

Stores account information including:

- Email
- Hashed password
- Name
- Default currency

### `categories`

Stores user-specific transaction categories.

Categories belong to individual users and category names are unique per user regardless of case.

### `transactions`

Stores:

- User
- Transaction type (`income` or `expense`)
- Amount
- Category
- Payment method
- Notes
- Transaction date

Transactions belong to a user and may optionally reference a category.

Important database constraints include:

- Positive transaction amounts
- Valid transaction types
- Foreign-key relationships
- Cascading deletion of user-owned data
- Case-insensitive category uniqueness
- Indexing transactions by user and transaction date

---

## Authentication

Authentication uses JSON Web Tokens (JWT).

The basic authentication flow is:

```text
Register / Login
       │
       ▼
Backend verifies credentials
       │
       ▼
Backend issues JWT
       │
       ▼
Frontend stores token
       │
       ▼
Authorization: Bearer <token>
       │
       ▼
Protected backend routes
```

Passwords are never stored directly. They are hashed using bcrypt before being stored in PostgreSQL.

Protected resources are scoped to the authenticated user on the backend rather than relying on frontend restrictions.

---

## API Overview

The API is organized around the following resources:

```text
/auth
/transactions
/analytics
/users
/currencies
```

Examples include:

```text
POST   /auth/register
POST   /auth/login

GET    /transactions
POST   /transactions
PATCH  /transactions/:transactionId
DELETE /transactions/:transactionId

GET    /analytics/summary
GET    /analytics/categories
GET    /analytics/trends
```

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

Transaction listing supports pagination and filtering, while analytics endpoints support date-range queries.

---

## Security Measures

The application currently includes:

- Password hashing with bcrypt
- JWT authentication
- Backend authorization checks
- Backend input validation
- Parameterized PostgreSQL queries
- CORS restrictions
- Helmet security headers
- Authentication rate limiting
- JSON request-size limits
- Centralized error handling
- Environment variables for secrets and deployment configuration

Security-sensitive validation is performed by the backend rather than relying on frontend controls.

---

## Running Locally

### Prerequisites

Install:

- Node.js
- npm
- PostgreSQL

Clone the repository:

```bash
git clone https://github.com/AbdelrahmanElghandour/expense_platform.git
cd expense-platform
```

### Backend

Navigate to the backend:

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret

PORT=3000
FRONTEND_URL=http://localhost:5173
```

Create the PostgreSQL schema before starting the server.

Then run:

```bash
npm start
```

The backend will run at:

```text
http://localhost:3000
```

### Frontend

From the project root:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start Vite:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Testing

Backend tests use Jest and Supertest.

Run them from the backend directory:

```bash
npm test
```

Tests cover important API behavior such as authentication, validation, transaction operations, pagination, and authorization behavior.

---

## Environment Configuration

Development and production use the same application code with different environment configuration.

For example:

```text
Development
Frontend → localhost:3000
Backend  → local PostgreSQL

Production
Frontend → Render API
Backend  → Render PostgreSQL
```

This keeps deployment-specific URLs, credentials, and secrets outside the source code.

---

## Project Structure

```text
expense-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── ...
│   ├── tests/
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## What I Learned

This project was built as an exercise in understanding the complete development lifecycle rather than only implementing application features.

Some of the main concepts I practiced include:

- Designing a relational database schema
- Modeling one-to-many relationships
- Building REST APIs with Express
- Authentication and authorization
- Password hashing and JWTs
- Backend input validation
- HTTP status codes and error handling
- Pagination and filtering
- Database constraints and indexes
- Automated API testing
- React frontend/backend integration
- Environment-specific configuration
- CORS and browser security behavior
- Production database provisioning
- Deploying frontend and backend services independently
- Debugging differences between development and production

---

## Future Improvements

Potential improvements include:

- Full multi-currency transaction support and currency conversion
- More advanced analytics
- Improved test coverage
- Refresh-token/session improvements
- Email verification and password recovery
- Database migration tooling
- Improved observability and production monitoring
- Performance optimization for larger datasets
- Additional security hardening

---

## Status

V1 is deployed and functional.

The project is currently undergoing further security and scalability review.