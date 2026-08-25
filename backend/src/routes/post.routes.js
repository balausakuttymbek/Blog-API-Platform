import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    postStats,
    addComment,
    deleteComment
} from "../controllers/post.controller.js";
import upload from "../middleware/upload.js";


const router = Router();

router.get("/stats", auth, postStats); // лучше под auth, если статистика не публичная

router.get("/", getPosts);
router.post("/", auth, upload.single("image"), createPost);

router.put("/:id", auth, upload.single("image"), updatePost);
router.patch("/:id", auth, upload.single("image"), updatePost);

router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);

router.delete("/:id", auth, deletePost);

export default router;
