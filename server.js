const path = require("path");
const dotenv = require("dotenv");

// to use .env file
dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const ApiError = require("./utils/apiError");
const globalErrorHandling = require("./middlewares/errorMiddleware");

// Routes
const mountRoutes = require("./routes/index");
const { webhookCheckout } = require("./controllers/orderController");

const app = express();

// connect to database
connectDB();

// Security headers
app.use(helmet());

// App configuration
app.set("query parser", "extended");

// enable other domains to access your applications
app.use(cors());
app.options("/{*splat}", cors());
app.use(compression());

// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
app.use("/api", limiter);

// Checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout,
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middlewares, limit request size
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// To apply sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({ whitelist: ["price", "sold", "quantity", "ratingsQty", "ratingsAvg"] }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Mount routes
mountRoutes(app);

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware calling
app.use(globalErrorHandling);

// Server port running
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App Running on port: ${port}`);
});

// Global error outside express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shutting down....");
    process.exit(1);
  });
});
