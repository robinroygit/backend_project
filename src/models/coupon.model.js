import mongoose, { Schema } from "mongoose";

const couponSchema = new mongoose.Schema({

   name:{
    type:String,
    required:true,
   },
   code:{
    type:String,
    required:true,
   },
   expiry:{
    type:Date,
    required:true,
   },
   type:{
    type:String,
    required:true,
    enum:['discount','token'],    
   },
   value:{
      type:Number,
      required:true
   },
   maxUses: {
       type: Number
       },
   usedCount: {
       type: Number,
        default: 0
       }, 
   description:{
    type:String,
    required:true,
   },
   isActive:{
    type:Boolean,
    default:true
   }  

},{timestamps:true})


export const Coupon = mongoose.model("Coupon",couponSchema)