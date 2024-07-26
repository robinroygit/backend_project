import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleWare.js";
import { deleteUser } from "../controllers/userDelete.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "coverImage", // Field name for cover image
            maxCount: 1        // Allow only one file
        },
        {
            name: "avatar",    // Field name for avatar
            maxCount: 1        // Allow only one file
        },
    ]),
    registerUser

)

router.route("/login").post(loginUser)
//secured routes 
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/delete").post(deleteUser)
export default router;