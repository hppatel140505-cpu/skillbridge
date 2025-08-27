// index.js / server.js

import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./configs/mongodb.js";
import { clerWebhooks, stripeWebhooks } from "./controller/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
import bodyParser from "body-parser";
import { rawBodyBuffer } from "./middlewares/rawBody.js";

const app = express();

// DB & Cloudinary connect
await connectDB();
await connectCloudinary();

app.use(cors());

// ✅ Stripe webhook ke liye RAW body parser (sirf stripe route ke liye)
app.post(
  "/api/webhooks/stripe",
  bodyParser.raw({ type: "application/json", verify: rawBodyBuffer }),
  stripeWebhooks
);

// ✅ Clerk webhook ke liye normal json body parser
app.post("/api/webhooks/clerk", express.json(), clerWebhooks);

// ✅ Baaki routes ke liye JSON parser
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => res.send("Api working ✅"));
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
