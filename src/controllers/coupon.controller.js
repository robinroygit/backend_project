
import {Coupon} from '../models/coupon.model.js';  
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { UserTokens } from '../models/userToken.model.js';
import { UserCoupon } from '../models/userCoupon.model.js';



//✅
const createCoupon = asyncHandler(async (req, res) => {
    const { name, code, description, expiry, type, value, isActive } = req.body;
  
    // Check if the required fields are present
    if (!name || !code || !expiry || !type || !value ) {
      throw new ApiError(400, "All required fields must be filled.");
    }
  
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      throw new ApiError(409, "Coupon code already exists.");
    }
  
    // Create the coupon
    const coupon = await Coupon.create({
      name,
      code,
      description,
      expiry,
      type,  // token or discount
      value, // discount percentage or token value
      isActive
    });

    const createdCoupon = await Coupon.findById(coupon._id)
    
      if (!createdCoupon) {
        throw new ApiError(500, "Something went wrong while creating coupon")
      }
    
    
      return res.status(201).json(
        new ApiResponse(200, createdCoupon, "coupon created Successfully")
      )
  
    // return res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully."));
  });
  
// ✅Get All Coupons
  const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    if (!coupons.length) {
      throw new ApiError(404, "No coupons found.");
    }
  
    return res.status(200).json(new ApiResponse(200, coupons, "Coupons retrieved successfully."));
  });
  
  //✅ Get a Single Coupon by ID
  const getCouponById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
  
    if (!coupon) {
      throw new ApiError(404, "Coupon not found.");
    }
  
    return res.status(200).json(new ApiResponse(200, coupon, "Coupon retrieved successfully."));
  });
  
  //✅ Update a Coupon
  const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, description, expiry, type, value, tries, isActive } = req.body;
  
    // Find the coupon by ID and update it
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { name, code, description, expiry, type, value, tries, isActive },
      { new: true, runValidators: true }
    );
  
    if (!updatedCoupon) {
      throw new ApiError(404, "Coupon not found or couldn't be updated.");
    }
  
    return res.status(200).json(new ApiResponse(200, updatedCoupon, "Coupon updated successfully."));
  });
  
  //✅ Delete a Coupon
  const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    // Find and remove the coupon by ID
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
  
    if (!deletedCoupon) {
      throw new ApiError(404, "Coupon not found or couldn't be deleted.");
    }
  
    return res.status(200).json(new ApiResponse(200, null, "Coupon deleted successfully."));
  });
  
  // ✅Validate a Coupon (for applying coupon at checkout or use)
  const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
  
    // Find the coupon by its code
    const coupon = await Coupon.findOne({ code });
  
    if (!coupon) {
      throw new ApiError(404, "Invalid coupon code.");
    }
  
    // Check if coupon is active
    if (!coupon.isActive) {
      throw new ApiError(400, "This coupon is inactive.");
    }
  
    // Check if the coupon has expired
    const now = new Date();
    if (now > new Date(coupon.expiry)) {
      throw new ApiError(400, "This coupon has expired.");
    }
  
    // Check if coupon has tries left
    if (coupon.tries <= 0) {
      throw new ApiError(400, "This coupon has no more tries left.");
    }
  
    // Decrease tries and update the coupon
    coupon.tries -= 1;
    await coupon.save();
  
    return res.status(200).json(new ApiResponse(200, coupon, "Coupon applied successfully."));
  });


  //✅ apply coupon for free token
const applyTokenCoupon = asyncHandler(async (req, res) => {
  const { userId, couponCode } = req.body;

  // Fetch the user from the database
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Find the coupon by code and ensure it's of type 'token'
  const coupon = await Coupon.findOne({ code: couponCode, type: 'token', isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid or inactive coupon");

  // Check if coupon has expired
  const now = new Date();
  if (coupon.expiry && coupon.expiry < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  // Check if the user has already used this coupon
  const couponUsed = await UserCoupon.findOne({ userId: user._id, couponId: coupon._id });
  if (couponUsed) {
    throw new ApiError(400, "Coupon has already been used");
  }

  // Fetch the user's token records
  let userTokens = await UserTokens.findOne({ userId });

  if (!userTokens || !userTokens.tokens.some(token => token.type === 'subscription' && token.remainingTokens>0)) {
    throw new ApiError(400, "You must be subscribed to a plan other than free to apply this coupon.");
  }

  // Check if there are active 'free' tokens
  const freeTokens = userTokens.tokens.find(token => token.type === 'free' && token.isActive && token.remainingTokens > 0);

  // If free tokens exist, coupon tokens should be inactive until free tokens are exhausted
  const couponTokenStatus = freeTokens ? false : true; // Active if no free tokens, otherwise inactive

  // Deactivate all other tokens (subscription, free, etc.) if no free tokens exist
  if (!freeTokens) {
    userTokens.tokens.forEach(token => {
      token.isActive = false;
    });
  }

  // Add a new token entry for the coupon token, make it inactive if free tokens exist
  const newCouponToken = {
    type: 'coupon',
    initialTokens: coupon.value, // Value from coupon
    remainingTokens: coupon.value,
    expiry: coupon.expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30-day expiry
    isActive: couponTokenStatus, // Set to true only if there are no active free tokens
    subscriptionId: null, // No subscription associated with this coupon
  };

  // Add the coupon token at the beginning of the user's tokens list
  userTokens.tokens.unshift(newCouponToken);

  // Save the updated user token records
  await userTokens.save();

  // Save this coupon usage in the UserCoupon model
  await UserCoupon.create({
    userId: user._id,
    couponId: coupon._id,
  });

  // Update the coupon's usage count
  coupon.usedCount = (coupon.usedCount || 0) + 1;
  await coupon.save();

  return res.status(200).json(
    new ApiResponse(200, userTokens, `Coupon applied successfully. ${coupon.value} tokens added as coupon, but will be activated after free tokens are used.`)
  );
});


// Controller to get all coupons used by a user
 const getUserCoupons = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  // Find the user in the database
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Fetch all coupons used by the user
  const usedCoupons = await UserCoupon.find({ userId: user._id })
    .populate("couponId") // Assuming you want to get coupon details
    .lean();

  if (!usedCoupons.length) {
    return res.status(200).json(
      new ApiResponse(200, [], "No coupons used by this user.")
    );
  }

  // Format response to include relevant details
  return res.status(200).json(
    new ApiResponse(200, usedCoupons, "User coupons retrieved successfully.")
  );
});

const deactivateCoupon2 = asyncHandler(async (req, res) => {
  try {
    const { couponId } = req.params; // assuming couponId is passed as a URL parameter
    console.log(couponId);
    
    // Find the coupon by ID and set `isActive` to false
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isActive: false },
      { new: true } // This option returns the updated document
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({
      message: "Coupon has been successfully deactivated",
      coupon: updatedCoupon,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deactivating coupon", error });
  }
});


const toggleCouponStatus = asyncHandler(async (req, res) => {
    try {
        const { couponId } = req.params;

        // Find the coupon by its ID
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Toggle the isActive status
        coupon.isActive = !coupon.isActive;

        // Save the updated coupon
        await coupon.save();

        return res.status(200).json({
            message: `Coupon has been ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            coupon
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while toggling coupon status",
            error: error.message
        });
    }
}
);

export {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    applyTokenCoupon,
    getUserCoupons,
    toggleCouponStatus
  };


  