const path = require("path");

// to use .env file
const dotenv = require("dotenv");

dotenv.config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");
const compression = require("compression");

const ApiError = require("./utils/apiError");
const globalErrorHandling = require("./middlewares/errorMiddleware");

// Routes
const mountRoutes = require("./routes/index");
const { webhookCheckout } = require("./controllers/orderController");

const app = express();

// enable other domains to access your applications
app.use(cors());
app.options("/{*splat}", cors());

// compress all response
app.use(compression());

// Checkout webhook
app.post("webhook-checkout", express.raw({ type: 'application/json' }), webhookCheckout);

app.set("query parser", "extended");

// connect to database
connectDB();

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

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
