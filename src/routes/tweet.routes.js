import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from '../controllers/tweet.controller.js'


const router = Router()

// All Tweet Routes In This Files Needs To Be Authenticated (.use), Middleware
router.use(verifyJWT)

router.route("/post-tweet").post(createTweet)
router.route("/user/:userId").post(getUserTweets)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router
