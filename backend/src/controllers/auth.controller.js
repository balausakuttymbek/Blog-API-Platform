import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashed });

        res.status(201).json({ id: user._id, email: user.email });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Register error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set");
            return res.status(500).json({ message: "Server not configured for auth" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Login error" });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("_id email username");
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({
            id: user._id,
            email: user.email,
            username: user.username || "",
        });
    } catch (err) {
        console.error("Me error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // update username
        if (typeof username === "string" && username.trim()) {
            user.username = username.trim();
        }

        // update password (advanced update)
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ message: "Old password required" });
            }

            const ok = await bcrypt.compare(oldPassword, user.password);
            if (!ok) {
                return res.status(401).json({ message: "Old password incorrect" });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        return res.json({
            id: user._id,
            email: user.email,
            username: user.username || "",
        });
    } catch (err) {
        console.error("UpdateMe error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
