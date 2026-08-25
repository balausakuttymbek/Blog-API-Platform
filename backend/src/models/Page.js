import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
    title: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    archived: { type: Boolean, default: false }
}, { timestamps: true });

pageSchema.index({ userId: 1 });

export default mongoose.model("Page", pageSchema);
