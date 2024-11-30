import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
           const user = await User.findById(userId)
          const accessToken = user.generateAccessToken()
           const refreshToken = user.generateRefreshToken()

           user.refreshToken = refreshToken
           user.save({validatBeforeSave: false})

           return {accessToken, refreshToken}

        } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")   
    }
}

const registerUser = asyncHandler(async (req, res) => {
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

    const { fullname, email, username, password } = req.body
    // console.log("email:", email)

    // validation - not empty --

    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required !!")
    }

    // check if user already exists: username, email --

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    //console.log("Checking for existing user with :", req.body.email, req.body.username);

    if (existedUser) {
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


    if (!avatar) {
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

       const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
       )
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

const logInUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email for access
    // find the user 
    // password check 
    // access and referesh token genrate 
    // send cookie
    // resposnce  


    const {email, username, password} = req.body

    // console.log(email);

    if(!(username || email)){
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken,
            },
            "User logged In Successfully"
        )
    )

}) 

const logOutUser = asyncHandler( async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse( 200, {}, "User logged Out" )
    )
})

const refereshAccessToken = asyncHandler( async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthrized request")
   }

  try {
     const decodedToken = jwt.varify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
     const user = await User.findById(decodedToken._id)
  
     if (!user) {
          throw new ApiError(201, "Invalid refresh Token ")
     }
  
     if( incomingRefreshToken !== user?.refreshToken ){
          throw new ApiError(401, "Refresh Token is expired or used")
     }
  
     const {accessToken, NewRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
  
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", NewRefreshToken, options)
     .json(
         new ApiResponse(
          (200),
          {
              accessToken,
              refreshToken : NewRefreshToken
          },
          "Access Token Refreshed successfully.."
  
         )
     )
  
  } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
  }

})


export { registerUser, logInUser, logOutUser, refereshAccessToken }