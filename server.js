require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ora = require("ora").default; // Fix: use .default for ESM export
const chalk = require("chalk").default;
const contentRoutes = require("./routes/content.route");
const connectDB = require("./utils/connect");
const { cleanExpiredStories } = require("./utils/cleanExpiredStories.js");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/content", contentRoutes);

const PORT = process.env.PORT || 4000;

const spinner = ora("Connecting to MongoDB...");
spinner.start();

connectDB(process.env.MONGODB_URI)
    .then(() => {
        spinner.succeed(chalk.green.bold("✅ MongoDB connected successfully!"));
        app.listen(PORT, () => {
            cleanExpiredStories();
            console.log(chalk.cyan.bold(`🚀 API running on http://localhost:${PORT}`));
            console.log("🧭 Story cleanup cron initialized (runs every 1h).");
        });
    })
    .catch((err) => {
        spinner.fail(chalk.red.bold("❌ Failed to connect to MongoDB!"));
        console.error(err);
        process.exit(1);
    });