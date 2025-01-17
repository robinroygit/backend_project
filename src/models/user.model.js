import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt" ;
import jwt from "jsonwebtoken";

import { configDotenv } from "dotenv";
configDotenv({path:"./.env"});


const userSchema = new mongoose.Schema(
    {
        // username: {
        //     type: String,
        //     required: function () {
        //         return !this.googleId; // Password is only required if user is not using Google login
        //       },
        //     unique: true,
        //     losercase: true,
        //     trim: true,
        //     index: true
        // },
        firstname:{
            type:String,
            required:true,
        },
        lastname:{
            type:String,
            required:true,
        },
        email: {
            type: String,
            required: true,
            // unique: true,
            losercase: true,
            trim: true,
        },
        phoneNo:{
            type:String,
        },
        password:{
            type:String,
            required: function () {
                return !this.googleId; // Password is only required if user is not using Google login
              },
        },
        googleId: {
            type: String, // Store Google ID for users who log in via Google
            unique: true,
            sparse: true, // Allows for either regular login or Google login without a conflict
          },
        role:{
            type:String,
            required:true,
            enum:['user','admin'],
            default:'user'        
        },
        isActive:{
            type:Boolean,
            default:true,
        },
        refreshToken:{
            type:String
        }

    },{timestamps:true}

)



// use of hooks --- function to run before saving the data password
userSchema.pre("save", async function (next){

    if(!this.isModified("password")) 
        return next();

    //hashing the password before saving to db

        this.password = await bcrypt.hash(this.password, 10)
        next()
})


// creating methods ------------

// checking if the password is valid 
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

//GENERATE ACCESS TOKEN USING JWT 
userSchema.methods.generateAccessToken =  function(){
    
    // console.log("-----=====----",process.env.ACCESS_TOKEN_SECRET);


  return   jwt.sign(
        {
            _id:this._id,
            role:this.role,
            username:this.username,
        },
         process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )


    // return jwt.sign(
    //     {
    //         _id: this._id,
    //         email: this.email,
    //         username: this.username,
    //         fullName: this.fullName
    //     },
    //     process.env.ACCESS_TOKEN_SECRET,
    //     {
    //         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    //     }
    // )
}


//GENERATE REFRESH TOKEN USING JWT 
userSchema.methods.generateRefreshToken =  function(){



return jwt.sign(
    {
        _id: this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)

}


//exporting user 
export const User = mongoose.model("User", userSchema);