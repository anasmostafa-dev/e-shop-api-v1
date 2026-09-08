# E-commerce RESTful API

A production-ready E-commerce core engine built with Node.js, Express, MongoDB, and Mongoose. The backend is organized around resource-focused routes, controller-level use cases, reusable validation, centralized error handling, role-based authorization, and operationally safe order and payment workflows.

## Architecture And Engineering Practices

- **Layered backend structure:** Express routes define the HTTP contract, controllers coordinate use cases, Mongoose models own persistence concerns, middleware handles cross-cutting behavior, and shared utilities provide API errors, query features, token generation, and validation.
- **Centralized error handling:** Async controller failures are routed through a common error middleware and API error type.
- **Role-based access control:** Protected resources use JWT authentication and role authorization for users, managers, and administrators.
- **Query scalability:** List endpoints use reusable filtering, sorting, field selection, pagination, and search features.
- **Media processing:** Product, brand, category, and user uploads are handled through dedicated upload and image-resizing middleware.
- **Operational concerns:** Compression, CORS, structured request logging in development, environment-based configuration, and generated API documentation are included in the server setup.

## Key Architectural And Security Features

### Atomic Inventory Integrity

Checkout inventory changes use MongoDB `bulkWrite` operations with `$gte` stock guard filters. Each update only decrements a product when the database still has sufficient quantity, preventing overselling caused by concurrent checkout requests. The same bulk operation updates `quantity` and `sold` together for each cart item.

### Asynchronous Payment Gateway

Card checkout creates a Stripe Checkout Session and completes order creation asynchronously from Stripe's webhook event. The `/webhook-checkout` endpoint uses `express.raw({ type: 'application/json' })`, allowing Stripe's `stripe-signature` header to be verified with `stripe.webhooks.constructEvent` before the payment event is trusted.

### OWASP Security Baseline

The API is designed around common OWASP API hardening practices:

- Request payload validation with `express-validator` before controller execution.
- NoSQL injection sanitization for untrusted request values.
- HTTP Parameter Pollution protection with HPP handling.
- Security HTTP headers through Helmet.
- Rate limiting for abuse and credential-stuffing resistance.
- JWT authentication, role authorization, least-privilege route access, and centralized error responses.

Keep the sanitization, HPP, Helmet, and rate-limiting middleware enabled in every production deployment and review their configuration when adding new public endpoints.

### Address Snapshotting And Decoupling

Order creation accepts either a saved user `addressId` or a custom `shippingAddress`. When a saved address is selected, its relevant fields are copied into the order as a snapshot. Orders therefore remain historically accurate and decoupled from later edits to a user's address book.

## Interactive API Documentation

After starting the API, open the interactive Swagger UI at:

```text
http://localhost:8000/api-docs
```

Regenerate the OpenAPI document after route or annotation changes with `npm run swagger` from the `backend/` directory.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Stripe Checkout and Stripe Webhooks
- Swagger Autogen and Swagger UI Express
- `express-validator`
- Helmet
- `express-rate-limit`
- CORS, compression, Morgan, Multer, Sharp, JWT, and bcryptjs

## Environment Variables

Create `backend/.env` from this example. Never commit real credentials, database connection strings, JWT secrets, mail passwords, or Stripe keys.

```dotenv
PORT=8000
NODE_ENV=development

# Database and public asset URLs
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
BASE_URL=http://localhost:8000

# Authentication
SECRET_KEY=replace-with-a-long-random-secret
EXPIRES_IN_TOKEN=90d
OTP_SECRET=replace-with-a-separate-random-secret

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=replace-with-mail-password

# Stripe
STRIPE_SECRET=sk_test_replace-me
STRIPE_WEBHOOK_SECRET=whsec_replace-me
```

For local Stripe webhook testing, configure Stripe to send `checkout.session.completed` events to `/webhook-checkout` and use the signing secret generated for that endpoint.

## Installation And Running

Requirements: Node.js 18+ and a reachable MongoDB deployment or local MongoDB instance.

```bash
cd backend
npm install
npm run swagger
npm start
```

The API starts on `http://localhost:8000` by default. For development with automatic restarts:

```bash
npm run start:dev
```

For a production-mode process:

```bash
npm run start:prod
```

## API Surface

The versioned API is mounted under `/api/v1` and includes resources for:

- Authentication
- Users and addresses
- Products, categories, subcategories, and brands
- Cart and wishlist management
- Coupons
- Orders and Stripe checkout
- Reviews

Use Swagger UI for the authoritative request, response, authorization, and route details.

## Author

**Anas Mostafa** | Full-Stack Developer
