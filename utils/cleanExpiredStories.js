const cron = require("node-cron");
const Story = require("../models/story.model");
const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    s3ForcePathStyle: true,
});

/**
 * 🔥 Видаляє сторіси старше 24 годин з бази та CDN
 */
const cleanExpiredStories = async () => {
    try {
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 години назад

        const expiredStories = await Story.find({ createdAt: { $lt: cutoff } });

        if (expiredStories.length === 0) {
            console.log("🧹 No expired stories found.");
            return;
        }

        console.log(`🧨 Found ${expiredStories.length} expired stories. Deleting...`);

        for (const story of expiredStories) {
            // Витягаємо шлях файлу з URL
            const fileKey = story.url.replace(process.env.S3_PUBLIC_URL, "");

            try {
                await s3
                    .deleteObject({
                        Bucket: process.env.S3_BUCKET,
                        Key: fileKey,
                    })
                    .promise();

                console.log(`🗑️ Deleted from CDN: ${fileKey}`);
            } catch (err) {
                console.error(`⚠️ Failed to delete from CDN: ${fileKey}`, err.message);
            }

            // Видаляємо з MongoDB
            await Story.findByIdAndDelete(story._id);
            console.log(`✅ Deleted story from DB: ${story._id}`);
        }

        console.log("🎯 Cleanup completed successfully.");
    } catch (err) {
        console.error("❌ Story cleanup failed:", err.message);
    }
};


cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running hourly story cleanup...");
    await cleanExpiredStories();
});

module.exports = { cleanExpiredStories };
