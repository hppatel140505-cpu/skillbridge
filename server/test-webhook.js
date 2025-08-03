import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './configs/mongodb.js'
import User from './model/User.js'

// Test script to verify webhook setup
async function testWebhookSetup() {
    console.log('=== WEBHOOK SETUP TEST ===')
    
    // Check environment variables
    console.log('CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET ? 'SET' : 'MISSING')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING')
    
    // Test database connection
    try {
        await connectDB()
        console.log('✅ Database connected successfully')
        
        // Test User model
        const userCount = await User.countDocuments()
        console.log('📊 Current users in database:', userCount)
        
        // Test creating a user manually
        const testUser = {
            _id: 'test-user-' + Date.now(),
            email: 'test@example.com',
            name: 'Test User',
            imageUrl: 'https://example.com/image.jpg'
        }
        
        await User.create(testUser)
        console.log('✅ Test user created successfully')
        
        // Clean up test user
        await User.findByIdAndDelete(testUser._id)
        console.log('✅ Test user cleaned up')
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message)
    }
    
    console.log('\n=== WEBHOOK URL CHECK ===')
    console.log('Make sure your Clerk webhook URL is set to:')
    console.log('https://your-domain.com/api/webhooks/clerk')
    console.log('\nOr for local testing:')
    console.log('http://localhost:5000/api/webhooks/clerk')
}

testWebhookSetup() 