const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema({
    images: [{ type: String, required: true }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Slider", SliderSchema);