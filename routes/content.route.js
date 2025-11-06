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
const uploadSingle = multer({ storage }).single("file");


router.post("/stories/upload", upload.single("file"), contentController.uploadStory);
router.get("/stories/get-all", contentController.getStories);
router.delete("/stories/:id", contentController.deleteStory);
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
router.post("/main-section/upsert", contentController.upsertMainSection);
router.get("/main-section/get", contentController.getMainSection);
router.delete("/actuals/:id", contentController.deleteActual);
router.put("/posts/:id", contentController.updatePost);
router.delete("/posts/:id", contentController.deletePost);
router.post("/slider/replace/:idx", uploadSingle, contentController.replaceSliderImage);
router.delete("/slider/delete/:idx", contentController.deleteSliderImage);
router.post("/instructors/create", upload.single("photo"), contentController.createInstructor);
router.get("/instructors/get-all", contentController.getInstructors);
router.put("/instructors/:id", upload.single("photo"), contentController.updateInstructor);
router.delete("/instructors/:id", contentController.deleteInstructor);
router.post("/faqs/create", contentController.createFaq);
router.get("/faqs/get-all", contentController.getFaqs);
router.put("/faqs/:id", contentController.updateFaq);
router.delete("/faqs/:id", contentController.deleteFaq);
router.get("/tariffs", contentController.getTariffs);
router.post("/tariffs/create", contentController.createTariff);
router.put("/tariffs/:id", contentController.updateTariff);
router.delete("/tariffs/:id", contentController.deleteTariff);

module.exports = router;