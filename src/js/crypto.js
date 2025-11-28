/**
 * GhostVault - Client-Side Encryption Module
 * Maneja la encriptación/desencriptación de mensajes usando CryptoJS
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

  console.log(
    "🔑 Generated secure key (Base64):",
    key.substring(0, 20) + "..."
  );

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

    console.log("🔒 Message encrypted successfully");
    console.log("   Original length:", content.length, "chars");
    console.log("   Encrypted length:", encryptedString.length, "chars");

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

    console.log("🔓 Message decrypted successfully");
    console.log("   Decrypted length:", decryptedString.length, "chars");

    return decryptedString;
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Failed to decrypt message: " + error.message);
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
    console.log("🔑 Key extracted from URL hash");
    return key;
  }

  console.log("ℹ️ No key found in URL hash");
  return null;
}

console.log("✅ GhostVault Crypto Module loaded");

// Exportar funciones para uso en otros scripts
window.GhostVaultCrypto = {
  generateSecureKey,
  encryptMessage,
  decryptMessage,
  getKeyFromURL,
};
