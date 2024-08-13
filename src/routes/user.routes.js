import { Router } from "express";
import {
        loginUser,
        logoutUser, 
        refreshAccessToken, 
        registerUser 
        } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

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

// Secured Route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken); // verifyJWT - not needed ???







export default router;