import express from "express";
import {
    createResume,
    getUserResumes,
    getResumeById,
    updateResume,
    deleteResume,
} from "../controllers/resumeController.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // ✅ import multer
import uploadResumeImages from "../controllers/uploadImages.js";

const router = express.Router();
console.log("✅ resumeRoutes file loaded");

// Create, Read, Update, Delete
router.post("/", protect, createResume);
router.get("/", protect, getUserResumes);

router.get("/ping", (req, res) => {
    console.log("✅ /api/resume/ping called");
    return res.status(200).json({ message: "pong" });
});

router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResume);

// ✅ This line is the important fix:
router.put(
    "/:id/upload-images",
    protect,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
    ]),
    uploadResumeImages
);

router.delete("/:id", protect, deleteResume);

export default router;
