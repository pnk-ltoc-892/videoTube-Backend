import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getVideoComments = asyncHandler( async (req, res) => {
    // TODO: get ALL comments for a video
    // ! Using Simple DB call to get comments, See Notes & Optimize

    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const comments = await Comment.find({video: videoId})
    if(!comments){
        throw new ApiError(500, "Error While Fetching Comments")
    }

    res.status(201).json(new ApiResponse(200, comments, "comments Fetched Succesfully"))
} )

const addComment = asyncHandler( async (req, res) => {
    // TODO: add a comments to a video

    // ! Since Video DB is empty Using Any ID jibrish video ID
    // ! Id: 66c1f3104ff31382c9aa3c99
    // ! Id: 66bc486a97e278592fbcfe83
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const commentContent = req.body.content
    if(!commentContent){
        throw new ApiError(400, "enter a valid comment")
    }
    const userId = req.user._id

    const comment = await Comment.create(
        {
            content: commentContent,
            video: videoId,
            owner: userId
        }
    )
    if(!comment){
        throw new ApiError(500, "Error while creating comment")
    }
    res.status(201).json(new ApiResponse(200, comment, "Comment Created Successfully"))
} )

const updateComment = asyncHandler( async (req, res) => {
    // TODO: update given comment
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    const updatedComment = req.body.content
    if(!updateComment){
        throw new ApiError(400, "enter a valid comment")
    }

    const newComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: updatedComment
            }
        },
        {new: true}
    )
    if(!newComment){
        throw new ApiError(500, "Error While Updating Comment")
    }

    res.status(201).json(new ApiResponse(200, newComment, "Comment Updated Succesfully"))
} )

const deleteComment = asyncHandler( async (req, res) => {
    // TODO: get ALL comments for a video
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }
    await Comment.findByIdAndDelete(commentId)
    res.status(201).json(new ApiResponse(200, {}, "Comment Deleted Successfully"))
} )

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}