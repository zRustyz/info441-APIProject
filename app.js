import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import sessions from "express-session";

import models from "./models.js";
import apiRouter from "./routes/api/api.js";
import authProvider from "./auth.js";