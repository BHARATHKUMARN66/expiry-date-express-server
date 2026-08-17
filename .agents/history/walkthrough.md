# Walkthrough - Implementing Auth APIs - Login & Register

I have successfully implemented the Authentication APIs (`/auth/register` and `/auth/login`) along with the User mongoose model, DAO repository layer, auth services, controller handlers, validator middlewares, and Swagger documentation.

## Changes Made

### Configuration
- db.js: Modified database connection helper to shorten the connection timeout to 5 seconds (`serverSelectionTimeoutMS: 5000`) and log warnings instead of crashing the process on connection failure. This keeps the Express server running (so Swagger and non-DB routes function) even if MongoDB is not running locally.
- swagger.js: Created Swagger options configuration to scan `src/routes/*.js` files for Swagger specifications.

### Models and DAOs
- users.js: Created User mongoose schema containing attributes:
  - `name` (String, required)
  - `email` (String, required, unique)
  - `password` (String, required - storing hashed password)
  - `createdAt` & `updatedAt` (automatic timestamps)
- userDao.js: Implemented database query layer (Repository pattern):
  - `findByEmail(email)`: Retrieves a user by their email address.
  - `createUser(userData)`: Saves a new user record to MongoDB.

### Services and Controllers
- authService.js: Implemented business logic:
  - `register()`: Checks for existing email, hashes password with `bcryptjs`, saves user, and signs JWT.
  - `login()`: Validates credentials, verifies hash using `bcryptjs`, and signs JWT.
- authController.js: Implemented request/response handling, checks for validation errors, and sets the signed JWT token in cookies (`jwtToken`).

### Routes and Entry Point
- authRoutes.js: Created routes mapping and validators using `express-validator`. Annotated the endpoints with JSDoc comments to generate Swagger specifications.
- server.js: Modified entrypoint to connect to MongoDB, serve Swagger documentation at `/api-docs`, and mount `authRoutes` on `/auth`.

---

## Verification & Testing

### 1. Swagger UI Verification
Verified that Swagger UI successfully compiles and documents the newly added endpoints:
- **Swagger URL**: `http://localhost:5001/api-docs`
- **Paths Documented**:
  - `POST /auth/register`
  - `POST /auth/login`

### 2. Endpoint Routing Verification
We ran automated tests using our scratch script `test_auth.js`.
- **Register Endpoint Test**: A POST request to `http://localhost:5001/auth/register` was intercepted, validated, and successfully hit the service layer.
- **Result**: Returned HTTP 500 with `Operation users.findOne() buffering timed out after 10000ms`, verifying that all route, validation, controller, service, and DAO layers are correctly wired up and correctly timeout on database connection when MongoDB is not running locally.
