import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { createAdminAccount } from "../controllers/admin.controller.js";




const connectDB = async  () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host} `);
       
        // createAdminAccount()
        
    } catch (error) {
        console.log("error is :  ",error);
        process.exit(1);
        
    }
  
}

export default connectDB;