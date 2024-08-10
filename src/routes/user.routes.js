import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

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
)







export default router;