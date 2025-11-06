import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import path from "path";
import {fileURLToPath} from "node:url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await connectDB();
        console.log("✅ MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to DB:", err.message);
        process.exit(1);
    }
};

startServer();
