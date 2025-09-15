const Story = require("../models/story.model.js");
const Actual = require("../models/actual.model");
const Post = require("../models/post.model");
const Slider = require("../models/slider.model");
const { uploadImage } = require("../utils/uploadImage");
const Review = require("../models/review.model");
const telegramBot = require("../telegram-bot/telegramBot");
const MainSection = require("../models/mainSection.model");
const Instructor = require("../models/instructor.model");

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

const upsertMainSection = async (req, res) => {
    try {
        const { title, description, publications, followers, students } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Missing fields" });
        }
        let mainSection = await MainSection.findOne();
        if (mainSection) {
            mainSection.title = title;
            mainSection.description = description;
            mainSection.publications = publications ?? mainSection.publications;
            mainSection.followers = followers ?? mainSection.followers;
            mainSection.students = students ?? mainSection.students;
            await mainSection.save();
        } else {
            mainSection = new MainSection({ title, description, publications, followers, students });
            await mainSection.save();
        }
        res.status(201).json(mainSection);
    } catch (err) {
        res.status(500).json({ message: "Failed to save main section", error: err.message });
    }
};

const deleteActual = async (req, res) => {
    try {
        const { id } = req.params;
        await Actual.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete actual", error: err.message });
    }
};

const getMainSection = async (req, res) => {
    try {
        const mainSection = await MainSection.findOne();
        res.json(mainSection);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch main section", error: err.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        post.text = text;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Failed to update post", error: err.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete post", error: err.message });
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

const getInstructors = async (req, res) => {
    const instructors = await Instructor.find();
    res.json(instructors);
};

const createInstructor = async (req, res) => {
    try {
        const { fullName, description, characteristics } = req.body;
        let photoUrl = "";
        if (req.file) {
            const timestamp = Date.now();
            const originalName = req.file.originalname.replace(/\s+/g, "_");
            const fileName = `avtoacademy/instructors/${timestamp}_${originalName}`;
            photoUrl = await uploadImage(req.file, fileName);
        }
        const instructor = await Instructor.create({
            fullName,
            photo: photoUrl,
            description,
            characteristics: JSON.parse(characteristics),
        });
        res.json(instructor);
    } catch (err) {
        res.status(500).json({ message: "Failed to create instructor", error: err.message });
    }
};

const updateInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, description, characteristics } = req.body;
        let update = { fullName, description, characteristics: JSON.parse(characteristics) };
        if (req.file) {
            const timestamp = Date.now();
            const originalName = req.file.originalname.replace(/\s+/g, "_");
            const fileName = `avtoacademy/instructors/${timestamp}_${originalName}`;
            update.photo = await uploadImage(req.file, fileName);
        }
        const instructor = await Instructor.findByIdAndUpdate(id, update, { new: true });
        res.json(instructor);
    } catch (err) {
        res.status(500).json({ message: "Failed to update instructor", error: err.message });
    }
};

const deleteInstructor = async (req, res) => {
    await Instructor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
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
        const {
            name, phone, comment,
            ip, city, country, region, loc, org, timezone,
            userAgent, browser, browserVersion, os, osVersion, device
        } = req.body;

        const message =
            `📝 Новий запис\n` +
            `----------------------\n` +
            `👤 Ім'я: ${name}\n` +
            `📞 Контакт: ${phone}\n` +
            (comment ? `💬 Коментар: ${comment}\n` : "") +
            `----------------------\n` +
            `Додаткова інформація:\n` +
            `🌍 IP: ${ip}\n` +
            `🏙️ Місто: ${city}\n` +
            `📋 Регіон: ${region}\n` +
            `🇺🇦 Країна: ${country}\n` +
            `🕑 Часовий пояс: ${timezone}\n` +
            `🏢 Організація: ${org}\n` +
            `📍 Локація: ${loc}\n` +
            `🖥️ Пристрій: ${device}\n` +
            `🧭 ОС: ${os} ${osVersion}\n` +
            `🌐 Браузер: ${browser} ${browserVersion}\n` +
            `📝 User Agent: ${userAgent}\n`;

        await telegramBot.sendMessageToChannel(message, { parse_mode: "Markdown" });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const replaceSliderImage = async (req, res) => {
    try {
        const idx = parseInt(req.params.idx, 10);
        if (isNaN(idx) || !req.file) return res.status(400).json({ message: "Invalid index or no file" });

        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, "_");
        const fileName = `avtoacademy/slider/${timestamp}_${originalName}`;
        const fileUrl = await uploadImage(req.file, fileName);

        let slider = await Slider.findOne();
        if (!slider || !slider.images[idx]) return res.status(404).json({ message: "Image not found" });

        slider.images[idx] = fileUrl;
        await slider.save();
        res.status(200).json(slider);
    } catch (err) {
        res.status(500).json({ message: "Failed to replace image", error: err.message });
    }
};

const deleteSliderImage = async (req, res) => {
    try {
        const idx = parseInt(req.params.idx, 10);
        let slider = await Slider.findOne();
        if (!slider || !slider.images[idx]) return res.status(404).json({ message: "Image not found" });

        slider.images.splice(idx, 1);
        await slider.save();
        res.status(200).json(slider);
    } catch (err) {
        res.status(500).json({ message: "Failed to delete image", error: err.message });
    }
};

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
    sendTelegramMessage,
    getMainSection,
    upsertMainSection,
    deleteActual,
    updatePost,
    deletePost,
    replaceSliderImage,
    deleteSliderImage,
    createInstructor,
    getInstructors,
    updateInstructor,
    deleteInstructor

};