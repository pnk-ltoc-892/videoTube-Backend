import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,

    getUserVideos

} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
// TODO: Will Shifting authenticated route below the above line applies to all or pny to ones below it ?


// Get all Videos on Server
router.route("/").get(getAllVideos);


// Get any Video
router.route("/v/:videoId").get(getVideoById)


// ! Get All Videos Uploaded By Current User
router.route("/v/user").get(verifyJWT, getUserVideos)


// ! Upload a Video
router.route("/v/user/upload").post(
    verifyJWT,
    // Upload - Middleware
    upload.fields([
        {
            name: 'videofile',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        },
    ]),
    // Endpoint
    publishAVideo
)


// ! Delete a Video, Only Uploaded By The Current User
router.route("/v/user/:videoId").delete(verifyJWT, deleteVideo)


// ! Update video Details, Only Uploaded By The Current User
router
    .route("/v/user/:videoId")
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

// ! Update video Publish Status
router.route("/v/user/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);


export default router