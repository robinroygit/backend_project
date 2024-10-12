import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({

   name:{
    type:String,
    required:true,
   },
   type:{
      type:String,
      required:true,
      enum:['free','paid'],
   },
   noOfTokens:{
    type:Number,
    required:true,
   },
   description:{
    type:String,
   },
   price:{
    type:Number,
    required:true,
   },
   isActive:{
    type:Boolean,
    default:true
   }  

},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema)