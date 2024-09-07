import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {UploadOnCloudinary} from "../service/cloudinary.js"

// ! Good Level
// ? Video Must Be Published
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


// ! Think About Pagination And Other Stuff As in above Route
// ? Will See All His Videos
const getUserVideos = asyncHandler(async (req, res) => {
    // TODO: get videos By Current User
    const userId = req.user._id

    const videos = await Video.find({owner: userId})
    if(!videos){
        throw new ApiError(400, "SWW while fetching user Videos")
    }
    // console.log(Boolean(null));
    
    return res.status(201).json(new ApiResponse(200, {videos}, "Video Fetched Successfully"))
})

// TODO: If user is authenticated then, updated video views, likes and other stuff
// ? Video Must Be Published
const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params
    const isValidVideoId = isValidObjectId(videoId)
    if(!isValidVideoId){
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video Not Found")
    }
    // console.log(Boolean(video));
    
    return res.status(201).json(new ApiResponse(200, video, "Video Fetched Successfully"))
})


const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const {title, description=""} = req.body
    if(!title){
        throw new ApiError(400, "Valid Title is required")
    }
    // console.log("Title: ", title, "Description: ", description);
    // console.log("req.file", req.file); // undefined
    // console.log("req.files", req.files); // Object
    // TODO: Include checks for type and size of video and thumbnail files

    // const thumbnailLocalPath = req.files?.thumbnail[0]?.path // undefined error WHY?

    // Get local path for files
    let videoLocalPath;
    if(req.files && Array.isArray(req.files.videofile) && req.files.videofile.length > 0){
        videoLocalPath = req.files.videofile[0].path
    }
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Video or Thumbnail is missing")
    }

    // Upload them both on cloudinary
    const videofile = await UploadOnCloudinary(videoLocalPath)
    const thumbnail = await UploadOnCloudinary(thumbnailLocalPath)
    // console.log("Video", video);
    // console.log("Thumnail", thumbnail);
    if(!videofile || !thumbnail){
        throw new ApiError(400, "Video or Thumbnail Upload Failed")
    }

    // Create a DB entry for video
    let video = await Video.create({
            owner: req.user._id,
            videoFile: videofile.url,
            thumbnail: thumbnail.url,
            title: title,
            description: description,
            duration: videofile.duration,

            isPublished: false
        })
    if(!video){
        throw new ApiError(500, "SWW While Publishing Video")
    }

    return res.status(201).json(new ApiResponse(200, video, "Video Published Successfully"))
})


const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const isValidVideoId = isValidObjectId(videoId)
    if(!isValidVideoId){
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video Not Found")
    }
    if(String(video.owner) !== String(req.user._id)){
        throw new ApiError(400, "UnAuthorized Request - Only Owner Can Delete  Video")
    }

    const {title="", description=""} = req.body
    if(title){
        video.title = title
    }
    if(description){
        video.description = description
    }
    
    const thumbnailLocalPath = req.file?.path;
    let thumbnail = ""
    if(thumbnailLocalPath){
        thumbnail = await UploadOnCloudinary(thumbnailLocalPath)
    }
    if(thumbnail){
        video.thumbnail = thumbnail.url
    }

    await video.save({validateBeforeSave: false})

    return res.status(201).json(new ApiResponse(200, video, "Video Deleted Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video - ONLY OWNER CAN DELETE
    const { videoId } = req.params
    const isValidVideoId = isValidObjectId(videoId)
    if(!isValidVideoId){
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video Not Found")
    }
    // ! Types Might Be String / Object ID, 
    // ! and !== Will Consider Type ALso BEWARE !!!
    if(String(video.owner) !== String(req.user._id)){
        throw new ApiError(400, "UnAuthorized Request - Only Owner Can Delete  Video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(201).json(new ApiResponse(200, video, "Video Deleted Successfully"))
}) // ! How to delete Video On Cloudinary Server Also 


// video will always exist (MAYBE)
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const isValidVideoId = isValidObjectId(videoId)
    if(!isValidVideoId){
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video Not Found")
    }
    if(String(video.owner) !== String(req.user._id)){
        throw new ApiError(400, "UnAuthorized Request - Only Owner Can Update  Video")
    }
    // Toggle Status
    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave: false})

    return res.status(201).json(new ApiResponse(200, video, "Video Deleted Successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getUserVideos
}
