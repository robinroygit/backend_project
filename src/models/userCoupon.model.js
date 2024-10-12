import mongoose, { Schema } from "mongoose";

const userCouponSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  couponId: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserCoupon = mongoose.model("UserCoupon", userCouponSchema);
