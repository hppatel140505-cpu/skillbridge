import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './configs/mongodb.js'
import { clerWebhooks } from './controller/webhooks.js'


// Initialize Express 
const app = express()

// Connect to database
await connectDB()

// Middlewares
app.use(cors())

// Routes
app.get('/',(req,res)=>res.send("Api working"))
app.post('/clerk',express.json(),clerWebhooks)


// Port 
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is runig on port ${PORT}`);
    
})