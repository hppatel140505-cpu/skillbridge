import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import { rawBodyBuffer } from "./middlewares/rawBody.js";
import { clerWebhooks, stripeWebhooks } from "./controller/webhooks.js";

import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// DB & Cloudinary
await connectDB();
await connectCloudinary();

// Middleware
app.use(cors());

// ================= WEBHOOKS ================= //

// Stripe → raw body
app.post("/api/webhooks/stripe", express.raw({ type: "application/json", verify: rawBodyBuffer }), stripeWebhooks);

// Clerk → json
app.post("/api/webhooks/clerk", express.json(), clerWebhooks);

// ================= API ROUTES ================= //
app.use(express.json());
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API running ✅"));

// ================= SERVER ================= //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
