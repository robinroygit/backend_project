import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";




const verifyJWT = asyncHandler(async(req, _, next) => {


    try {
        
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401,"unauthorized request -- !")
        }
      
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new ApiError(401, "invalid access token")
    }
    
    req.user = user;
    next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
        
    }

})


const authenticateAdmin = asyncHandler(async(req, _, next) => {


    try {
        
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401,"unauthorized request -- !")
        }
      
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    
    if (decodedToken.role !== 'admin') {
        throw new ApiError(403, "Access restricted to admins only")
      }



    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    // console.log('--____+++>',user);
    
    if(!user){
        throw new ApiError(401, "invalid access token")
    }
    
    // console.log('--____+++>',user);

    req.user = user;
    next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
        
    }

})

export {
     verifyJWT,
      authenticateAdmin 
    };