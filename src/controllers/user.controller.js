import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"
import { UploadOnCloudinary } from "../service/cloudinary.js"
import jwt from "jsonwebtoken"


// Custom Internal Methods
const generateAccessAndRefreshTokens = async (userid) => {
    try {
        const user = await User.findById(userid)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        // refreshToken, Put Into Db Object
        user.refreshToken = refreshToken

        // Save Object In MongoDB, Without Any Validation
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } 
    catch (error) {
        throw new ApiError(500, "Error while generating Access and Refresh Tokens")        
    }
}


// ! User-Controller Functions
const registerUser = asyncHandler( async (req, res) => {
    // Data Extraction
    const {fullname, email, username, password } = req.body
    
    // Validation Check
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // const existedUser = await User.find({ username })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }


    //console.log(req.files); // Explore files

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // Note: Files has been uploaded on Our Local Server By Multer, and has added its access in req.files


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file Upload Failed")
    }


    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email, 
        password,
        avatar: avatar.url,
        coverimage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
} )


const loginUser = asyncHandler( async (req, res) => {

    const {email, username, password} = req.body
    if(!username && !email){
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    // User & user(Instance) are different,   "user.methods"
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "password is Incorrect")
    }

    // Generate Token For Authentication
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // user instance here, and one created in function are different...
    // GET latest DB instance of user OR update "user" Object here Only
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send Token in cookies
    const options = {
        // Cookies Only server Modifiable
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
                // Sending Tokens to allow user to save Tokens on his SIde
            },
            "User Logged In Successfully"
        )
    )
} )


// Middleware Used Before, Although code can be witten here, but to imporve re-usability Use middleware
const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1  // : 1, this removes the field from document
            }
            // Try to set($set) rt to "" or null
        },
        {
            new: true // updateEntry : refreshToken: undefined
        }
    )
    const options = {
        // Only server
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut Successfully"))

} )


const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.cookies.body

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
// try-catch ????
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        // Matching userGiven & DB stored token
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is used or expired")
        }
    
        // Generate Fresh Token For Authentication
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            // Only server
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                    // Sending Tokens to allow user to save Tokens on his SIde
                },
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid Refresh Token")
    }
} )


const getCurrentUser = asyncHandler( async (req, res) => {
    // ! RETURN COMPLETE PROFILE WITH SUBCRIBERS & ALL OTHER INFO
    // console.log(req.user);
    
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User Fetched Succesfully"))
} )


// * User Details Updation Controllers

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    
    const user = await User.findById(req.user?._id)
    
    const ispasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!ispasswordCorrect){
        throw new ApiError(400, "Invalid Password")
    }

    // Update Password
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Succesfully"))
} )


const updateAccountDetails = asyncHandler( async (req, res) => {
    const {fullname, email} = req.body;
    if(!fullname && !email){
        throw new ApiError(400, "All fields Required")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {new: true} // ? 'user' has updated information returned to it
    ).select("-password") // * Save DB Call

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Fullname & Email Changed Succesfully"))
} )


// * Separate Routes For Files Updation
const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path

    // console.log("req.file: ", req.file);
    

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file missing")
    }
    
    const avatar = await UploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error While uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true} 
    ).select("-password") // * Save DB Call

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Succesfully"))
} )

const updateUsercoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file missing")
    }
    
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Error While uploading CoverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverimage: coverImage.url
            }
        },
        {new: true} 
    ).select("-password") // * Save DB Call

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image Updated Succesfully"))
} )







export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage
}






/*
Notes:-
    - 1.Register User
        - get user details form frontend(POST-MAN)
        - input validation - not empty
        - check if user already exists: username / email
        - check for images , check for avatar
        - upload them to cloudinary, check for avatar uploadation
        - create user object (for mongoDb) - create entry in db
        - remove password and refresh token field from response
        - check for user creation
        - return response

    - 2.Login User
        - get user details form frontend(POST-MAN)
        - username / email
        - check if user exists: username / email
        - check for password
        - access and refresh token
        - send cookies token
        - login success response


    - 3.LogOut User
        - 
    - 4.Refresh Access Token
        - get existing refersh token
 */
        // DONE