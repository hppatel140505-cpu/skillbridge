import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controller/webhooks.js'

// Initialize Express 
const app = express()

// Connect to database
await connectDB()

// Middlewares 
app.use(cors())
app.use(express.json())

// Routes 
app.get('/',(req,res)=>res.send("API working"))
app.post('/api/webhooks/clerk', clerkWebhooks)

//Port
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);

})