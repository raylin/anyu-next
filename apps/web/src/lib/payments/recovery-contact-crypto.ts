import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const ENCRYPTION_KEY_ENV = "PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY";
const HASH_SECRET_ENV = "PAYMENT_RECOVERY_CONTACT_HASH_SECRET";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export type RecoveryContactSecretError =
  | "payment_recovery_contact_hash_secret_missing"
  | "payment_recovery_contact_encryption_key_missing"
  | "payment_recovery_contact_encryption_key_invalid";

export class RecoveryContactConfigError extends Error {
  constructor(public readonly code: RecoveryContactSecretError) {
    super(code);
  }
}

function getRequiredEnv(name: string, env: NodeJS.ProcessEnv) {
  const value = env[name]?.trim();

  if (!value) {
    throw new RecoveryContactConfigError(
      name === HASH_SECRET_ENV
        ? "payment_recovery_contact_hash_secret_missing"
        : "payment_recovery_contact_encryption_key_missing",
    );
  }

  return value;
}

function decodeEncryptionKey(value: string) {
  const candidates = [
    Buffer.from(value, "base64url"),
    Buffer.from(value, "base64"),
  ];

  if (/^[0-9a-f]{64}$/iu.test(value)) {
    candidates.push(Buffer.from(value, "hex"));
  }

  const key = candidates.find((candidate) => candidate.length === 32);

  if (!key) {
    throw new RecoveryContactConfigError("payment_recovery_contact_encryption_key_invalid");
  }

  return key;
}

export function normalizeRecoveryEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashRecoveryContact(input: {
  value: string;
  contactType: "email" | "line";
  env?: NodeJS.ProcessEnv;
}) {
  const secret = getRequiredEnv(HASH_SECRET_ENV, input.env ?? process.env);
  const normalized = input.contactType === "email" ? normalizeRecoveryEmail(input.value) : input.value.trim();

  return createHmac("sha256", secret)
    .update(`payment_recovery_contact:v1:${input.contactType}:${normalized}`)
    .digest("hex");
}

export function encryptRecoveryContactValue(input: {
  value: string;
  env?: NodeJS.ProcessEnv;
}) {
  const key = decodeEncryptionKey(getRequiredEnv(ENCRYPTION_KEY_ENV, input.env ?? process.env));
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });
  const ciphertext = Buffer.concat([
    cipher.update(input.value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptRecoveryContactValue(input: {
  encryptedValue: string;
  env?: NodeJS.ProcessEnv;
}) {
  const key = decodeEncryptionKey(getRequiredEnv(ENCRYPTION_KEY_ENV, input.env ?? process.env));
  const [version, ivPart, tagPart, ciphertextPart] = input.encryptedValue.split(".");

  if (version !== "v1" || !ivPart || !tagPart || !ciphertextPart) {
    throw new RecoveryContactConfigError("payment_recovery_contact_encryption_key_invalid");
  }

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(ivPart, "base64url"), {
    authTagLength: AUTH_TAG_BYTES,
  });
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function assertNoRecoveryBearerToken(value: string) {
  if (/(^|[^A-Za-z0-9_-])(pa_|pcs_)[A-Za-z0-9_-]+/u.test(value)) {
    throw new Error("recovery_contact_bearer_token_not_allowed");
  }
}
