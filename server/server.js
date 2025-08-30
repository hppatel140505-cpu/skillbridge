import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config.js";

import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { rawBodyBuffer } from "./middlewares/rawBody.js";
import { clerWebhooks, stripeWebhooks } from "./controller/webhooks.js";

import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

// ✅ Connect DB & Cloudinary
await connectDB();
await connectCloudinary();

app.use(cors());

/* ------------------- WEBHOOK ROUTES ------------------- */

// Stripe webhook → must come before express.json()
app.post(
  "/api/webhooks/stripe",
  bodyParser.raw({ type: "application/json", verify: rawBodyBuffer }),
  stripeWebhooks
);

// Clerk webhook → can use json body
app.post("/api/webhooks/clerk", express.json(), clerWebhooks);

/* ------------------- NORMAL ROUTES ------------------- */

// Normal JSON parser (after webhooks)
app.use(express.json());

// Clerk authentication middleware
app.use(clerkMiddleware());

// API routes
app.get("/", (req, res) => res.send("API working ✅"));
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

/* ------------------- SERVER ------------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
