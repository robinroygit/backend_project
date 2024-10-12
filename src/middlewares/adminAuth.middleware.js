

import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";




export const authenticateAdmin = asyncHandler(async(req, _, next) => {


    try {
        
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401,"unauthorized request -- !")
        }
      
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (decodedToken.role !== 'admin') {
        return res.status(403).json({ message: 'Access restricted to admins only' });
      }
    
    const user = User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new ApiError(401, "invalid access token")
    }
    
    req.user = user;
    next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
        
    }

})