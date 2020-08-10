const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const moment = require("moment");
require("moment-duration-format");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB().catch((err) => {
  console.log(err);
  process.exit(1); // Close & exit if connection to the database fails.
});

// Route files
const cabinets = require("./routes/cabinets");

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("short"));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 480,
  headers: true,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Mount routers
app.use("/api/v1/cabinets", cabinets);

app.use(errorHandler);

app.get("/*", (req, res) => {
  const uptime = moment
    .duration(process.uptime(), "seconds")
    .format("w [weeks] d [days], h [hrs], m [min], s [sec]");
  const started = moment()
    // .locale("el") // to display date in greek
    .subtract(process.uptime(), "seconds")
    .format("llll");
  return res.status(200).send({
    succes: true,
    data: {
      uptime,
      started,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1)); // commented out because I want the app to restart, which is what PM2 will do :~)
});