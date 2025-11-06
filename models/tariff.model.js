const mongoose = require("mongoose");

const TariffSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    features: { type: [String], default: [] },
    buttonText: { type: String, default: "Записатися" },
    popular: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Tariff", TariffSchema);