# BrewMaster — Coffee Shop Management System

BrewMaster is a full-stack coffee shop management application built with a Spring Boot REST API, a React frontend, and MySQL. It demonstrates role-based operations for managing menu products, categories, users, customer orders, and a business summary dashboard.

> **Project status:** Core workflows are implemented. Automated test coverage, deployment hardening, and production deployment remain areas for continued improvement. This repository does not currently implement inventory, suppliers, customer CRM, billing/POS, email notifications, or audit logs; those are possible future enhancements, not current features.

## Features

- **Authentication:** Registration and login, BCrypt password hashing, JWT bearer-token authentication, stateless Spring Security configuration.
- **Role-based access:** `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_CASHIER`, and `ROLE_BARISTA` permissions enforced by the backend.
- **User administration:** View users and update user roles (administrator-only).
- **Menu management:** Create, view, update, search, paginate, sort, and soft-delete products; manage categories.
- **Order management:** Create orders with one or more available products, calculate totals from stored product prices, view orders, filter by status, update permitted status transitions, and soft-delete orders.
- **Dashboard:** Summary counts and sales information for authorized administrators and managers.
- **Validation and errors:** Jakarta Bean Validation and a centralized JSON exception response format.
- **API documentation:** Swagger UI / OpenAPI, including bearer-token authentication support.
- **Data integrity:** JPA entity relationships, transactional order creation/status updates, and optimistic locking via `@Version` on the base entity.
- **Frontend:** React pages for login, dashboard, products, categories, orders, and user-role management, with role-aware controls.

## Technology stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3.5.x, Spring Web, Spring Security, Spring Data JPA, Hibernate, Jakarta Validation |
| Authentication | JJWT, BCrypt password encoder |
| Database | MySQL |
| Frontend | React, React Router, Axios, Vite |
| API documentation | springdoc-openapi / Swagger UI |
| Build and tests | Maven, JUnit 5, Spring Boot Test, Spring Security Test |

## Architecture

```text
Browser (React + Vite)
        |
        | HTTP / JSON; JWT sent in Authorization: Bearer <token>
        v
Spring Boot REST API (port 8080)
  Controllers -> Services -> Repositories -> JPA/Hibernate
        |                                  |
        | Spring Security + JWT             v
        |                               MySQL
        v
Role-based endpoint authorization
```

The frontend is a separate application. It calls the backend REST API; business rules and authorization must be enforced by the backend, not only by hiding frontend controls.

## Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 20.19+ or 22.12+ recommended for the Vite version in this project
- npm
- MySQL 8.x

## Local setup

### 1. Get the source

Clone the repository or extract the project archive. The backend `pom.xml` is in the project root and the React application is in `frontend/`.

### 2. Create the database

```sql
CREATE DATABASE brewmaster_db;
```

### 3. Configure the backend

The default profile is `dev`. Configure local settings in `src/main/resources/application-dev.yaml` or supply environment variables:

| Variable | Development default | Purpose |
|---|---|---|
| `BREWMASTER_DB_URL` | `jdbc:mysql://localhost:3306/brewmaster_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | JDBC URL |
| `BREWMASTER_DB_USERNAME` | `root` | Local MySQL username |
| `BREWMASTER_DB_PASSWORD` | `root` | Local MySQL password; change to match your machine |
| `BREWMASTER_JWT_SECRET` | Local-development-only fallback | JWT signing key; set a private secret for every non-local environment |
| `BREWMASTER_JWT_EXPIRATION` | `3600000` | Token lifetime in milliseconds (one hour) |
| `BREWMASTER_FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed browser origin for CORS |

Example PowerShell session (replace the database password with your own):

```powershell
$env:BREWMASTER_DB_USERNAME = "root"
$env:BREWMASTER_DB_PASSWORD = "your-local-mysql-password"
$env:BREWMASTER_JWT_SECRET = "replace-with-a-private-secret-of-at-least-32-characters"
$env:BREWMASTER_FRONTEND_ORIGIN = "http://localhost:5173"
```

For local development, the existing defaults preserve the common `root` / `root` setup. **Never use development defaults or commit real credentials in a deployed environment.** Use a long, random JWT signing secret stored in your environment/secret manager.

### 4. Start the backend

From the project root:

```bash
mvn spring-boot:run
```

The API listens on `http://localhost:8080` by default. Spring creates the four role records (`ADMIN`, `MANAGER`, `CASHIER`, `BARISTA`) at startup if they do not exist. It does **not** create a default administrator account. Public registration assigns the `BARISTA` role; provision an administrator securely for local testing rather than relying on a shared default account.

### 5. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The frontend API base URL defaults to `http://localhost:8080`. To change it, create `frontend/.env.local` based on `frontend/.env.example` and set `VITE_API_BASE_URL`. Vite environment values are public client-side configuration; never put secrets in frontend environment variables.

### 6. Open API documentation

With the backend running, open:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Use the **Authorize** control in Swagger UI to provide a JWT as a bearer token when testing secured endpoints.

## Main API routes

| Route | Purpose | Access (high level) |
|---|---|---|
| `/api/auth/register` | Register a user | Public; new users receive BARISTA role |
| `/api/auth/login` | Obtain a JWT | Public |
| `/api/users/**` | User listing and role administration | ADMIN |
| `/api/products/**` | Product operations | Reads: all four roles; writes: ADMIN only |
| `/api/categories/**` | Category operations | Reads: all four roles; writes: ADMIN, MANAGER |
| `/api/orders/**` | Order management | Reads: all four roles; create: ADMIN, MANAGER, CASHIER; status updates: ADMIN, MANAGER, BARISTA; delete: ADMIN, MANAGER |
| `/api/dashboard/**` | Business summary | ADMIN, MANAGER |

Exact route behavior and response models are documented in Swagger UI. The backend remains the source of truth for authorization.

## Tests and build

Backend tests:

```bash
mvn test
```

Package the backend:

```bash
mvn clean package
```

Frontend lint and production build:

```bash
cd frontend
npm run lint
npm run build
```

The current automated backend test suite is small (4 tests were passing in the latest reported local run: 1 application-context test and 3 order-service tests). This is a useful baseline, but it does not replace broader repository, controller, authentication, authorization, and validation tests. Expand coverage as part of continued hardening.

## Security and deployment notes

- JWT tokens are bearer credentials; do not log or share them.
- Set database credentials and the JWT secret through environment variables/secret management outside local development.
- Configure the exact deployed frontend origin in `BREWMASTER_FRONTEND_ORIGIN`.
- The `dev` profile uses Hibernate `ddl-auto: update` and SQL logging for local development. The `prod` profile uses `ddl-auto: validate`; apply reviewed database migrations before production use.
- The project is not yet represented as a fully production-hardened deployment. Before public deployment, add comprehensive automated tests, managed schema migrations, HTTPS, monitoring/logging, and deployment-specific security configuration.

## Screenshots

Add current screenshots of Login, Dashboard, Products, Categories, Orders, and User Management here before publishing the repository. Avoid screenshots containing real personal data, passwords, or JWTs.

## Roadmap

Potential future enhancements (not currently implemented): inventory/low-stock alerts, audit trails, automated integration/security tests, Docker Compose for the API and database, CI checks, and cloud deployment.
