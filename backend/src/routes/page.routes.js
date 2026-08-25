import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
    createPage,
    getPages,
    pagesSummary,
    getPageById,
    updatePage,
    deletePage,
    duplicatePage
} from "../controllers/page.controller.js";

const router = Router();

router.use(auth);

router.post("/", createPage);
router.get("/", getPages);
router.get("/summary", pagesSummary);
router.get("/:id", getPageById);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);
router.post("/:id/duplicate", duplicatePage);

export default router;
