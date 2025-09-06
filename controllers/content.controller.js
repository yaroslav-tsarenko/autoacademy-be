const Story = require("../models/story.model.js");
const Actual = require("../models/actual.model");
const Post = require("../models/post.model");
const Slider = require("../models/slider.model");
const { uploadImage } = require("../utils/uploadImage");
const Review = require("../models/review.model");
const telegramBot = require("../telegram-bot/telegramBot");

const uploadStory = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/files/${timestamp}_${originalName}`;

        const fileUrl = await uploadImage(req.file, fileName);
        const type = req.file.mimetype.startsWith("image") ? "image" : "video";

        const story = new Story({ url: fileUrl, type });
        await story.save();

        res.status(201).json(story);
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const getStories = async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch stories", error: err.message });
    }
};


const createActual = async (req, res) => {
    try {
        const { urls, title, thumbnail } = req.body;
        if (!urls || !Array.isArray(urls) || urls.length === 0 || !title || !thumbnail) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const actual = new Actual({ title, thumbnail, content: urls });
        await actual.save();
        res.status(201).json(actual);
    } catch (err) {
        res.status(500).json({ message: "Failed to create actual", error: err.message });
    }
};

const getActuals = async (req, res) => {
    try {
        const actuals = await Actual.find().sort({ createdAt: -1 });
        res.json(actuals);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch actuals", error: err.message });
    }
};

const uploadActualContent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const actual = await Actual.findById(id);
        if (!actual) return res.status(404).json({ message: "Actual not found" });

        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/actuals/${timestamp}_${originalName}`;
        const fileUrl = await uploadImage(req.file, fileName);

        actual.content.push(fileUrl);
        await actual.save();

        res.status(201).json(actual);
    } catch (err) {
        res.status(500).json({ message: "Failed to upload content", error: err.message });
    }
};

const uploadActualFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/actuals/${timestamp}_${originalName}`;
        const fileUrl = await uploadImage(req.file, fileName);
        res.status(201).json({ url: fileUrl });
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const uploadPost = async (req, res) => {
    try {
        if (!req.file || !req.body.text) return res.status(400).json({ message: "Missing file or text" });

        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/posts/${timestamp}_${originalName}`;
        const fileUrl = await uploadImage(req.file, fileName);
        const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
        const post = new Post({ mediaUrl: fileUrl, mediaType, text: req.body.text });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch posts", error: err.message });
    }
};

const uploadSliderImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });
        const urls = [];
        for (const file of req.files) {
            const timestamp = Date.now();
            const originalName = file.originalname.replace(/\s+/g, "_");
            const fileName = `avtoacademy/slider/${timestamp}_${originalName}`;
            const fileUrl = await uploadImage(file, fileName);
            urls.push(fileUrl);
        }
        // Save or update single slider document
        let slider = await Slider.findOne();
        if (slider) {
            slider.images.push(...urls);
            await slider.save();
        } else {
            slider = new Slider({ images: urls });
            await slider.save();
        }
        res.status(201).json(slider);
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const getSliderImages = async (req, res) => {
    try {
        const slider = await Slider.findOne();
        res.json(slider ? slider.images : []);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch slider images", error: err.message });
    }
};


const uploadSliderImageSingle = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/slider/${timestamp}_${originalName}`;
        const fileUrl = await uploadImage(req.file, fileName);

        let slider = await Slider.findOne();
        if (slider) {
            slider.images.push(fileUrl);
            await slider.save();
        } else {
            slider = new Slider({ images: [fileUrl] });
            await slider.save();
        }
        res.status(201).json(slider);
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

const createReview = async (req, res) => {
    try {
        const { fullName, rating, reviews, ago, role, text } = req.body;
        // Get file URLs from S3
        const avatarFile = req.files?.avatar?.[0];
        const photoFile = req.files?.photo?.[0];
        if (!fullName || !avatarFile || !photoFile || !rating || !reviews || !ago || !role || !text) {
            return res.status(400).json({ message: "Missing fields" });
        }
        // Upload files to S3
        const avatarUrl = await uploadImage(avatarFile, `avtoacademy/reviews/avatar_${Date.now()}_${avatarFile.originalname}`);
        const photoUrl = await uploadImage(photoFile, `avtoacademy/reviews/photo_${Date.now()}_${photoFile.originalname}`);

        const review = new Review({
            fullName,
            avatar: avatarUrl,
            photo: photoUrl,
            rating,
            reviews,
            ago,
            role,
            text
        });
        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: "Failed to create review", error: err.message });
    }
};

const getReviews = async (_req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
    }
};


const sendTelegramMessage = async (req, res) => {
    try {
        const { name, phone, comment } = req.body;
        const message =
            `📝 Новий запис\n` +
            `👤 Ім'я: ${name}\n` +
            `📞 Телефон: ${phone}\n` +
            (comment ? `💬 Коментар: ${comment}\n` : "");
        await telegramBot.sendMessageToChannel(message, { parse_mode: "Markdown" });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendTelegramMessage };
module.exports = {
    uploadStory,
    getStories,
    createActual,
    getActuals,
    uploadActualFile,
    uploadActualContent,
    getPosts,
    uploadPost,
    getSliderImages,
    uploadSliderImages,
    uploadSliderImageSingle,
    createReview,
    getReviews,
    sendTelegramMessage
};