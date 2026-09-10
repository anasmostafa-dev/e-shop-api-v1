# E-commerce RESTful API

A production-ready E-commerce core engine built with Node.js, Express.js, MongoDB, and Mongoose. The backend is structured for reliable commerce workflows rather than basic CRUD: authenticated roles, validated input, reusable query features, inventory-safe checkout, asynchronous payment processing, media handling, and centralized error management.

## Engineering Overview

The API is organized into focused layers:

- **Routes:** Define versioned HTTP resources and compose authentication, authorization, upload, and validation middleware.
- **Controllers:** Coordinate application use cases such as checkout, order creation, authentication, password recovery, catalog management, and reviews.
- **Models:** Define Mongoose persistence schemas and document behavior for users, products, carts, orders, coupons, reviews, and catalog resources.
- **Middleware:** Provide request validation, image processing, authentication, role authorization, sanitization, rate limiting, and global error handling.
- **Utilities:** Provide API errors, reusable query features, token generation, email delivery, and user-data sanitization.

The API is mounted under `/api/v1` and serves catalog, identity, cart, wishlist, address, coupon, review, and order workflows.

## Core Architecture And Security

### Atomic Inventory Integrity

Order creation uses MongoDB `bulkWrite` operations to update every cart item efficiently. Each inventory update includes a `$gte` stock guard filter, so a product is decremented only when the database still has enough quantity:

```javascript
{
  filter: { _id: item.product, quantity: { $gte: item.quantity } },
  update: { $inc: { quantity: -item.quantity, sold: item.quantity } }
}
```

This database-side guard is concurrency-safe at the individual update level and prevents a checkout request from blindly driving stock below the requested quantity during concurrent activity.

### Asynchronous Stripe Payments

Card checkout is intentionally asynchronous:

1. An authenticated customer requests a Stripe Checkout Session.
2. Stripe processes the payment outside the API request lifecycle.
3. Stripe calls `/webhook-checkout` after checkout completion.
4. The API verifies the `stripe-signature` header using `stripe.webhooks.constructEvent`.
5. The paid order is created from the verified event.

The webhook route uses `express.raw({ type: "application/json" })` before JSON parsing. Preserving the raw request bytes is required for Stripe signature verification.

### OWASP-Oriented Request Hardening

The server applies multiple defense-in-depth controls:

- **Helmet:** Security-related HTTP headers.
- **Rate limiting:** A shared API limiter restricts request volume per IP.
- **NoSQL injection protection:** `express-mongo-sanitize` removes MongoDB operator injection from body, params, and query data.
- **HTTP Parameter Pollution protection:** `hpp` is enabled with an explicit allowlist for supported repeated query fields.
- **Input validation:** `express-validator` validators run before resource controllers.
- **Request-size limits:** JSON payloads are limited to reduce abuse and accidental oversized requests.
- **Authentication and authorization:** JWTs can be supplied through the Bearer header or an HTTP-only cookie, with role-based access checks.
- **Cookie protections:** Authentication cookies use `httpOnly` and `sameSite: "strict"`; production cookies also require `secure` transport.
- **Sensitive-data handling:** Password and reset-token fields are removed from user responses through sanitization helpers.
- **Centralized errors:** Application errors are normalized by the global error middleware.

### Address Snapshotting And Decoupling

Order creation supports both saved and one-time shipping addresses:

- Send `addressId` to select an address belonging to the authenticated user.
- Send `shippingAddress` to provide a custom address snapshot.

When a saved address is selected, the relevant address fields are copied into the order. The order remains historically accurate and independent of later changes to the user's address book.

### Additional Operational Practices

- Compression is enabled for responses.
- CORS is configured for cross-origin clients.
- Morgan request logging is enabled in development mode.
- Uploaded assets are served from the backend uploads directory.
- Product, category, brand, and user image processing is isolated in upload middleware.
- Reusable filtering, sorting, field selection, pagination, and search support is provided through API feature utilities.

## Interactive API Documentation

Swagger UI is available at:

```text
http://localhost:8000/api-docs
```

The generated OpenAPI document is stored in `backend/swagger-output.json`. After changing routes or Swagger annotations, regenerate it from the backend directory:

```bash
npm run swagger
```

Use the Swagger UI as the authoritative reference for available endpoints, request parameters, authentication requirements, and response shapes.

## Tech Stack

- Node.js
- Express.js 5
- MongoDB
- Mongoose
- Stripe Checkout and Stripe Webhooks
- Swagger Autogen
- Swagger UI Express
- `express-validator`
- `express-mongo-sanitize`
- `hpp`
- Helmet
- `express-rate-limit`
- JSON Web Tokens
- bcryptjs
- Multer and Sharp
- Nodemailer
- CORS, compression, and Morgan

## Environment Variables

Create `backend/.env` from the following template. Never commit real database credentials, email passwords, JWT secrets, or Stripe keys.

```dotenv
PORT=8000
NODE_ENV=development

# Database and public asset URLs
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
BASE_URL=http://localhost:8000

# Authentication
SECRET_KEY=replace-with-a-long-random-secret
EXPIRES_IN_TOKEN=90d
JWT_COOKIE_EXPIRES_IN=90
OTP_SECRET=replace-with-a-separate-random-secret

# Email delivery
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=replace-with-mail-password

# Stripe
STRIPE_SECRET=sk_test_replace-me
STRIPE_WEBHOOK_SECRET=whsec_replace-me
```

`STRIPE_WEBHOOK_SECRET` must be the signing secret for the webhook endpoint configured in Stripe. In production, use a managed secret store or deployment secret configuration rather than committing `.env` files.

## Installation And Running

### Prerequisites

- Node.js 18 or newer
- MongoDB, either local or hosted
- Stripe credentials for payment workflows
- SMTP credentials if testing password-reset email delivery

### Install And Start

```bash
cd backend
npm install
npm run swagger
npm start
```

The API listens on `http://localhost:8000` by default. Available scripts:

```bash
npm run start:dev   # Development process with nodemon
npm start           # Standard Node.js process
npm run start:prod  # Production-mode process
npm run swagger     # Regenerate swagger-output.json
```

Set `PORT` and `NODE_ENV=production` through the deployment environment for production. Confirm that the application can reach `MONGO_URI`, that `BASE_URL` reflects the deployed public URL, and that Stripe is configured to send `checkout.session.completed` events to `/webhook-checkout`.

## Authentication Model

Authentication responses issue a JWT and set an HTTP-only `token` cookie. Protected routes accept either:

```http
Authorization: Bearer <jwt>
```

or the authentication cookie. Role authorization is applied to administrative, manager, and customer workflows according to the route definition.

## Main Resource Groups

- `/api/v1/auth` - Signup, login, logout, password recovery, and reset flows
- `/api/v1/users` - User administration and self-service account operations
- `/api/v1/addresses` - Authenticated address management
- `/api/v1/products` - Product catalog and media operations
- `/api/v1/categories` - Categories and nested subcategories
- `/api/v1/subcategories` - Subcategory operations
- `/api/v1/brands` - Brand management
- `/api/v1/cart` - Cart items, quantities, and coupons
- `/api/v1/wishlist` - Customer wishlist operations
- `/api/v1/coupons` - Coupon administration
- `/api/v1/reviews` - Product reviews
- `/api/v1/orders` - Cash orders, Stripe checkout, payment state, status, and cancellation
- `/webhook-checkout` - Verified Stripe checkout completion webhook

## Author

**Anas Mostafa** | Full-Stack Developer
