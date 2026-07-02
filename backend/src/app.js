import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//express => (err,req,res,next) next is flag, used for middleware

const app = express();

// configure cors for retrival of requests from valid source only(i.e. frontend)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*" ? true : (process.env.CORS_ORIGIN || "http://localhost:5173"),
    credentials: true,
  })
);

// accepting data on server
app.use(express.json({ limit: "16kb" }));

// for data from url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// for storing files on a folder
app.use(express.static("public"));

// TO perfrom CRUD over cookies on browser
app.use(cookieParser());

//Routes import
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// URL create like this: https://localhost:8000/api/v1/users/register

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors: err.errors || [],
  });
});

export { app };
