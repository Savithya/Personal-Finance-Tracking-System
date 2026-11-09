import crypto from "crypto";
import { getDatabase } from "./server-db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@Finora2026!";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "finora_default_session_secret_key_lkr_2026";
const SESSION_DURATION_HOURS = 12;

/**
 * Hash password with salt using scrypt
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/**
 * Verify given password against environment variable ADMIN_PASSWORD using secure hash comparison
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;

  // Salt for standardizing
  const salt = "finora_admin_fixed_salt_v1";
  const expectedHash = hashPassword(ADMIN_PASSWORD, salt);
  const providedHash = hashPassword(password, salt);

  const bufExpected = Buffer.from(expectedHash, "hex");
  const bufProvided = Buffer.from(providedHash, "hex");

  if (bufExpected.length !== bufProvided.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufProvided);
}

/**
 * Generate a cryptographically signed session token
 */
export function createAdminSession(username: string = "admin"): string {
  const db = getDatabase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(rawToken)
    .digest("hex");
  const token = `${rawToken}.${signature}`;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO admin_sessions (token, username, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, username, now.toISOString(), expiresAt);

  return token;
}

/**
 * Validate session token against database and expiration
 */
export function validateAdminSession(token: string | null | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [rawToken, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(rawToken)
    .digest("hex");

  const bufExpected = Buffer.from(expectedSignature, "utf-8");
  const bufProvided = Buffer.from(signature, "utf-8");

  if (bufExpected.length !== bufProvided.length) return false;
  if (!crypto.timingSafeEqual(bufExpected, bufProvided)) return false;

  const db = getDatabase();
  const session = db.prepare(`
    SELECT * FROM admin_sessions WHERE token = ?
  `).get(token) as any;

  if (!session) return false;

  // Check expiration
  const expiresAt = new Date(session.expires_at).getTime();
  if (Date.now() > expiresAt) {
    db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
    return false;
  }

  return true;
}

/**
 * Destroy admin session
 */
export function destroyAdminSession(token: string | null | undefined): void {
  if (!token) return;
  const db = getDatabase();
  db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
}
