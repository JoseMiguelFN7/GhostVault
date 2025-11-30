/**
 * GhostVault - Client-Side Encryption Module
 * Maneja la encriptación/desencriptación de mensajes y archivos usando CryptoJS
 *
 * CryptoJS debe cargarse ANTES de este script en index.html
 */

/**
 * Genera una clave aleatoria segura
 * @returns {string} Clave en formato Base64
 */
function generateSecureKey() {
  // Generar 32 bytes aleatorios (256 bits) para AES-256
  const randomBytes = CryptoJS.lib.WordArray.random(32);

  // Convertir a Base64 para facilitar transmisión en URL
  const key = CryptoJS.enc.Base64.stringify(randomBytes);

  return key;
}

/**
 * Encripta un mensaje usando AES-256
 * @param {string} content - Contenido a encriptar
 * @param {string} key - Clave de encriptación (puede ser contraseña o clave generada)
 * @returns {string} Contenido encriptado en formato Base64
 */
function encryptMessage(content, key) {
  try {
    // Encriptar usando AES-256-CBC
    const encrypted = CryptoJS.AES.encrypt(content, key);

    // Convertir a string Base64 para almacenamiento
    const encryptedString = encrypted.toString();

    return encryptedString;
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error("Failed to encrypt message: " + error.message);
  }
}

/**
 * Desencripta un mensaje usando AES-256
 * @param {string} encryptedContent - Contenido encriptado en Base64
 * @param {string} key - Clave de desencriptación
 * @returns {string} Contenido original desencriptado
 */
function decryptMessage(encryptedContent, key) {
  try {
    // Desencriptar
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);

    // Convertir a UTF-8
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Decryption produced empty result - wrong key?");
    }

    return decryptedString;
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Failed to decrypt message: " + error.message);
  }
}

/**
 * Convert File object to Base64 string
 * @param {File} file - File object to convert
 * @returns {Promise<string>} - Resolves with Base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // Result includes "data:mime/type;base64,..." prefix
      // Extract only the Base64 part
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = (error) => {
      console.error("❌ FileReader error:", error);
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Encrypt a file (name and content)
 * @param {File} file - File object to encrypt
 * @param {string} key - Encryption key (same as message encryption)
 * @returns {Promise<Object>} - Resolves with { encrypted_name, file_data }
 */
async function encryptFile(file, key) {
  try {
    // Convert file to Base64
    const base64Content = await fileToBase64(file);

    // Encrypt filename (including extension)
    const encryptedName = CryptoJS.AES.encrypt(file.name, key).toString();

    // Encrypt Base64 content
    const encryptedContent = CryptoJS.AES.encrypt(
      base64Content,
      key
    ).toString();

    return {
      encrypted_name: encryptedName,
      file_data: encryptedContent,
    };
  } catch (error) {
    console.error(`❌ Error encrypting file ${file.name}:`, error);
    throw error;
  }
}

/**
 * Decrypt a file
 * @param {Object} encryptedFile - Object with { encrypted_name, file_data }
 * @param {string} key - Decryption key
 * @returns {Object} - { filename, base64Content }
 */
function decryptFile(encryptedFile, key) {
  try {
    // Decrypt filename
    const decryptedName = CryptoJS.AES.decrypt(
      encryptedFile.encrypted_name,
      key
    ).toString(CryptoJS.enc.Utf8);

    // Decrypt Base64 content
    const decryptedContent = CryptoJS.AES.decrypt(
      encryptedFile.file_data,
      key
    ).toString(CryptoJS.enc.Utf8);

    if (!decryptedName || !decryptedContent) {
      throw new Error("File decryption failed - invalid key");
    }

    return {
      filename: decryptedName,
      base64Content: decryptedContent,
    };
  } catch (error) {
    console.error("❌ File decryption error:", error);
    throw new Error("File decryption failed - invalid key");
  }
}

/**
 * Extrae la clave del hash de la URL
 * @returns {string|null} Clave extraída o null si no existe
 */
function getKeyFromURL() {
  const hash = window.location.hash;

  if (hash && hash.length > 1) {
    // Remover el # inicial
    const key = hash.substring(1);
    return key;
  }
  return null;
}
// Exportar funciones para uso en otros scripts
window.GhostVaultCrypto = {
  generateSecureKey,
  encryptMessage,
  decryptMessage,
  encryptFile,
  decryptFile,
  fileToBase64,
  getKeyFromURL,
};
