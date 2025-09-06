const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    text: { type: String, required: true }, // HTML or markdown
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);