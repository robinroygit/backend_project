
import dotenv from 'dotenv';
dotenv.config({path:"./.env"});

import connectDB from "./db/index.js";

// dotenv.config({path:"./env"})

connectDB();







//2nd way to connect to db
/*
import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants";

const app = express();

;( async() => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (err) => {
            console.log("error : ",err);
            throw err;
       })

       app.listen(process.env.PORT, () => {
        console.log("listening on port : ",process.env.PORT);
         
       })

    } catch (error) {
        console.log("error : ",error);
        throw error
    }
  
})()

*/