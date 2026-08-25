import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

// routes
import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import pageRoutes from "./src/routes/page.routes.js";
import blockRoutes from "./src/routes/block.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express(); // ✅ app СНАЧАЛА

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ потом static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/blocks", blockRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "OK" }));

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

export default app;
