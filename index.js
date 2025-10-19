// configuration
require("dotenv").config();
require("express-async-errors");

// express
const express = require("express");
const app = express();

// rest of the packages
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");

// database
const connectDB = require("./db/connect");

//  routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const foodRoutes = require("./routes/foodRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
const limiter = rateLimiter({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
    : 60 * 1000,
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 15,
  message: "Too many requests from this IP, please try again later.",
});
app.set("trust proxy", 1);
app.use(limiter);
app.use(helmet());
app.use(cors(corsOptions));
app.use(xss());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/food", foodRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
