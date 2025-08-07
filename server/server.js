import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './configs/mongodb.js'
import { clerWebhooks } from './controller/webhooks.js'
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
app.use(clerkMiddleware())

// Routes
app.get('/',(req,res)=>res.send("Api working"))
app.post('/clerk',express.json(),clerWebhooks)
app.use('/api/educator',express.json(),educatorRouter)
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)

// Port 
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is runig on port ${PORT}`);
    
})