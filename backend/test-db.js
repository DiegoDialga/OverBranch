// test-db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

(async () => {
    try {
        console.log("Trying to connect to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Connection failed:", err.message);
        process.exit(1);
    }
})();
