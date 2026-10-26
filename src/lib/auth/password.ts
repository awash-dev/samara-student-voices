import crypto from "node:crypto"
import { neon } from "@neondatabase/serverless"

/**
 * Better Auth / Neon Auth password hashing parameters
 * N: 16384 (cost), r: 16 (blockSize), p: 1 (parallelization), dkLen: 64
 */
const SCRYPT_CONFIG: crypto.ScryptOptions = {
  cost: 16384,
  blockSize: 16,
  parallelization: 1,
  maxmem: 128 * 16384 * 16 * 2,
}

function scryptAsync(
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(derivedKey as Buffer)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(
    password.normalize("NFKC"),
    salt,
    64,
    SCRYPT_CONFIG
  )) as Buffer
  return `${salt}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const [salt, key] = hash.split(":")
    if (!salt || !key) return false
    const derivedKey = (await scryptAsync(
      password.normalize("NFKC"),
      salt,
      64,
      SCRYPT_CONFIG
    )) as Buffer
    return crypto.timingSafeEqual(derivedKey, Buffer.from(key, "hex"))
  } catch {
    return false
  }
}

/**
 * Updates or sets password directly in neon_auth.account table.
 * This works for both credential users AND enables password login for Google OAuth users.
 */
export async function setUserAccountPassword(
  authUserId: string,
  email: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return { ok: false, error: "DATABASE_URL not configured" }
    }

    const hashedPassword = await hashPassword(newPassword)
    const sql = neon(dbUrl)

    // Check if credential account already exists
    const existing = await sql`
      SELECT id FROM neon_auth.account
      WHERE "userId" = ${authUserId} AND "providerId" = 'credential'
      LIMIT 1;
    `

    const now = new Date()

    if (existing.length > 0) {
      await sql`
        UPDATE neon_auth.account
        SET password = ${hashedPassword}, "updatedAt" = ${now}
        WHERE id = ${existing[0].id};
      `
    } else {
      // Create credential account record
      const newAccountId = crypto.randomUUID()
      await sql`
        INSERT INTO neon_auth.account (
          id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt"
        ) VALUES (
          ${newAccountId}, ${authUserId}, ${authUserId}, 'credential', ${hashedPassword}, ${now}, ${now}
        );
      `
    }

    return { ok: true }
  } catch (err) {
    console.error("setUserAccountPassword error:", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to set password",
    }
  }
}
