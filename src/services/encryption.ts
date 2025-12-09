import CryptoJS from 'crypto-js';

// A magic token to validate correct decryption
const MAGIC_TOKEN = "||GV-VALID||";

/**
 * Generates a random alphanumeric password if the user didn't provide one.
 * Length: 16 characters for strong entropy.
 */
export const generateKey = (length = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Encrypts any string using AES.
 * Used for: Message body, File Names, and File Content (Base64).
 * @param text - The raw string to encrypt
 * @param secretKey - The password used to lock the data
 */
export const encryptString = (text: string, secretKey: string): string => {
    if (text === null || text === undefined) return "";
    
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

/**
 * Decrypts a string.
 * Used for recovering the message or file data.
 */
export const decryptString = (cipherText: string, secretKey: string): string | null => {
    try {
        if (!cipherText) return null;
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        // If decryption results in empty string (wrong key or empty data), return null
        return decrypted || null;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};

/**
 * Encrypts message with a magic token.
 * Adds magic token to ensure correct decryption.
 */
export const encryptMessage = (text: string, secretKey: string): string => {
    // Add MAGIC_TOKEN to validate later
    return encryptString(text + MAGIC_TOKEN, secretKey);
};

/**
 * Decrypt message (With validation).
 * Verifies the magic token to ensure the correct password was used.
 */
export const decryptMessage = (cipherText: string, secretKey: string): string | null => {
    const decrypted = decryptString(cipherText, secretKey);
    
    // if decryption failed, return null
    if (decrypted === null) return null;

    // ESTRICT VALIDATION:
    if (decrypted.endsWith(MAGIC_TOKEN)) {
        // Yes: Remove the magic token and return the original message
        return decrypted.slice(0, -MAGIC_TOKEN.length);
    }

    // If magic token not found, decryption likely failed
    return null;
};