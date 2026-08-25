import express from "express";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.routes.js";
import pageRoutes from "./routes/page.routes.js";
import blockRoutes from "./routes/block.routes.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/blocks", blockRoutes);

// health check
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

export default app;
