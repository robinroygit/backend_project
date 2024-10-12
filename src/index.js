import dotenv from "dotenv"

import connectDB from "./db/index.js"
import {app} from "./app.js"
// import { createAdminAccount } from "./controllers/admin.controller.js";

dotenv.config({path:"./.env"});


connectDB()
.then(
  
  app.listen(process.env.PORT || 8000,  () => {
      console.log("⚙️ Server running at port : ", process.env.PORT || 8000);
  })
)
.catch( (err) => {
  //connection error 
  console.log("MONGO DB connection failed : ",err);
  
})













// import dotenv from 'dotenv';
// dotenv.config({ path: "./.env" });

// import connectDB from "./db/index.js";
// import { app } from './app.js';

// // dotenv.config({path:"./env"})

// connectDB()
//   .then(() => {
//     //listening to port
//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server running at port : ${process.env.PORT || 8000} `);
//     })

//     //handleing error if any
//     app.on("error", (err) => {
//       console.log("error : ", err);
//       throw err;

//     })

//   })
//   .catch((err) => {
//     // handle error is mongo db failed
//     console.log("MONGO DB connection failed : ", err);
//   })







// //2nd way to connect to db
// /*
// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants";

// const app = express();

// ;( async() => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (err) => {
//             console.log("error : ",err);
//             throw err;
//        })

//        app.listen(process.env.PORT, () => {
//         console.log("listening on port : ",process.env.PORT);
         
//        })

//     } catch (error) {
//         console.log("error : ",error);
//         throw error
//     }
  
// })()

// */