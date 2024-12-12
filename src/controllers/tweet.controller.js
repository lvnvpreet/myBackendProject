import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    const {content} = req.body

    //Validation of tweet content 
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    //check if video exists 
    const owner = await User.findById(userId);
    if (!owner) {
        throw new ApiError(404, "Owner not found");
    }

    const tweet = await Tweet.create(
        content,
        owner
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet Created successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract userId from request parameters
    const { page = 1, limit = 10 } = req.query; // Extract pagination parameters

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate the number of tweets to skip
    const skip = (pageNum - 1) * limitNum;

    // Fetch tweets for the user with pagination
    const tweets = await Tweet.find({ userId })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .populate("userId", "username email"); // Adjust fields as necessary

    // Get total number of tweets for the user
    const totalTweets = await Tweet.countDocuments({ userId });

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"Fetched user all tweets successfully")
    )
})
const updateTweet = asyncHandler(async (req, res) => {
    
    const {tweetId} = req.params

    const {content} = req.body

    //Validation of tweet content 
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(200,tweet,"Updated tweet successfully")
})

const deleteTweet = asyncHandler(async (req, res) => {
    
    const {tweetId} = req.params

    const tweet =  await Tweet.findById(tweetId)
    
    if (tweet) {
        await Tweet.deleteOne(tweetId)
    } else {
        throw new ApiError(400,"Tweet not found")
    }

    return res
    .status(200)
    .json{
        new ApiResponse(200,,"Deleted tweet successfully")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
