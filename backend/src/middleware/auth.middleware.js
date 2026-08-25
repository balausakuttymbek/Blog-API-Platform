import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ message: "No authorization header" });
        }

        const parts = header.split(" ");
        if (parts.length !== 2) {
            return res.status(401).json({ message: "Invalid authorization header format" });
        }

        const token = parts[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ теперь есть и id и email
        req.user = { id: decoded.id, email: decoded.email };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
