import { Router } from "express";
import { getCurrentUser, googleLogin, loginUser, logoutUser, registerUser,uploadImage  } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { applyTokenCoupon, getCouponById } from "../controllers/coupon.controller.js";
import { activateNextSubscription, applySubscriptionToUser, getAllSubscriptions, getUserSubscriptions, handleTokenUsage } from "../controllers/subscription.controller.js";
import { getUserTokens, getUserTokensDetails } from "../controllers/token.controller.js";
import { upload } from "../middlewares/multer.middleWare.js";



const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)
router.route("/googlelogin").get(googleLogin)

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/current-user").get(verifyJWT,  getCurrentUser)
router.route('/coupon/:id').get(verifyJWT,getCouponById);
router.route('/applysubscription').post(verifyJWT,applySubscriptionToUser);
router.route('/applycoupon').post(verifyJWT,applyTokenCoupon);


//subscriptions
router.route('/get-all-subscription').get(getAllSubscriptions);

router.route("/subscriptiondetails/:userId").post(verifyJWT,getUserSubscriptions);



//tokens 
router.route('/use-token').post(verifyJWT,handleTokenUsage);
router.route('/activate-next-subscription').post(verifyJWT,activateNextSubscription);
router.route("/usertokens/:userId").post(verifyJWT,getUserTokens);
router.route("/get-token-details/:userId").post(verifyJWT,getUserTokensDetails);

//image upload

// router.route('/upload').post(uploadImage)

router.route("/upload").post(
    upload.fields([ {
            name: "image", // Field name for cover image
            maxCount: 1        // Allow only one file
        },
    ]),
    uploadImage

)




export default router;


































// router.route("/refresh-token").post(refreshAccessToken)

// router.route("/delete").post(deleteUser)