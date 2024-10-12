import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import path from "path"
// import { fileURLToPath } from 'url';
// import bodyParser  from 'body-parser';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express ();


// app.use(cors({origin:process.env.CORS_ORIGIN,credentials:true}));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// app.use(express.static(path.join(__dirname,'build')));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public/build"))
app.use(cookieParser())
// Middleware to parse incoming requests
// app.use(bodyParser.json({ limit: '10mb' })); // Set a higher limit for image data

//import routes

import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import { ApiError } from "./utils/apiErrors.js";

app.use("/api/v1/users",userRouter);

app.use("/api/v1/admin",adminRouter);

// app.get('/index', (req, res) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });
  

// Error-handling middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        // Use the `toJSON` method to return the error as JSON
        return res.status(err.statusCode).json(err.toJSON());
    }

    // For other errors, return a generic 500 error
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});



export {
    app
}





















// import express from "express"
// import cors from "cors"
// const app = express()

// //handle cors origin problems
// app.on(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// }))

// // use middlewares 
// app.use(express.json({limit:"16kb"}));
// app.use(express.urlencoded({extended:true,limit:"16kb"}))
// app.use(express.static("public"))

// export {app}