import type { RedisConnection } from "@bullstudio/prisma";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  return Buffer.from(key, "hex");
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export interface ResolvedCredentials {
  password?: string;
  tlsCert?: string;
}

/**
 * Resolves encrypted credentials from a database connection record.
 */
export function resolveCredentials(
  connection: RedisConnection
): ResolvedCredentials {
  const result: ResolvedCredentials = {};

  if (
    connection.encryptedPassword &&
    connection.passwordIv &&
    connection.passwordTag
  ) {
    result.password = decrypt(
      connection.encryptedPassword,
      connection.passwordIv,
      connection.passwordTag
    );
  }

  if (
    connection.encryptedTlsCert &&
    connection.tlsCertIv &&
    connection.tlsCertTag
  ) {
    result.tlsCert = decrypt(
      connection.encryptedTlsCert,
      connection.tlsCertIv,
      connection.tlsCertTag
    );
  }

  return result;
}
