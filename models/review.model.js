const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    avatar: { type: String, required: true },
    photo: { type: String, required: true },
    rating: { type: Number, required: true },
    reviews: { type: String, required: true },
    ago: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);