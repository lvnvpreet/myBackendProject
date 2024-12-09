import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";





const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate userId
    if (!userId) {
        throw new ApiError(400, "User id not valid")
    }

    // Determine sorting order
    const sortOrder = sortType === 'asc' ? 1 : -1;

    // Fetch videos created by the user
    const videos = await Video.find({ owner: userId })
        .sort({ [sortBy]: sortOrder })
        .skip((pageNumber - 1) * limitNumber) // Pagination
        .limit(limitNumber); // Limit results

    // Count total number of videos for pagination
    const totalVideos = await Video.countDocuments({ owner: userId });

    const totalPages = Math.ceil(totalVideos / limitNumber)

    
    return res
    .status(200)
    .json({
        new ApiResponse(200,videos,"All videos got successfully"
        )
    });
});

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    const owner = req.user?._id

    const thumbnaillocalPath = req.file?.path

    if (!thumbnaillocalPath) {
        throw new ApiError(400, "Thumbnail file is missing")
    }

    const thumbnail = await uploadOnCloudinary(thumbnaillocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const videoLocalPath = req.file?.path


    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Error while uploading video")
    }

    const duration = video?.duration

    

    const video = await Video.create({
        
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        discription,
        duration,
        views = 0,
        owner


    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400,"Video file is missing")
    }

    const video =await Video.findById(videoId)

    
    // const video = await Video.findByIdAndUpdate(
    //     req.params
    //     {
    //         $inc: {
    //             views: 1
    //         }
    //     },
    //     {new:true}
    // )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video published successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const videoLocalPath = req.file?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Error while updating video file")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                videoFile: videoFile.url
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                videoFile: undefined
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400,"Video file is missing")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,,"Video published successfully")
    )

})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}