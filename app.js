// Import required modules and configurations
import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import sessions from "express-session";

// Import custom modules for database models, API routes, and authentication
import models from "./models/models.js";
import apiRouter from "./routes/api/api.js";
import authProvider from "./auth/AuthProvider.js";

// Initialize the Express app
const app = express();

// Initialize oneDay
const oneDay = 1000 * 60 * 60 * 24;

// Setting up middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(sessions({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set this to true on production
    maxAge: oneDay,
  }
}));

// Middleware to attach the models to every request
app.use((req, res, next) => {
  req.models = models;
  next();
});

// API endpoint router
app.use("/api", apiRouter);

// Sign in endpoint
app.get("/signin", authProvider.login({
  scopes: [],
  redirectUri: process.env.REDIRECT_URI,
  successRedirect: "/"
}));

// Sign out endpoint
app.get("/signout", authProvider.logout({
  postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI
}));

// Redirect endpoint
app.post("/redirect", authProvider.handleRedirect());


export default app;