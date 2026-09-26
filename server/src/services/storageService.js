/**
 * NormWise Document Storage Service
 * Provider-independent storage abstraction.
 * Saves uploaded documents into protected local filesystem storage outside public static web roots.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: server/uploads/
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

// Ensure upload directory exists on module initialization
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error("[StorageService] Failed to create upload directory:", err);
  }
}
ensureUploadDir();

/**
 * Sanitize filename to prevent directory traversal or unsafe chars
 */
export function sanitizeFilename(name = "") {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 150);
}

/**
 * Save uploaded file buffer to protected disk storage
 */
export async function saveFile({ buffer, originalname = "document.pdf", mimetype = "application/pdf" }) {
  await ensureUploadDir();

  const safeOriginal = sanitizeFilename(originalname);
  const ext = path.extname(safeOriginal).toLowerCase() || (mimetype.includes("word") ? ".docx" : ".pdf");
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const storedFilename = `doc_${Date.now()}_${randomSuffix}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, storedFilename);

  await fs.writeFile(fullPath, buffer);

  const stats = await fs.stat(fullPath);

  // Normalize fileType (PDF or DOCX)
  const fileType = ext === ".docx" || mimetype.includes("word") ? "DOCX" : "PDF";

  return {
    storagePath: fullPath,
    filename: storedFilename,
    originalFilename: safeOriginal,
    fileSize: String(stats.size),
    fileType,
  };
}

/**
 * Read file buffer from storage path
 */
export async function getFile(storagePath) {
  if (!storagePath) {
    throw new Error("Storage path must be provided.");
  }
  // Ensure the requested file is inside UPLOAD_DIR (prevent traversal)
  const resolved = path.resolve(storagePath);
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error("Access denied: File outside authorized storage root.");
  }

  return await fs.readFile(resolved);
}

/**
 * Delete file from storage path safely
 */
export async function deleteFile(storagePath) {
  if (!storagePath) return false;
  try {
    const resolved = path.resolve(storagePath);
    if (!resolved.startsWith(UPLOAD_DIR)) return false;
    await fs.unlink(resolved);
    return true;
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("[StorageService] Error deleting file:", err.message);
    }
    return false;
  }
}
