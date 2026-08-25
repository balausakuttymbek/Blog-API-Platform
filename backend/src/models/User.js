import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    username: { type: String, default: "" },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });


export default mongoose.model("User", userSchema);
