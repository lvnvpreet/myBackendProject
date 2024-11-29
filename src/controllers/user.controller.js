import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
        // get user details from frontend 
        // validation - not empty 
        // check if user already exists: username, email
        // check for image, check for avatar 
        // upload them to cloudinary, avatar 
        // create user object - create entry in db
        // remove password and refresh token fild from response
        // check for user creation 
        // return res
// ---------------------------------------------------------------------------
        
        // get user details from frontend --

        const {fullname, email, username, password} = req.body
        console.log("email:", email)

        // validation - not empty --

        if([username, email, fullname, avatar, coverImage, password].some === ""){
            throw new ApiError(400, "all fields are required !!")
        }

        // check if user already exists: username, email --

        const existUser = await User.findOne(
            {
                $or: [ { email}, { username }]
            }
        )

        if (existUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        // check for image, check for avatar 

        const avatarLocalPath = req.files?.avatar[0]?.path;

        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        // upload them to cloudinary, avatar --

       const avatar = await uploadOnCloudinary(avatarLocalPath);
       const coverImage = await uploadOnCloudinary(coverImageLocalPath);


       if(!avatar){
            throw new ApiError(400, "Avatar file is required")
       }

       // create user object - create entry in db --

       const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage.url

       })

       // remove password and refresh token fild from response --

       const createUser = await User.findById(user._Id).select(
        "-password -refreshToken"
       )
       

       if(!createUser){
        throw new ApiError(500, "Something went wrong while registering the user")
       }


       return res.status(201).json(
            new ApiResponse(200, createUser, "User registered successfully")
       )

    
})

export {registerUser}