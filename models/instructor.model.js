const mongoose = require("mongoose");
const InstructorSchema = new mongoose.Schema({
    fullName: String,
    photo: String,
    description: String,
    characteristics: [String],
});
module.exports = mongoose.model("Instructor", InstructorSchema);