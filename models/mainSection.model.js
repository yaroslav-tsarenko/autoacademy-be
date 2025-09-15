const mongoose = require("mongoose");

const mainSectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    publications: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    students: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("MainSection", mainSectionSchema);