import mongoose from "mongoose";


// Connect to the mongoDB database

const connectDB = async ()=>{
    mongoose.connection.on('connected',()=> console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/skillbridge`)

}

export default connectDB