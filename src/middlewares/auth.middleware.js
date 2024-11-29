import { asyncHandler } from "../utils/asyncHandler.js";
import {jwt} from "jsonwebtoken"



export const verifyJWT = asyncHandler(async (req, _, next) => {   //res replese by _ because res arg is not use in this function
try {
        const token = req.cookie?.accessToken || req.header("Auhtorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthrized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
    
            throw new ApiError(401, "Invalid Access Token")
    
        }
    
        req.user = user;
        next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
}
})