import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controller/webhooks.js'

const app = express()

// Connect to MongoDB
await connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send('API is working'))
app.post('/api/webhooks/clerk', clerkWebhooks)
app.get('/users', async (req, res) => {
  const users = await import('./model/User.js').then(mod => mod.default.find())
  res.json(users)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
