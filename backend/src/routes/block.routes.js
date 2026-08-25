import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
    createBlock,
    getBlocksByPage,
    updateBlock,
    deleteBlock,
    toggleTodo,
    getBlocksByType,
    blockStats
} from "../controllers/block.controller.js";

const router = Router();

router.post("/", auth, createBlock);
router.get("/page/:pageId", getBlocksByPage);
router.get("/type/:type", getBlocksByType);
router.put("/:id", auth, updateBlock);
router.delete("/:id", auth, deleteBlock);
router.post("/:id/toggle", auth, toggleTodo);
router.get("/stats/types", blockStats);

export default router;
