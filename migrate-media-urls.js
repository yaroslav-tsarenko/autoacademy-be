require("dotenv").config({
    path: require("path").resolve(__dirname, ".env"),
});

const mongoose = require("mongoose");

const OLD_BASE = "https://media.shipster.se/";
const NEW_BASE = "https://pub-e838b1dd021642d3b699bff4fd3a2529.r2.dev/";

const collectionsToCheck = [
    "posts",
    "stories",
    "sliders",
    "reviews",
    "actuals",
    "instructors",
];

function replaceInObject(value) {
    if (typeof value === "string") {
        return value.startsWith(OLD_BASE)
            ? value.replace(OLD_BASE, NEW_BASE)
            : value;
    }

    if (Array.isArray(value)) {
        return value.map(replaceInObject);
    }

    if (value && typeof value === "object") {
        let changed = false;
        const newObj = {};

        for (const key in value) {
            const replaced = replaceInObject(value[key]);
            newObj[key] = replaced;
            if (replaced !== value[key]) changed = true;
        }

        return changed ? newObj : value;
    }

    return value;
}

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    for (const name of collectionsToCheck) {
        const collection = db.collection(name);

        const cursor = collection.find({
            $or: [
                { mediaUrl: { $regex: OLD_BASE } },
                { photo: { $regex: OLD_BASE } },
                { avatar: { $regex: OLD_BASE } },
                { thumbnail: { $regex: OLD_BASE } },   // 🔥 ОЦЕ ГОЛОВНЕ
                { images: { $elemMatch: { $regex: OLD_BASE } } },
            ],
        });


        let updated = 0;

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            const newDoc = replaceInObject(doc);

            if (JSON.stringify(newDoc) !== JSON.stringify(doc)) {
                await collection.replaceOne({ _id: doc._id }, newDoc);
                updated++;
            }
        }

        console.log(`🔁 ${name}: updated ${updated} documents`);
    }

    console.log("🎉 Migration completed successfully");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
});
