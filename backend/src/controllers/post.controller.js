import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";

// ADD COMMENT (embedded + $push)
export const addComment = async (req, res) => {
    try {
        const { id } = req.params; // post id
        const { text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post id" });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text required" });
        }

        const user = await User.findById(req.user.id).select("email username");
        if (!user) return res.status(404).json({ message: "User not found" });

        const comment = {
            text: text.trim(),
            author: user._id,
            authorEmail: user.email || ""
        };

        const updated = await Post.findByIdAndUpdate(
            id,
            { $push: { comments: comment } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Post not found" });

        return res.status(201).json(updated);
    } catch (err) {
        console.error("Add comment error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// DELETE COMMENT (embedded + $pull)
export const deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post id" });
        }
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid comment id" });
        }

        // Вариант "по-быстрому": удаляем только если коммент принадлежит юзеру
        // (или ты можешь расширить: автор поста тоже может)
        const post = await Post.findById(id).select("author comments.author");
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isPostOwner = String(post.author) === String(req.user.id);
        const isCommentOwner = post.comments?.some(
            (c) => String(c._id) === String(commentId) && String(c.author) === String(req.user.id)
        );

        if (!isPostOwner && !isCommentOwner) {
            return res.status(403).json({ message: "Access denied" });
        }

        const updated = await Post.findByIdAndUpdate(
            id,
            { $pull: { comments: { _id: new mongoose.Types.ObjectId(commentId) } } },
            { new: true }
        );

        return res.json(updated);
    } catch (err) {
        console.error("Delete comment error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * CREATE POST
 */
export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

        const post = await Post.create({
            title,
            content,
            image: imagePath,        // ✅ сохраняем путь
            author: req.user.id,
            authorEmail: req.user.email || ""
        });

        res.status(201).json(post);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


/**
 * GET ALL POSTS
 */
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("author", "email username");

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * UPDATE POST
 */
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post id" });
        }

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // проверка владельца (я бы включил обязательно)
        // если оставишь выключенным — любой сможет менять любой пост
        if (String(post.author) !== String(req.user.id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { title, content } = req.body;
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;

        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Update post error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * DELETE POST
 */
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (String(post.author) !== String(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// =======================
// AGGREGATION: POSTS STATS
// =======================
export const postStats = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $project: {
                    author: 1,
                    commentsCount: { $size: "$comments" }
                }
            },
            {
                $group: {
                    _id: "$author",
                    totalPosts: { $sum: 1 },
                    totalComments: { $sum: "$commentsCount" }
                }
            },
            { $sort: { totalPosts: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: "$author" },
            {
                $project: {
                    _id: 0,
                    authorId: "$author._id",
                    email: "$author.email",
                    username: "$author.username",
                    totalPosts: 1,
                    totalComments: 1
                }
            }
        ]);

        res.json(stats);
    } catch (err) {
        console.error("Post stats error:", err);
        res.status(500).json({ message: "Aggregation error" });
    }
};
