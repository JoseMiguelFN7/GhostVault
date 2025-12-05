import CryptoJS from 'crypto-js';

/**
 * Generates a random alphanumeric password if the user didn't provide one.
 * Length: 16 characters for strong entropy.
 */
export const generateKey = (length = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%^&*';
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
    if (!text) return ""; // Return empty string if input is null/undefined
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

/**
 * Decrypts a string.
 * Used for recovering the message or file data.
 */
export const decryptString = (cipherText: string, secretKey: string): string | null => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        // If decryption results in empty string (wrong key or empty data), return null
        return decrypted || null;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};