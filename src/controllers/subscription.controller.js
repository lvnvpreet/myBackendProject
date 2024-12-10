import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Assuming the user ID is stored in req.user

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if the user is already subscribed to the channel then we create an object  
    const subscription = await Subscription.findOne({ userId, channelId });

    if (subscription) {
        // User is currently subscribed, so we unsubscribe them
        await Subscription.deleteOne({ userId, channelId });
        return res
        .status(200)
        .json({
            new ApiResponse(200,,"Unsubscribed from the channel")
        });
    } else {
        // User is not subscribed, so we subscribe them
        await Subscription.create({ userId, channelId });
        return res
        .status(200)
        .json({
           new ApiResponse(200,"Subscribed to the channel")
        });
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

     // Fetch subscribers for the channel
     const subscribers = await Subscription.find({ channelId }).populate('userId', 'username email'); // Adjust fields as necessary

     // Respond with the list of subscribers
     return res
     .status(200)
     .json({
         new ApiResponse(200,subscribers,"Fetch subscribers list successfully")
     });



})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriber = await User.findById(subscriberId);

    if (!subscriber) {
        throw new ApiError(404, "subscriber not found");
    }

    const channels = await Subscription.find({ subscriberId }).populate('userId', 'username email');

    return res
     .status(200)
     .json({
         new ApiResponse(200,channels,"Fetch channels list successfully")
     });
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}