import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
    register,
    login,
    me,
    updateMe
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, me);
router.patch("/me", auth, updateMe);

export default router;
