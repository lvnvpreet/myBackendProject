import { Router } from 'express'
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import {verifyJWt} from "../middlewares/auth.middleware.js"
import {updoad} from "../middleware/multer.middleware.js"
const route = Router();
route.use(verifyJWT); //apply verifyJWT middleware to all routes in this file 
route 
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name:"videoFile",
                maxCount:1,
            },
            {
                name:"thumbnail",
                maxCount:1,
            }
        ]),
        publishAVideo
    );
    route.route("/toggle/publish/:videoId").patch(togglePublishStatus);

    export default route
