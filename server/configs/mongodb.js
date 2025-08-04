import mongoose from 'mongoose'
import 'dotenv/config.js'

// Connect to the MongoDB database

const connectDB = async () =>{
    mongoose.connection.on('connected',()=> console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/skillbridge`)
}

export default connectDB