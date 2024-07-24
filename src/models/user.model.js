import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt" ;
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            losercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            losercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required:true
        },
        coverImage: {
            type: String, //cloudinary url

        },
        watchHistory:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        password:{
            type:String,
            required:[true,"Password is required!"]
        },
        refreshToken:{
            type:String
        }

    },{timestamps:true}
)

// use of hooks --- function to run before saving the data password
userSchema.pre("Save", async function (next){

    if(!this.isModified("password")) 
        return next();

    //hashing the password before saving to db
        this.password = await bcrypt.hash(this.password,10);
        next();
})


// creating methods ------------
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    //GENERATE ACCESS TOKEN USING JWT 
  return   jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){
        //GENERATE REFRESH TOKEN USING JWT 
  return   jwt.sign(
    {
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


//exporting user 
export const User = mongoose.model("user", userSchema);