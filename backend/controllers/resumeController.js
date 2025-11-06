import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";
import mongoose from "mongoose";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createResume = async (req, res) => {
    try{

        const {title} = req.body;

        const defaultResumeData = {
            profileInfo: {
                profileImg: null,
                previewUrl: "",
                fullName: "",
                designation: "",
                summary: ""
            },
            contactInfo: {
                email: "",
                phone: "",
                location: "",
                linkedin: "",
                github: "",
                website: "",
            },
            workExperience: [
                {
                    company: "",
                    role: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                }
            ],
            education: [
                {
                    degree: "",
                    institution: "",
                    startDate: "",
                    endDate: "",
                }
            ],
            skills: [
                {
                    name: "",
                    progress: 0,
                },
            ],
            projects: [
                {
                    title: "",
                    description: "",
                    github: "",
                    liveDemo: "",
                }
            ],
            certifications: [
                {
                    title: "",
                    issuer: "",
                    year: "",
                }
            ],
            languages: [
                {
                    name: "",
                    progress: 0,
                }
            ],
            interests: [""]
        };

        const newResume = await Resume.create({
            userId: req.user._id,
            title,
            ...defaultResumeData,
        })

        res.status(201).json(newResume);

    }catch(err){
        res.status(500).json({
            message: "Failed to create Resume", error: err.message
        });
    }
}

const getUserResumes = async (req, res) => {
    try{
        const resumes = await Resume.find({
            userId: req.user._id,
        }).sort({ updatedAt: -1 });
        res.json(resumes);
    }catch(err){
        res.status(500).json({
            message: "Failed to get Resumes", error: err.message
        })
    }
}

const getResumeById = async (req, res) => {
    try {
        console.log("➡️ Entered getResumeById");

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log("❌ Invalid resume ID:", req.params.id);
            return res.status(400).json({ message: "Invalid resume ID" });
        }

        console.log("🔍 Finding resume...");
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        console.log("✅ Query finished");

        if (!resume) {
            console.log("❌ Resume not found");
            return res.status(404).json({ message: "Resume not found" });
        }

        console.log("✅ Sending response");
        res.json(resume);
    } catch (err) {
        console.error("🔥 Error in getResumeById:", err);
        res.status(500).json({
            message: "Failed to get Resume",
            error: err.message,
        });
    }
};


const updateResume = async (req, res) => {
    try{
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        Object.assign(resume, req.body);

        const savedResume = await resume.save();
        res.json(savedResume);

    }catch(err){
        res.status(500).json({
            message: "Failed to get Resumes", error: err.message
        })
    }
}

const deleteResume = async (req, res) => {
    try{

        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!resume){
            return res.status(404).json({ message: "Resume not found" });
        }

        const uploadsFolder = path.join(__dirname, '..', 'uploads');
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        if(resume.thumbnailLink){
            const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
            if(fs.existsSync(oldThumbnail)){
                fs.unlinkSync(oldThumbnail);
            }
        }

        if(resume.profileInfo?.profilePreviewUrl){
            const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilePreviewUrl));
            if(fs.existsSync(oldProfile)){
                fs.unlinkSync(oldProfile);
            }
        }


        const deleted = await Resume.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!deleted){
            return res.status(404).json({ message: "Resume not found" });
        }

        res.json({message: "Resume deleted"});
    }catch(err){
        res.status(500).json({
            message: "Failed to get Resumes", error: err.message
        })
    }
}

export {createResume, getUserResumes, getResumeById, updateResume, deleteResume}