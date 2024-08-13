import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        // Extract AccessToken From Cookies 'Or' From Authorization header
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!accessToken){
            throw new ApiError(401, "unauthorized request")
        }
    
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            // TODO: discussion on frontend
            throw new ApiError(401, "invalid Access Token")
        }
    
        // Add Information To req, so that can be used by further controllers
        req.user = user;
        next()
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
} )