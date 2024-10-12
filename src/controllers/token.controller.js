import {Coupon} from '../models/coupon.model.js';  
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { UserTokens } from '../models/userToken.model.js';
import { UserCoupon } from '../models/userCoupon.model.js';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";





const getUserTokens = asyncHandler( async (req, res) => {
    const { userId } = req.params; // Assuming userId is passed as a URL parameter
  
    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
  
    // Fetch all tokens for the user
    const userTokens = await UserTokens.find({ userId: user._id }).lean();
  
    if (!userTokens.length) {
      return res.status(200).json(
        new ApiResponse(401, [], "No tokens found for this user.")
      );
    }
  
    // Format response to include relevant details
    return res.status(200).json(
      new ApiResponse(200, userTokens, "User tokens retrieved successfully.")
    );
  });

  const getAllUserTokens = asyncHandler(async (req, res) => {
    // Fetch all user tokens from the database
    const allUserTokens = await UserTokens.find({}).lean();
  
    if (!allUserTokens.length) {
      return res.status(200).json(
        new ApiResponse(200, [], "No tokens found for any users.")
      );
    }
  
    // Format the response to include the relevant details
    return res.status(200).json(
      new ApiResponse(200, allUserTokens, "All user tokens retrieved successfully.")
    );
  });

  const getUserTokensDetails = asyncHandler(async (req, res) => {
    try {
      const userId = req.user._id; // Assuming you have middleware to get the logged-in user's ID
  
      // Fetch user token details from the usertokens collection
      const userTokens = await UserTokens.aggregate([
        {
          $match: {
            userId: userId // Match the tokens for the logged-in user
          }
        },
        {
          $group: {
            _id: '$userId',
            totalTokens: { $sum: '$totalTokens' }, // Assuming each token entry has a totalTokens field
            remainingTokens: { $sum: '$remainingTokens' }, // Assuming a remainingTokens field
            tokenDetails: {
              $push: {
                type: '$tokenType', // Type of token
                expiryDate: '$expiryDate', // Expiry date of token
                usedTokens: '$usedTokens', // Tokens that have been used
                remainingTokens: '$remainingTokens' // Tokens still remaining
              }
            }
          }
        }
      ]);


      
  
      if (!userTokens || userTokens.length === 0) {
        return res.status(404).json({ message: 'No tokens found for this user' });
      }
  
      res.status(200).json({
        userId: userTokens[0]._id,
        totalTokens: userTokens[0].totalTokens,
        remainingTokens: userTokens[0].remainingTokens,
        tokenDetails: userTokens[0].tokenDetails,
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
  export {
    getUserTokens,
    getAllUserTokens,
    getUserTokensDetails
  }