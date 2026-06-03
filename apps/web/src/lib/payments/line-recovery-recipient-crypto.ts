import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const RECIPIENT_ENCRYPTION_KEY_ENV = "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY";
const CONTACT_HASH_SECRET_ENV = "PAYMENT_RECOVERY_CONTACT_HASH_SECRET";
const RECIPIENT_HASH_PURPOSE = "line_recovery_recipient:v1";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export type LineRecoveryRecipientSecretError =
  | "line_recovery_recipient_encryption_key_missing"
  | "line_recovery_recipient_encryption_key_invalid"
  | "payment_recovery_contact_hash_secret_missing";

export class LineRecoveryRecipientConfigError extends Error {
  constructor(public readonly code: LineRecoveryRecipientSecretError) {
    super(code);
  }
}

function getRequiredEnv(input: {
  name: typeof RECIPIENT_ENCRYPTION_KEY_ENV | typeof CONTACT_HASH_SECRET_ENV;
  env: NodeJS.ProcessEnv;
}) {
  const value = input.env[input.name]?.trim();

  if (!value) {
    throw new LineRecoveryRecipientConfigError(
      input.name === CONTACT_HASH_SECRET_ENV
        ? "payment_recovery_contact_hash_secret_missing"
        : "line_recovery_recipient_encryption_key_missing",
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
    throw new LineRecoveryRecipientConfigError(
      "line_recovery_recipient_encryption_key_invalid",
    );
  }

  return key;
}

function normalizeLineRecipient(lineUserId: string) {
  return lineUserId.trim();
}

export function assertNoLineRecoveryRecipientBearerToken(value: string) {
  if (/(^|[^A-Za-z0-9_-])(pa_|pcs_|prl_)[A-Za-z0-9_-]+/u.test(value)) {
    throw new Error("line_recovery_recipient_bearer_token_not_allowed");
  }
}

export function hashLineRecoveryRecipient(input: {
  lineUserId: string;
  env?: NodeJS.ProcessEnv;
}) {
  assertNoLineRecoveryRecipientBearerToken(input.lineUserId);

  const secret = getRequiredEnv({
    name: CONTACT_HASH_SECRET_ENV,
    env: input.env ?? process.env,
  });
  const normalized = normalizeLineRecipient(input.lineUserId);

  return createHmac("sha256", secret)
    .update(`${RECIPIENT_HASH_PURPOSE}:${normalized}`)
    .digest("hex");
}

export function encryptLineRecoveryRecipient(input: {
  lineUserId: string;
  env?: NodeJS.ProcessEnv;
}) {
  assertNoLineRecoveryRecipientBearerToken(input.lineUserId);

  const key = decodeEncryptionKey(
    getRequiredEnv({
      name: RECIPIENT_ENCRYPTION_KEY_ENV,
      env: input.env ?? process.env,
    }),
  );
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });
  const ciphertext = Buffer.concat([
    cipher.update(normalizeLineRecipient(input.lineUserId), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptLineRecoveryRecipient(input: {
  encryptedRecipient: string;
  env?: NodeJS.ProcessEnv;
}) {
  const key = decodeEncryptionKey(
    getRequiredEnv({
      name: RECIPIENT_ENCRYPTION_KEY_ENV,
      env: input.env ?? process.env,
    }),
  );
  const [version, ivPart, tagPart, ciphertextPart] = input.encryptedRecipient.split(".");

  if (version !== "v1" || !ivPart || !tagPart || !ciphertextPart) {
    throw new LineRecoveryRecipientConfigError(
      "line_recovery_recipient_encryption_key_invalid",
    );
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
