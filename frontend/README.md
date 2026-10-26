# BrewMaster Frontend

React + Vite frontend for the BrewMaster Coffee Shop Management System. It communicates with the Spring Boot REST API using Axios and sends the JWT access token in the `Authorization` header for protected requests.

## Requirements

- Node.js 20.19+ or 22.12+ recommended
- npm
- BrewMaster backend running at `http://localhost:8080` by default

## Setup and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment configuration

Copy `.env.example` to `.env.local` if you need to change the backend address:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Vite variables are bundled into the browser application. Do not store passwords, signing keys, or other secrets in frontend environment files.

## Quality checks

```bash
npm run lint
npm run build
```

## Main pages

- Login
- Dashboard (ADMIN and MANAGER)
- Products
- Categories
- Orders
- User management (ADMIN)

Frontend controls improve usability, but all permissions must also be enforced by the backend.
