/**
 * GhostVault - Reception Page
 * Obtiene, desencripta y muestra el secret desde la API
 */

// Elementos del DOM
const secretContentElement = document.getElementById("secretContent");

/**
 * Extraer UUID de la URL
 */
function getUUIDFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const uuidFromQuery = urlParams.get("uuid");

  if (uuidFromQuery) {
    console.log("📌 UUID found in query parameter");
    return uuidFromQuery;
  }

  const path = window.location.pathname;
  const match = path.match(/\/s\/([a-zA-Z0-9-]+)/);

  if (match) {
    console.log("📌 UUID found in URL path");
    return match[1];
  }

  return null;
}

/**
 * Mostrar loading
 */
function showLoading() {
  if (secretContentElement) {
    secretContentElement.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <svg class="animate-spin w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-3 text-slate-300">Loading secret...</span>
      </div>
    `;
  }
}

/**
 * Mostrar error
 */
function showError(message) {
  if (secretContentElement) {
    secretContentElement.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-red-400">
        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-center">${message}</span>
      </div>
    `;
  }
}

/**
 * Mostrar secret desencriptado
 */
function showSecret(content) {
  if (secretContentElement) {
    secretContentElement.textContent = content;
  }
}

/**
 * Mostrar modal de contraseña y retornar promesa con la contraseña
 */
function showPasswordModal() {
  return new Promise((resolve, reject) => {
    // Crear modal
    const modalHTML = `
<div id="passwordModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px);">
  <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1.5rem; padding: 2.5rem; max-width: 28rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); margin: auto;">
          <h3 class="text-2xl font-bold text-white mb-2">Password Required</h3>
          <p class="text-slate-400 mb-6">This secret is password-protected. Enter the password to decrypt.</p>
          
          <input 
            type="password" 
            id="passwordInput" 
            placeholder="Enter password"
             class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 outline-none transition-all mb-2"
          />
          
          <p id="passwordError" class="text-red-400 text-sm mb-4 min-h-[1.25rem]"></p>
          
          <div class="flex gap-3">
            <button 
              id="decryptBtn"
              class="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              Decrypt
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("passwordModal");
    const passwordInput = document.getElementById("passwordInput");
    const passwordError = document.getElementById("passwordError");
    const decryptBtn = document.getElementById("decryptBtn");

    // Focus en el input
    setTimeout(() => passwordInput.focus(), 100);

    // Handler del botón decrypt
    const handleDecrypt = () => {
      const password = passwordInput.value.trim();

      if (!password) {
        passwordError.textContent = "Please enter a password";
        return;
      }

      modal.remove();
      resolve(password);
    };

    // Event listeners
    decryptBtn.addEventListener("click", handleDecrypt);
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleDecrypt();
    });
  });
}

/**
 * Intentar desencriptar el contenido
 */
function tryDecrypt(encryptedContent, key, isUserPassword = false) {
  try {
    const decrypted = window.GhostVaultCrypto.decryptMessage(
      encryptedContent,
      key
    );

    if (!decrypted || decrypted.length === 0) {
      throw new Error("Decryption resulted in empty content");
    }

    console.log("✅ Content decrypted successfully");
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error);

    if (isUserPassword) {
      throw new Error("❌ Incorrect password. Please try again.");
    } else {
      throw new Error("❌ Invalid key in URL");
    }
  }
}

/**
 * Cargar y desencriptar el secret
 */
async function loadSecret() {
  const uuid = getUUIDFromURL();

  console.log("🔍 Current URL:", window.location.href);
  console.log("🔍 UUID extracted:", uuid);

  if (!uuid) {
    showError("Invalid URL: No secret ID found");
    return;
  }

  showLoading();

  try {
    const response = await getSecret(uuid);

    console.log("✅ Secret retrieved:", response);
    console.log("🔐 Requires password:", response.requires_password);

    if (!response.content) {
      showError("Secret content not found");
      return;
    }

    // ESCENARIO 1: requires_password === true (usuario debe ingresar contraseña)
    if (response.requires_password) {
      console.log("🔑 Password required - showing modal");

      let decrypted = null;

      while (!decrypted) {
        try {
          const password = await showPasswordModal();
          console.log("🔐 User entered password, attempting decryption...");

          decrypted = tryDecrypt(response.content, password, true);
          showSecret(decrypted);
        } catch (error) {
          console.error("❌ Decryption attempt failed:", error);
          // El modal se mostrará de nuevo en el loop
        }
      }
    }
    // ESCENARIO 2: requires_password === false (clave debe estar en URL hash)
    else {
      const key = window.GhostVaultCrypto.getKeyFromURL();

      if (!key) {
        console.error("❌ No key found in URL hash");
        showError(
          "❌ Incomplete URL. The encryption key is missing from the link. Please ask the sender to create a new secret and send you the complete URL."
        );
        return;
      }

      console.log("🔑 Key found in URL hash, attempting decryption...");

      try {
        const decrypted = tryDecrypt(response.content, key, false);
        showSecret(decrypted);
      } catch (error) {
        showError(error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error loading secret:", error);

    let errorMessage = "Error loading secret. ";

    if (error.message.includes("API Error: 404")) {
      errorMessage = "This secret does not exist or has already been viewed.";
    } else if (error.message.includes("API Error: 410")) {
      errorMessage = "This secret has expired and is no longer available.";
    } else if (error.message.includes("API Error: 403")) {
      errorMessage = "Access denied. This secret may require a password.";
    } else if (!navigator.onLine) {
      errorMessage =
        "No internet connection. Please check your connection and try again.";
    } else {
      errorMessage += error.message || "Unknown error occurred.";
    }

    showError(errorMessage);
  }
}

// Cargar secret cuando la página esté lista
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSecret);
} else {
  loadSecret();
}

console.log("✅ GhostVault Reception loaded");
