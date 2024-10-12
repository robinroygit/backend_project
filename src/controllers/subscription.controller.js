import mongoose from 'mongoose';
import { Coupon } from '../models/coupon.model.js';
import {Subscription} from '../models/subscription.model.js';  
import { User } from '../models/user.model.js';
import {UserSubscription} from '../models/userSubscription.model.js';  
import { UserTokens } from '../models/userToken.model.js';
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserCoupon } from '../models/userCoupon.model.js';

//utility



//✅ Create a new subscription plan
const createSubscription = asyncHandler(async (req, res) => {
  const { name, description, price, isActive, noOfTokens,type } = req.body;

     // Check if coupon code already exists
     const existingSubsciption = await Subscription.findOne({ name });
     if (existingSubsciption) {

  return res.status(201).json(new ApiResponse(401,{},"subscription version already exists.",));

      //  throw new ApiError(409, "subscription version already exists.");
     }
  if (!name || !noOfTokens) {
    throw new ApiError(400, "Name, price, and number of tokens are required.");
  }

  // Create subscription plan
  const subscription = await Subscription.create({
    name,
    description,
    price,
    noOfTokens,
    isActive,
    type
  });

  return res.status(201).json(new ApiResponse(201, subscription, "Subscription plan created successfully."));
});

//✅ Get all subscription plans
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({});
  if (!subscriptions.length) {
    throw new ApiError(404, "No subscription plans found.");
  }

  return res.status(200).json(new ApiResponse(200, subscriptions, "Subscriptions retrieved successfully."));
});

//✅ Get subscription by ID
const getSubscriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscription = await Subscription.findById(id);

  if (!subscription) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  return res.status(200).json(new ApiResponse(200, subscription, "Subscription plan retrieved successfully."));
});

// ✅Update a subscription plan
const updateSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, noOfTokens, isActive } = req.body;

  const updatedSubscription = await Subscription.findByIdAndUpdate(
    id,
    { name, description, price, noOfTokens, isActive },
    { new: true, runValidators: true }
  );

  if (!updatedSubscription) {
    throw new ApiError(404, "Subscription plan not found or couldn't be updated.");
  }

  return res.status(200).json(new ApiResponse(200, updatedSubscription, "Subscription plan updated successfully."));
});

// ✅Delete a subscription plan
const deleteSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedSubscription = await Subscription.findByIdAndDelete(id);

  if (!deletedSubscription) {
    throw new ApiError(404, "Subscription plan not found or couldn't be deleted.");
  }

  return res.status(200).json(new ApiResponse(200, null, "Subscription plan deleted successfully."));
});

//✅ Function to apply subscription to a user
const applySubscriptionToUser = asyncHandler(async (req, res) => {

  const { userId, subscriptionId, couponCode } = req.body;

  // Fetch user details
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  let userTokens = await UserTokens.findOne({ userId });
  if (!userTokens) {
    userTokens = new UserTokens({ userId, tokens: [] });
  }

  // Fetch subscription details
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throw new ApiError(404, "Subscription plan not found");

  let finalPrice = subscription.price;
  let additionalTokens = 0;

  // Handle coupon logic
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) throw new ApiError(404, "Invalid coupon code");

    const now = new Date();
    if (coupon.expiry && coupon.expiry < now) {
      throw new ApiError(400, "Coupon has expired");
    }

    if (coupon.type === "discount") {
      const discountValue = (finalPrice * coupon.value) / 100;
      finalPrice = Math.max(0, finalPrice - discountValue);
    } else if (coupon.type === "token") {
      additionalTokens += coupon.value;
    }
  }

  const totalTokens = subscription.noOfTokens + additionalTokens;

  if (coupon) {
    const existingCoupon = await UserCoupon.findOne({ couponId: coupon._id });
    if (existingCoupon) throw new ApiError(400, "Coupon has already been used");

    await UserCoupon.create({
      userId: user._id,
      couponId: coupon._id,
    });
  }

  const activeSubscription = userTokens.tokens.find(sub => sub.isActive);

  // Calculate the new subscription's expiry
  let expiryDate;
  if (activeSubscription && activeSubscription.expiry > new Date()) {
    // Extend expiry if there's an active subscription
    expiryDate = new Date(activeSubscription.expiry.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    // Set expiry to 30 days from now if no active subscription
    expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const newSubscription = {
    subscriptionId: subscription._id,
    type: 'subscription',
    initialTokens: totalTokens,
    remainingTokens: totalTokens,
    expiry: expiryDate,
    isActive: !activeSubscription, // Activate if no other subscription is active
  };

  userTokens.tokens.push(newSubscription);
  await userTokens.save();

  const userSubscription = await UserSubscription.create({
    userId: user._id,
    subscriptionId: subscription._id,
    couponId: coupon?._id,
    actualPrice: subscription.price,
    discountedPrice: finalPrice,
    noOfTokens: totalTokens,
    isActive: true,
  });

  return res.status(200).json(
    new ApiResponse(200, { userTokens, userSubscription }, "Subscription applied successfully")
  );
});




   const notifyForNextSubscription = async (userId) => {
    const userTokens = await UserTokens.findOne({ userId });
  
    if (!userTokens) {
      throw new Error('No tokens found for this user.');
    }
  
    const nextSubscription = userTokens.tokens.find(sub => !sub.isActive && sub.remainingTokens>0);
  
    if (nextSubscription) {
      // Notify user to activate the next subscription (send an email, app notification, etc.)
      console.log(`Notify user to activate the next subscription with ${nextSubscription.remainingTokens} tokens.`);
      return `Do you want to activate your next Tokens collection. you have ${nextSubscription.remainingTokens} tokens.`;
    } else {
      console.log('No more subscriptions available.');
      return 'No more subscriptions available.';
    }
  };


  const handleTokenUsage = asyncHandler(async (req, res) => {
    try {
      const { userId, numberOfTokens } = req.body;
  
      // Fetch user tokens and active/next subscriptions
      const userTokens = await UserTokens.findOne({ userId });
      if (!userTokens) {
        throw new Error('No subscriptions found for this user.');
      }
  
      // Find the active subscription (tokens)
      let activeSubscription = userTokens.tokens.find(sub => sub.isActive);
  
      // Get the next available subscriptions (tokens)
      const nextSubscriptions = userTokens.tokens
        .filter(sub => !sub.isActive && sub.remainingTokens > 0)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
      // Check if the active subscription is valid (has tokens or not expired)
      const isSubscriptionExpired = activeSubscription && new Date(activeSubscription.expiry) <= new Date();
      const hasTokens = activeSubscription && activeSubscription.remainingTokens > 0;
  
      if (!activeSubscription || isSubscriptionExpired || !hasTokens) {
        // If no active subscription, activate the next one if available
        if (nextSubscriptions.length > 0) {
          const message = await notifyForNextSubscription(userId);
          return res.status(200).json(new ApiResponse(200, message)); // Ask to activate the next subscription
        } else {
          return res.status(200).json(new ApiResponse(200, 'No active subscription and no next subscriptions available.'));
        }
      }
  
      // Check if tokens can be used from the active subscription
      if (activeSubscription.remainingTokens < numberOfTokens) {
        return res.status(400).json(new ApiResponse(400, 'Not enough tokens available.'));
      }
  
      // Deduct the tokens
      activeSubscription.remainingTokens -= numberOfTokens;
  
      // Deactivate the token subscription if it runs out of tokens or expires
      let subscriptionUpdate = false;
      if (activeSubscription.remainingTokens <= 0 || isSubscriptionExpired) {
        activeSubscription.isActive = false; // Deactivate the token in UserTokens
        subscriptionUpdate = true; // Set flag to update UserSubscription as well
      }
  
      // Save the updated tokens status in UserTokens
      await UserTokens.findOneAndUpdate(
        { userId, 'tokens._id': activeSubscription._id },
        {
          $set: {
            'tokens.$.remainingTokens': activeSubscription.remainingTokens,
            'tokens.$.isActive': activeSubscription.isActive
          }
        }
      );
  
      // If the subscription ran out of tokens or expired, update the UserSubscription model
      if (subscriptionUpdate) {
        const userSubscription = await UserSubscription.findOne({ userId,isActive:true, subscriptionId: activeSubscription.subscriptionId });
        if (userSubscription) {
          userSubscription.isActive = false;
          await userSubscription.save(); // Save the updated subscription status
        }
      }
  
      return res.status(200).json(
        new ApiResponse(200, { remainingTokens: activeSubscription.remainingTokens }, `${numberOfTokens} tokens successfully used.`)
      );
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, error.message));
    }
  });
  
  
  

  const activateNextSubscription = asyncHandler(async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Fetch user tokens and find inactive subscriptions
      const userTokens = await UserTokens.findOne({ userId });
      if (!userTokens) throw new ApiError(404, 'No subscriptions found for this user.');
  
      const activeSubscription = userTokens.tokens.find(sub => sub.isActive);
      if (activeSubscription && activeSubscription.remainingTokens > 0 && activeSubscription.expiry > new Date()) {
        throw new ApiError(400, 'Current subscription is still active and valid. You cannot activate the next subscription until it ends.');
      }
  
      const nextSubscriptions = userTokens.tokens
        .filter(sub => !sub.isActive && sub.remainingTokens > 0)
        .sort((a, b) => a.createdAt - b.createdAt);
  
      if (nextSubscriptions.length === 0) {
        throw new ApiError(400, 'No available subscriptions to activate.');
      }
  
      const nextSubscription = nextSubscriptions[0];
      nextSubscription.isActive = true;
      nextSubscription.expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
      await userTokens.save();
  
      const message = `Subscription activated with ${nextSubscription.remainingTokens} tokens.`;

  
      return res.status(200).json(
        new ApiResponse(200, { remainingTokens: nextSubscription.remainingTokens }, message)
      );
    } catch (error) {
      return res.status(400).json(new ApiResponse(400, null, error.message));
    }
  });
  
  

  



//✅ Get all subscriptions of a user
const getUserSubscriptions = asyncHandler(async (req, res) => {
  const { userId } = req.params;


  const userSubscriptions = await UserSubscription.find({ userId })
  .populate("subscriptionId") // Assuming you want to get coupon details
  .populate("couponId") // Assuming you want to get coupon details
  .lean();
  ;
  

  if (!userSubscriptions.length) {
  return res.status(200).json(new ApiResponse(401, userSubscriptions, "no history found."));

    // throw new ApiError(404, "No subscriptions found for this user.");
  }
 
  return res.status(200).json(new ApiResponse(200, userSubscriptions, "User subscriptions retrieved successfully."));
});



//✅ Cancel user's active subscription
const cancelUserSubscription = asyncHandler(async (req, res) => {
  const { userId, subscriptionId } = req.body;

  // Find the user's active subscription
  const userSubscription = await UserSubscription.findOne({
    userId,
    subscriptionId,
    isActive: true,
  });

  if (!userSubscription) {
    throw new ApiError(404, "Active subscription not found for this user.");
  }

  // Cancel the subscription (set isActive to false)
  userSubscription.isActive = false;
  await userSubscription.save();

  return res.status(200).json(new ApiResponse(200, null, "Subscription cancelled successfully."));
});



export {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  applySubscriptionToUser,
  getUserSubscriptions,
  cancelUserSubscription,
  handleTokenUsage,
  activateNextSubscription,
};
