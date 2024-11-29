import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleeare.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCout: 1
        },
        {
            name: "coverImage",
            maxCout: 1
        }
    ]),
    registerUser
)

export default router