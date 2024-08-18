import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const tweetContent = req.body.content
    if(!tweetContent){
        throw new ApiError(400, "Tweet content is required")
    }
    
    const owner =  req.user._id
    if(!owner){
        throw new ApiError(400, "Authentication Error, User not found")
    }

    const tweet = await Tweet.create({
        content: tweetContent,
        owner: owner
    })
    if(!tweet){
        throw new ApiError(500, "Something Went while creating tweet")
    }

    res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet Posted Successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // ! UserId, Allows To View Tweets Of Any valid user
    const {userId} = req.params
    const isValidId = isValidObjectId(userId)
    if(!isValidId){
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findById(userId) 
    // ! find(), not helpful in finding user & checking if not found
    if(!user){
        throw new ApiError(400, "User Not Found")
    }

    const userTweets = await Tweet.find({owner: userId})
    if(!userTweets){
        throw new ApiError(500, "Error While Fetching user tweets")
    }

    res.status(201).json(new ApiResponse(200, userTweets, "Tweets Fetched Successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const isValidId = isValidObjectId(tweetId)
    if(!isValidId){
        throw new ApiError(400, "Invalid tweetId")
    }

    const updatedcontent = req.body.content
    
    // const tweet = await Tweet.findById(tweetId)
    // if(!tweet){
    //     throw new ApiError(400, "cannot find tweet with given tweetId")
    // }
    // tweet.content = updatedcontent
    // await tweet.save({validateBeforeSave: false})

    const updatedtweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: updatedcontent
            }
        },
        {new: true}
    )

    res
    .status(201)
    .json(new ApiResponse(200, updatedtweet, "Tweet Updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const isValidId = isValidObjectId(tweetId)
    if(!isValidId){
        throw new ApiError(400, "Invalid tweetId")
    }

    await Tweet.findByIdAndDelete(tweetId)
    
    res
    .status(201)
    .json(new ApiResponse(200, {}, "Tweet Deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
