import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
    type: { type: String, enum: ["text", "todo"], required: true },
    content: String,
    completed: { type: Boolean, default: false },
    order: Number
});

blockSchema.index({ pageId: 1, type: 1 });

export default mongoose.model("Block", blockSchema);
