import Resume from "../models/Resume.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadResumeImages = async (req, res) => {
    try {
        console.log("📤 Upload request received");
        console.log("Files:", req.files);

        const resumeId = req.params.id;
        const resume = await Resume.findOne({
            _id: resumeId,
            userId: req.user._id,
        });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        const uploadFolder = path.join(__dirname, "..", "uploads");
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        // Ensure uploads folder exists
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }

        const newThumbnail = req.files?.thumbnail?.[0];
        const newProfileImage = req.files?.profileImage?.[0];

        // Initialize profileInfo if missing
        if (!resume.profileInfo) resume.profileInfo = {};

        // --- Handle Thumbnail Upload ---
        if (newThumbnail) {
            if (resume.thumbnailLink) {
                const oldThumbnail = path.join(uploadFolder, path.basename(resume.thumbnailLink));
                if (fs.existsSync(oldThumbnail)) fs.unlinkSync(oldThumbnail);
            }
            resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
        }

        // --- Handle Profile Image Upload ---
        if (newProfileImage) {
            if (resume.profileInfo.profilePreviewUrl) {
                const oldProfile = path.join(uploadFolder, path.basename(resume.profileInfo.profilePreviewUrl));
                if (fs.existsSync(oldProfile)) fs.unlinkSync(oldProfile);
            }
            resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
        }

        await resume.save();

        res.status(200).json({
            message: "✅ Successfully uploaded",
            thumbnailLink: resume.thumbnailLink,
            profilePreviewUrl: resume.profileInfo.profilePreviewUrl,
        });
    } catch (err) {
        console.error("❌ Error uploading images:", err);
        res.status(500).json({ message: "Error uploading images", error: err.message });
    }
};

export default uploadResumeImages;
