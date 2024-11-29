import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename:function (req, file, cb){
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})


// improve  this code at cb for error handling and at the filename 