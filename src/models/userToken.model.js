import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


// const userTokensSchema = new mongoose.Schema({

//    userId:{
//     type:Schema.Types.ObjectId,
//     ref:"User",
//     required: true
//    },
//    totalTokens:{  //subscribed token + free tokens
//     type:Number,
//     required:true,
//    },
//    type:{
//     type:String,
//     enum:['subscription','free','coupon'],    
//     required:true,
//    },
//    expiry:{
//     type:Date
//    },
//    isActive:{
//     type:Boolean,
//     default:true
//    }  

// },{timestamps:true})
const userTokensSchema = new mongoose.Schema({
   userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   tokens: [
      {
         subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
         type: { type: String, enum: ['subscription', 'free', 'coupon'], required: true },
         initialTokens: { type: Number, required: true }, // Total tokens for the subscription
         remainingTokens: { type: Number, required: true }, // Track how many tokens are left
         expiry: { type: Date, required: true }, // 30 days expiry or token usage based
         isActive: { type: Boolean, default: false }, // Whether the subscription is currently active
      },
   ],
},{ timestamps: true });


userTokensSchema.plugin(mongooseAggregatePaginate);


export const UserTokens = mongoose.model("UserTokens",userTokensSchema)