import crypto from "crypto";

// function to hash PW
export function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
            if (error) reject(error);
            // converts to storage-friendly string (hex and normalized)
            resolve(hash.toString("hex").normalize());
        })
    })
}

// function to generate random salt strings
export function generateSalt() {
    return crypto.randomBytes(16).toString("hex").normalize();
}