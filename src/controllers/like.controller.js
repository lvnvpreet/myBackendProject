import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const userId = req.user.id; 

    // Check if the user exists
    const likeBy = await User.findById(userId);
    if (!likeBy) {
        throw new ApiError(404, "User not found");
    }

      
    const like = await Like.findOne({ userId, videoId });

    if (like) {
        // User is currently like, so we dislike them
        await Like.deleteOne({ userId, videoId });
        return res
        .status(200)
        .json({
            new ApiResponse(200,,"dislike to the video")
        });
    } else {
        // User is not like, so we like them
        await Like.create({ userId, videoId });
        return res
        .status(200)
        .json({
           new ApiResponse(200,"like to the video")
        });
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const userId = req.user.id; 

    // Check if the user exists
    const likeBy = await User.findById(userId);
    if (!likeBy) {
        throw new ApiError(404, "User not found");
    }

      
    const like = await Like.findOne({ userId, commentId });

    if (like) {
        // User is currently like, so we dislike them
        await Like.deleteOne({ userId, commentId });
        return res
        .status(200)
        .json({
            new ApiResponse(200,,"dislike to the comment")
        });
    } else {
        // User is not like, so we like them
        await Like.create({ userId, commentId });
        return res
        .status(200)
        .json({
           new ApiResponse(200,"like to the comment")
        });
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const userId = req.user.id; 

    // Check if the user exists
    const likeBy = await User.findById(userId);
    if (!likeBy) {
        throw new ApiError(404, "User not found");
    }

      
    const like = await Like.findOne({ userId, tweetId });

    if (like) {
        // User is currently like, so we dislike them
        await Like.deleteOne({ userId, tweetId });
        return res
        .status(200)
        .json({
            new ApiResponse(200,,"dislike to the tweet")
        });
    } else {
        // User is not like, so we like them
        await Like.create({ userId, tweetId });
        return res
        .status(200)
        .json({
           new ApiResponse(200,"like to the tweet")
        });
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video',
            },
        },
        {
            $addFields: {
                video: '$video',
            },
        },
        {
            $project: {
                _id: 1,
                video: 1,
                likedBy: 1,
            },
        },
    ])

    if (!likedVideos) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], 'No liked videos found'))
    }
     
    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, 'No liked videos found'))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}