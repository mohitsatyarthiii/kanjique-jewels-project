import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const storageRoot = path.resolve(process.env.STORAGE_PATH || path.join(backendRoot, "storage"));
export const stagingRoot = path.join(storageRoot, ".staging");
export const trashRoot = path.join(storageRoot, ".trash");
export const productImageRoot = path.join(storageRoot, "products");

const PUBLIC_PREFIX = "/storage/products/";
const allowedSignatures = [
  { mime: "image/jpeg", extension: ".jpg", matches: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", extension: ".png", matches: b => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  { mime: "image/gif", extension: ".gif", matches: b => ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("ascii")) },
  { mime: "image/webp", extension: ".webp", matches: b => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
];

export const ensureStorageDirectories = async () => {
  await Promise.all([productImageRoot, stagingRoot, trashRoot].map(dir => fs.mkdir(dir, { recursive: true })));
};

export const createStagingFilename = (_req, file, callback) => {
  const safeExtension = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 6);
  callback(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
};

export const validateStagedFile = async file => {
  const handle = await fs.open(file.path, "r");
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const header = buffer.subarray(0, bytesRead);
    const detected = allowedSignatures.find(type => type.matches(header));
    if (!detected || detected.mime !== file.mimetype) {
      const error = new Error("File content does not match a supported image type");
      error.status = 415;
      throw error;
    }
    file.detectedExtension = detected.extension;
  } finally {
    await handle.close();
  }
};

const assertInside = (parent, candidate) => {
  const relative = path.relative(parent, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw Object.assign(new Error("Unsafe image path"), { status: 400 });
  }
};

export const promoteStagedFile = async file => {
  const filename = `${Date.now()}-${crypto.randomUUID()}${file.detectedExtension}`;
  const destination = path.join(productImageRoot, filename);
  assertInside(productImageRoot, destination);
  await fs.rename(file.path, destination);
  return { url: `${PUBLIC_PREFIX}${filename}`, fileName: filename, diskPath: destination };
};

export const imageFileName = image => {
  const raw = image?.fileName || image?.url;
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith(PUBLIC_PREFIX)) return path.basename(raw);
  if (!raw.includes("://") && path.basename(raw) === raw) return raw;
  return null;
};

const resolveStoredImage = image => {
  const filename = imageFileName(image);
  if (!filename) return null;
  const target = path.join(productImageRoot, filename);
  assertInside(productImageRoot, target);
  return target;
};

export const cleanupFiles = async files => {
  await Promise.all((files || []).map(async file => {
    const target = typeof file === "string" ? file : file?.path || file?.diskPath;
    if (!target) return;
    await fs.rm(target, { force: true }).catch(() => undefined);
  }));
};

export const quarantineImages = async images => {
  await ensureStorageDirectories();
  const moved = [];
  try {
    for (const image of images) {
      const source = resolveStoredImage(image);
      if (!source) continue;
      const destination = path.join(trashRoot, `${crypto.randomUUID()}-${path.basename(source)}`);
      try {
        await fs.rename(source, destination);
        moved.push({ source, destination });
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    return moved;
  } catch (error) {
    await restoreQuarantined(moved);
    throw error;
  }
};

export const restoreQuarantined = async moved => {
  for (const entry of [...moved].reverse()) {
    await fs.rename(entry.destination, entry.source).catch(() => undefined);
  }
};

export const purgeQuarantined = async moved => {
  await Promise.all(moved.map(entry => fs.rm(entry.destination, { force: true })));
};

export const allProductImages = product => [
  ...(product.mainImages || []),
  ...(product.variants || []).flatMap(variant => variant.images || []),
];

export const removeAbandonedStagingFiles = async () => {
  await ensureStorageDirectories();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const directory of [stagingRoot, trashRoot]) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    await Promise.all(entries.filter(entry => entry.isFile()).map(async entry => {
      const target = path.join(directory, entry.name);
      const stat = await fs.stat(target);
      if (stat.mtimeMs < cutoff) await fs.rm(target, { force: true });
    }));
  }
};
