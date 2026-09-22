const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

function getPublicIdFromUrl(url) {
  try {
    const parsedUrl = new URL(url);

    const uploadIndex = parsedUrl.pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return "";
    }

    let publicId = parsedUrl.pathname.substring(
      uploadIndex + "/upload/".length
    );

    // Remove Cloudinary transformation parameters if present.
    const parts = publicId.split("/");

    const versionIndex = parts.findIndex((part) =>
      /^v\d+$/.test(part)
    );

    if (versionIndex !== -1) {
      publicId = parts.slice(versionIndex + 1).join("/");
    }

    // Remove file extension.
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch {
    return "";
  }
}

async function migratePortfolio() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected");

    const db = mongoose.connection.db;
    const photographers = db.collection("photographers");

    const documents = await photographers.find({}).toArray();

    console.log(
      `Found ${documents.length} photographer profile(s)`
    );

    let updatedCount = 0;

    for (const photographer of documents) {
      if (!Array.isArray(photographer.portfolio)) {
        continue;
      }

      const hasOldFormat = photographer.portfolio.some(
        (image) => typeof image === "string"
      );

      if (!hasOldFormat) {
        continue;
      }

      const migratedPortfolio = photographer.portfolio
        .map((image) => {
          if (typeof image === "string") {
            return {
              url: image,
              publicId: getPublicIdFromUrl(image),
            };
          }

          return image;
        })
        .filter((image) => image.url);

      await photographers.updateOne(
        { _id: photographer._id },
        {
          $set: {
            portfolio: migratedPortfolio,
          },
        }
      );

      updatedCount++;

      console.log(
        `Migrated photographer: ${photographer._id}`
      );
    }

    console.log(
      `Migration complete. Updated ${updatedCount} photographer profile(s).`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

migratePortfolio();