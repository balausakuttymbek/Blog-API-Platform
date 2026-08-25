import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
            title: { type: String, required: true, trim: true },
            content: { type: String, required: true, trim: true },
            image: { type: String, default: "" },

            author: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
            },

            comments: [
                    {
                            text: { type: String, required: true, trim: true },
                            author: {
                                    type: mongoose.Schema.Types.ObjectId,
                                    ref: "User",
                                    required: true
                            },
                            createdAt: { type: Date, default: Date.now }
                    }
            ]
    },
    { timestamps: true }
);

// 🚀 fast queries: user feed / recent posts
postSchema.index({ author: 1, createdAt: -1 }); // compound index

// 🔍 optional: search by title
postSchema.index({ title: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
