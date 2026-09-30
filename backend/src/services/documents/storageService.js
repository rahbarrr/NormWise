/**
 * NormWise Document Storage Service
 * Provider-independent storage abstraction.
 * Saves uploaded documents into protected local filesystem storage outside public static web roots.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import supabase from "../../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: configured via UPLOAD_DIR or default server/uploads/
export const UPLOAD_DIR = process.env.UPLOAD_DIR 
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "../../uploads");
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "procurement-documents";
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "supabase";

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
 * Health check: verify upload directory exists, is readable and writable
 */
export async function checkStorageHealth() {
  if (STORAGE_PROVIDER === "supabase") {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).list("", { limit: 1 });
    return error ? { status: "STORAGE_UNAVAILABLE", writable: false, readable: false, provider: "supabase", bucket: STORAGE_BUCKET, error: error.message } : { status: "AVAILABLE", writable: true, readable: true, provider: "supabase", bucket: STORAGE_BUCKET };
  }

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const probePath = path.join(UPLOAD_DIR, `.probe_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`);
    await fs.writeFile(probePath, "normwise_probe", "utf8");
    await fs.readFile(probePath, "utf8");
    await fs.unlink(probePath);
    return {
      status: "AVAILABLE",
      writable: true,
      readable: true,
    };
  } catch (err) {
    return {
      status: "STORAGE_UNAVAILABLE",
      writable: false,
      readable: false,
      error: err.code || "IO_ERROR",
    };
  }
}

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
  const safeOriginal = sanitizeFilename(originalname);
  const ext = path.extname(safeOriginal).toLowerCase() || (mimetype.includes("word") ? ".docx" : ".pdf");
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const storedFilename = `doc_${Date.now()}_${randomSuffix}${ext}`;
  // Normalize fileType (PDF or DOCX)
  const fileType = ext === ".docx" || mimetype.includes("word") ? "DOCX" : "PDF";

  if (STORAGE_PROVIDER === "supabase") {
    const storagePath = `documents/${storedFilename}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, { contentType: mimetype, upsert: false });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    return { storagePath, filename: storedFilename, originalFilename: safeOriginal, fileSize: String(buffer.length), fileType };
  }

  await ensureUploadDir();
  const fullPath = path.join(UPLOAD_DIR, storedFilename);
  await fs.writeFile(fullPath, buffer);
  const stats = await fs.stat(fullPath);

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
  if (STORAGE_PROVIDER === "supabase" && !path.isAbsolute(storagePath)) {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(storagePath);
    if (error) throw new Error(`Supabase Storage download failed: ${error.message}`);
    return Buffer.from(await data.arrayBuffer());
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
  if (STORAGE_PROVIDER === "supabase" && !path.isAbsolute(storagePath)) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return !error;
  }
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
