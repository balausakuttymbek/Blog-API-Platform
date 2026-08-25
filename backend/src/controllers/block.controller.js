import Block from "../models/Block.js";
import Page from "../models/Page.js";
import mongoose from "mongoose";

export const createBlock = async (req, res) => {
    try {
        const data = req.body;
        if (!data.pageId) return res.status(400).json({ message: "pageId required" });

        // optional: check that user owns the page
        const page = await Page.findById(data.pageId);
        if (!page) return res.status(404).json({ message: "Page not found" });
        if (page.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const block = await Block.create({
            pageId: mongoose.Types.ObjectId(data.pageId),
            type: data.type,
            content: data.content,
            completed: data.completed || false,
            order: data.order || 0
        });
        res.status(201).json(block);
    } catch (err) {
        console.error("createBlock error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getBlocksByPage = async (req, res) => {
    try {
        const blocks = await Block.find({ pageId: req.params.pageId }).sort({ order: 1 });
        res.json(blocks);
    } catch (err) {
        console.error("getBlocksByPage error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateBlock = async (req, res) => {
    try {
        const blk = await Block.findById(req.params.id);
        if (!blk) return res.status(404).json({ message: "Block not found" });

        // check ownership via page
        const page = await Page.findById(blk.pageId);
        if (!page) return res.status(404).json({ message: "Page not found" });
        if (page.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        Object.assign(blk, req.body);
        await blk.save();
        res.json(blk);
    } catch (err) {
        console.error("updateBlock error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteBlock = async (req, res) => {
    try {
        const blk = await Block.findById(req.params.id);
        if (!blk) return res.status(404).json({ message: "Block not found" });

        const page = await Page.findById(blk.pageId);
        if (!page) return res.status(404).json({ message: "Page not found" });
        if (page.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await blk.remove();
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("deleteBlock error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleTodo = async (req, res) => {
    try {
        const blk = await Block.findById(req.params.id);
        if (!blk) return res.status(404).json({ message: "Block not found" });

        const page = await Page.findById(blk.pageId);
        if (!page) return res.status(404).json({ message: "Page not found" });
        if (page.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        blk.completed = !blk.completed;
        await blk.save();
        res.json(blk);
    } catch (err) {
        console.error("toggleTodo error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getBlocksByType = async (req, res) => {
    try {
        const blocks = await Block.find({ type: req.params.type });
        res.json(blocks);
    } catch (err) {
        console.error("getBlocksByType error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const blockStats = async (req, res) => {
    try {
        const stats = await Block.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        res.json(stats);
    } catch (err) {
        console.error("blockStats error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
