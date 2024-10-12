import mongoose, { Schema } from "mongoose";

const userSubscriptionSchema = new mongoose.Schema({

   userId:{
    type:Schema.Types.ObjectId,
    ref:"User"
   },
   subscriptionId:{
    type:Schema.Types.ObjectId,
    ref:"Subscription"
   },
   couponId:{
    type:Schema.Types.ObjectId,
    ref:"Coupon"
   },
   actualPrice:{
    type:Number,
    required:true,
   },
   discountedPrice:{
    type:Number,
   },
   noOfTokens:{  //subscribed token + free tokens
    type:Number,
    required:true,
   },
   startDate: {
      type: Date, // Track when the subscription starts
      default: Date.now,
   },
   endDate: {
      type: Date, // Track when the subscription ends (30 days from start or when tokens are exhausted)
   },
   isActive:{
    type:Boolean,
    required:true,
    default:true
   }  

},{timestamps:true})


export const UserSubscription = mongoose.model("UserSubscription",userSubscriptionSchema)