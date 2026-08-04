import multer from "multer";
import { cleanupFiles, createStagingFilename, ensureStorageDirectories, stagingRoot, validateStagedFile } from "../services/imageStorage.js";

await ensureStorageDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, stagingRoot),
  filename: createStagingFilename,
});

const acceptedMimeTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 20, fields: 100 },
  fileFilter: (_req, file, callback) => acceptedMimeTypes.has(file.mimetype)
    ? callback(null, true)
    : callback(Object.assign(new Error("Only JPEG, PNG, WebP, and GIF images are supported"), { status: 415 })),
});

const fields = [
  { name: "mainImages", maxCount: 5 },
  ...Array.from({ length: 10 }, (_, index) => ({ name: `variantImages[${index}]`, maxCount: 3 })),
];

export const uploadProductImages = (req, res, next) => upload.fields(fields)(req, res, async error => {
  const files = Object.values(req.files || {}).flat();
  if (error) {
    await cleanupFiles(files);
    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ success: false, error: error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : error.message });
    }
    if (error.code === "ENOSPC") return res.status(507).json({ success: false, error: "Image storage is full" });
    return res.status(error.status || 400).json({ success: false, error: error.message || "Image upload failed" });
  }

  try {
    await Promise.all(files.map(validateStagedFile));
    const cleanup = () => cleanupFiles(files);
    res.once("finish", cleanup);
    res.once("close", cleanup);
    next();
  } catch (validationError) {
    await cleanupFiles(files);
    res.status(validationError.status || 415).json({ success: false, error: validationError.message });
  }
});
