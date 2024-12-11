import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

     // const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate the number of comments to skip
    const skip = (pageNum - 1) * limitNum;

    // Fetch comments for the video with pagination
    const comments = await Comment.find({ videoId })
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "username email") // Adjust fields as necessary

    // Get total number of comments for the video
    const totalComments = await Comment.countDocuments({ videoId });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,comments,"Fetched all comments of video successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params

    const {content} = req.body


    //Validation of comment content 
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    //check if video exists 
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Create a new comment
    const newComment = await Comment.create({
        videoId,
        userId: req.user._id, // Assuming user ID is available in req.user
        content,
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200,newComment,"Add a new comment successfully")
    )
    

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params

    const {content} = req.body

    //Validation of comment content 
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }


    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new:true}
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400,"Comment is missing")
    }

    await Comment.deleteOne(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
