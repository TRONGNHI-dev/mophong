import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function getTokenSecret() {
  const secret = process.env.JWT_SECRET || process.env.TOKEN_SECRET;

  if (!secret) {
    throw new Error("Thiếu JWT_SECRET trong file .env.");
  }

  return secret;
}

function sign(data) {
  return createHmac("sha256", getTokenSecret()).update(data).digest("base64url");
}

export function createToken(payload, expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyToken(token) {
  try {
    const parts = token?.split(".");
    if (!parts || parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedBody, signature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedBody}`;
    const expectedSignature = sign(unsignedToken);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return null;
    }

    const payload = base64UrlDecode(encodedBody);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
