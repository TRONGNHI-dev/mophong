import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const HASH_PREFIX = "pbkdf2";

function toBuffer(value) {
  return Buffer.from(value, "hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");

  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

export function isPasswordHash(value) {
  return Boolean(value?.startsWith(`${HASH_PREFIX}$`));
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !isPasswordHash(storedHash)) {
    return false;
  }

  const [, iterations, salt, hash] = storedHash.split("$");
  if (!iterations || !salt || !hash) {
    return false;
  }

  const expected = toBuffer(hash);
  const actual = pbkdf2Sync(password, salt, Number(iterations), expected.length, DIGEST);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
