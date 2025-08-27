import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './configs/mongodb.js'
import { clerWebhooks, stripeWebhooks } from './controller/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'

// Initialize Express 
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())

// ⚠️ Stripe webhook ko raw body chahiye, isliye json middleware ke pehle define karo
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// Baaki ke liye json parsing
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("Api working"))
app.post('/api/webhooks/clerk', clerWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

// Port 
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
})
