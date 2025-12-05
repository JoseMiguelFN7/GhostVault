/**
 * Converts a File object to a Base64 string.
 * This is necessary to include the file content inside the JSON payload 
 * that will be encrypted.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Once reading is complete, resolve the promise with the result
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:*/*;base64," prefix if you just want the raw string, 
            // but usually for rendering later keeping it is useful. 
            // Let's keep the standard Data URL format.
            resolve(result);
        };

        reader.onerror = (error) => reject(error);

        // Read the file
        reader.readAsDataURL(file);
    });
};