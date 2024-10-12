import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";
import { changeCurrentPassword, getAllUsers, loginAdmin, logoutAdmin,  } from "../controllers/admin.controller.js";
import { createCoupon, deleteCoupon, getAllCoupons, getCouponById, getUserCoupons, toggleCouponStatus, updateCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { applySubscriptionToUser, cancelUserSubscription, createSubscription, deleteSubscription, getAllSubscriptions, getSubscriptionById, getUserSubscriptions, updateSubscription } from "../controllers/subscription.controller.js";
import { getAllUserTokens, getUserTokens } from "../controllers/token.controller.js";
import { getAllUsersDetails } from "../controllers/user.controller.js";



const router = Router();


router.route("/login").post(loginAdmin);

// secured routes 
router.route("/logout").get(authenticateAdmin,logoutAdmin);
router.route("/allusers").get(authenticateAdmin,getAllUsers);
router.route("/changepassword").post(authenticateAdmin,changeCurrentPassword);
router.route("/get-all-user-details").get(authenticateAdmin,getAllUsersDetails);



//subsciption
router.route("/subscription").post(authenticateAdmin,createSubscription);
router.route("/allsubscriptions").get(authenticateAdmin,getAllSubscriptions);
router.route("/updatesubscription/:id").post(authenticateAdmin,updateSubscription);
router.route("/getsubscription/:id").post(authenticateAdmin,getSubscriptionById);
router.route("/deletesubscription/:id").delete(authenticateAdmin,deleteSubscription);
router.route("/applysubscription").post(authenticateAdmin,applySubscriptionToUser);
router.route("/getusersubscriptions/:userId").post(authenticateAdmin,getUserSubscriptions);
router.route("/cancelsubscription").post(authenticateAdmin,cancelUserSubscription);



//coupons
router.route("/coupon").post(authenticateAdmin,createCoupon);
router.route("/allcoupons").get(authenticateAdmin,getAllCoupons);
router.route("/validatecoupon").post(authenticateAdmin,validateCoupon);

router.route("/deletecoupon/:id").delete(authenticateAdmin,deleteCoupon);
router.route("/updatecoupon/:id").post(authenticateAdmin,updateCoupon);
router.route("/toggle-coupon-status/:couponId").put(authenticateAdmin,toggleCouponStatus);

router.route("/getusercoupons/:userId").post(authenticateAdmin,getUserCoupons);


//tokens
router.route("/usertokens/:userId").post(authenticateAdmin,getUserTokens);
router.route("/all-tokens").get(authenticateAdmin,getAllUserTokens);

export default router;




































// import { upload } from "../middlewares/multer.middleWare.js";
// import { deleteUser } from "../controllers/userDelete.controller.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";


// router.get('/users', authenticateAdmin, getAllUsers); 


// router.route("/register").post(registerUser);

//secured routes 
// router.route("/admin/logout").post(verifyJWT,  logoutUser)




// router.route("/user/register").post(registerUser)

// router.route("/user/login").post(loginUser)
// //secured routes 
// router.route("/user/logout").post(verifyJWT,  logoutUser)

// router.route("/user/refresh-token").post(refreshAccessToken)

// router.route("/user/delete").post(deleteUser)