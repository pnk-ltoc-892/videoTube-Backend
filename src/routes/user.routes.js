import { Router } from "express";
import {
        changeCurrentPassword,
        getCurrentUser,
        getUserChannelProfile,
        getUserWatchHistory,
        loginUser,
        logoutUser, 
        refreshAccessToken, 
        registerUser, 
        updateAccountDetails,
        updateUserAvatar,
        updateUsercoverImage
        } 
        from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(
    // Middleware
    // 2 files are expected, avatar, coverImg
    upload.fields([ // can "update" request OBJECT
        {
            name: "avatar",  // same name in frontend for communication
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1 // Explore multiple count 
        }]) ,
        
    // EndPoint
    registerUser
);

router.route("/login").post(loginUser);

// ! Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken); // verifyJWT - not needed ???

router.route("/get-user").get(verifyJWT, getCurrentUser); // verifyJWT - not needed ???

// ? Verify JWT Route??

// * Updation-Routes
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/update-details").patch(verifyJWT, updateAccountDetails);

// File Upload Routes
router.route("/update-avatar").patch(
    verifyJWT,
    upload.single('avatar'),
    updateUserAvatar
);

router.route("/update-coverimage").patch(
    verifyJWT,
    upload.single('coverimage'),
    updateUsercoverImage
);


// Aggegation routes

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getUserWatchHistory)







export default router;