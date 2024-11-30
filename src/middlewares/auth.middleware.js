import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


// Middleware to verify JWT---

export const verifyJWT = asyncHandler(async (req, _, next) => {   //res replese by _ because res arg is not use in this function
    try {
        // Attempt to retrieve the token from cookies or the Authorization header--

        const token = req.cookies?.accessToken || req.header("Auhtorization")?.replace("Bearer ", "")

        // console.log(token)

        // If no token is found, throw an error--

        if (!token) {
            throw new ApiError(401, "Unauthrized request")
        }

         // Verify the token

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Find the user associated with the token

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        // If user not found, throw an error

        if (!user) {

            throw new ApiError(401, "Invalid Access Token")

        }

        // Attach user to request object

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})