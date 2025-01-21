import crypto from "crypto";

// Define a secret key and initialization vector (IV)
// Ideally, store the key and IV securely, such as in environment variables
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef"; // Must be 32 bytes
const IV = process.env.IV || "0123456789abcdef"; // Must be 16 bytes

export const encrypt = (data) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    IV
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (data) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    IV
  );
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
