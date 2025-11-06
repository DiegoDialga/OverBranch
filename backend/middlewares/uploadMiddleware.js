import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }else{
        cb(new Error("Only image file allowed"), false);
    }
}

const upload = multer({storage, fileFilter});

export default upload;