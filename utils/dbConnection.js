import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()


const connectDB = async()=>{
    
    try{
        const connRef = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connection to ${connRef.connection.host} Successfull`);
        return true;
    }catch(error){
        console.log(`Some error occured while connecting to the database: ${error}`);
        return false;
    }
}


export default connectDB;

