const express = require("express");
const router = express.Router();
const multer = require("multer");
const contentController = require("../controllers/content.controller");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMany = multer({ storage }).array("files", 10);
const uploadReviewFiles = multer({ storage }).fields([
    { name: "avatar", maxCount: 1 },
    { name: "photo", maxCount: 1 }
]);
router.post("/stories/upload", upload.single("file"), contentController.uploadStory);
router.get("/stories/get-all", contentController.getStories);
router.post("/actuals/create", contentController.createActual);
router.get("/actuals/get-all", contentController.getActuals);
router.post("/actuals/upload-file", upload.single("file"), contentController.uploadActualFile);
router.post("/actuals/:id/upload", upload.single("file"), contentController.uploadActualContent);
router.post("/posts/upload", upload.single("file"), contentController.uploadPost);
router.get("/posts/get-all", contentController.getPosts);
router.post("/slider/upload", uploadMany, contentController.uploadSliderImages);
router.get("/slider/get-all", contentController.getSliderImages);
router.post("/slider/upload-single", upload.single("file"), contentController.uploadSliderImageSingle);
router.post("/reviews/create", uploadReviewFiles, contentController.createReview);
router.get("/reviews/get-all", contentController.getReviews);
router.post("/telegram/send", contentController.sendTelegramMessage);

module.exports = router;