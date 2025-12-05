import CryptoJS from 'crypto-js';

// Interface for the data structure we want to hide
interface SecretData {
    message: string;
    files: Array<{
        name: string;
        type: string;
        size: number;
        content: string; // Base64 content
    }>;
}

/**
 * Generates a random alphanumeric password if the user didn't provide one.
 * Length: 16 characters for strong entropy.
 */
export const generateKey = (length = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Encrypts the payload using AES (Advanced Encryption Standard).
 * * @param data - The object containing message and files
 * @param secretKey - The password used to lock the data
 * @returns The ciphertext string
 */
export const encryptPayload = (data: SecretData, secretKey: string): string => {
    // 1. Convert the complex object into a simple JSON string
    const jsonString = JSON.stringify(data);

    // 2. Encrypt using AES
    // CryptoJS handles IV and Salt automatically by default unless specified otherwise.
    const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();

    return encrypted;
};

/**
 * Decrypts the payload.
 * (We will use this later in the Reception page)
 */
export const decryptPayload = (cipherText: string, secretKey: string): SecretData | null => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) return null;

        return JSON.parse(decryptedString) as SecretData;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};