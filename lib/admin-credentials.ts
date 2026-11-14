import bcrypt from "bcryptjs";

export type AdminCredentialDocument = {
  $id: string;
  username: string;
  passwordHash?: string;
  password?: string;
};

function isBcryptHash(value: string | undefined): value is string {
  return Boolean(value && /^\$2[aby]\$\d{2}\$/.test(value));
}

/**
 * Supports the legacy Appwrite `password` field once, then upgrades it to
 * the bcrypt `passwordHash` field used by the application.
 */
export async function verifyAdminPassword(
  password: string,
  adminDoc: AdminCredentialDocument
) {
  const passwordHash = adminDoc.passwordHash;

  if (isBcryptHash(passwordHash)) {
    return {
      valid: await bcrypt.compare(password, passwordHash),
      needsMigration: false,
    };
  }

  const legacyPassword = adminDoc.password ?? adminDoc.passwordHash;

  return {
    valid: typeof legacyPassword === "string" && password === legacyPassword,
    needsMigration: true,
  };
}

export function hashAdminPassword(password: string) {
  return bcrypt.hash(password, 12);
}
