// server.js / index.js
import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./configs/mongodb.js";
import { clerWebhooks, stripeWebhooks } from "./controller/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import bodyParser from "body-parser";
import { rawBodyBuffer } from "./middlewares/rawBody.js";

const app = express();

// -------------------------
// 1️⃣ Database & Cloudinary connect
await connectDB();
await connectCloudinary();

// -------------------------
// 2️⃣ CORS
app.use(cors());

// -------------------------
// 3️⃣ Webhooks
// Stripe webhook ke liye RAW body parser
app.post(
  "/api/webhooks/stripe",
  bodyParser.raw({ type: "application/json", verify: rawBodyBuffer }),
  stripeWebhooks
);

// Clerk webhook ke liye normal JSON body parser
app.post("/api/webhooks/clerk", express.json(), clerWebhooks);

// -------------------------
// 4️⃣ Body parser for large payloads (videos/images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// -------------------------
// 5️⃣ Clerk middleware
app.use(clerkMiddleware());

// -------------------------
// 6️⃣ Routes
app.get("/", (req, res) => res.send("API working ✅"));

// Educator Routes (add course, upload lecture video, add lecture, dashboard)
app.use("/api/educator", educatorRouter);

// Course Routes (get courses, etc.)
app.use("/api/course", courseRouter);

// User Routes
app.use("/api/user", userRouter);

// -------------------------
// 7️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
