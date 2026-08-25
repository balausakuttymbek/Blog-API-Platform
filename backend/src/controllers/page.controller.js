import Page from "../models/Page.js";
import Block from "../models/Block.js";
import mongoose from "mongoose";

export const createPage = async (req, res) => {
    const page = await Page.create({
        title: req.body.title,
        userId: req.user.id
    });
    res.json(page);
};

export const getPages = async (req, res) => {
    const pages = await Page.find({ userId: req.user.id });
    res.json(pages);
};

export const pagesSummary = async (req, res) => {
    // For the current user, return pages with total number of blocks
    const result = await Page.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(req.user.id) } },
        {
            $lookup: {
                from: "blocks",
                localField: "_id",
                foreignField: "pageId",
                as: "blocks"
            }
        },
        {
            $project: {
                title: 1,
                totalBlocks: { $size: "$blocks" }
            }
        }
    ]);
    res.json(result);
};

export const getPageById = async (req, res) => {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user.id });
    if (!page) return res.status(404).json({ message: "Page not found" });
    const blocks = await Block.find({ pageId: page._id }).sort({ order: 1 });
    res.json({ page, blocks });
};

export const updatePage = async (req, res) => {
    const updated = await Page.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: req.body },
        { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Page not found or not allowed" });
    res.json(updated);
};

export const deletePage = async (req, res) => {
    const removed = await Page.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!removed) return res.status(404).json({ message: "Page not found or not allowed" });
    // remove associated blocks
    await Block.deleteMany({ pageId: removed._id });
    res.json({ message: "Deleted" });
};

export const duplicatePage = async (req, res) => {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user.id });
    if (!page) return res.status(404).json({ message: "Page not found" });

    const newPage = await Page.create({
        title: page.title + " (copy)",
        userId: page.userId
    });

    const blocks = await Block.find({ pageId: page._id }).sort({ order: 1 });
    const newBlocks = blocks.map(b => ({
        pageId: newPage._id,
        type: b.type,
        content: b.content,
        completed: b.completed,
        order: b.order
    }));

    if (newBlocks.length) {
        await Block.insertMany(newBlocks);
    }

    res.json({ newPageId: newPage._id });
};
