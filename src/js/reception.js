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
    return uuidFromQuery;
  }

  const path = window.location.pathname;
  const match = path.match(/\/s\/([a-zA-Z0-9-]+)/);

  if (match) {
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
      <div class="flex items-center justify-center" style="min-height: 250px;">
        <div class="flex items-center">
          <svg class="animate-spin w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-3 text-slate-300">Loading secret...</span>
        </div>
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
function showSecret(content, decryptedFiles = []) {
  // Handle message display
  const messageSection = document.getElementById("messageSection");

  if (content === "[Files Only]" || !content || content.trim() === "") {
    // Hide message section if it's only files
    if (messageSection) {
      messageSection.style.display = "none";
    }
  } else {
    // Show message
    if (messageSection) {
      messageSection.style.display = "block"; // <-- Agregar esta línea
    }
    if (secretContentElement) {
      secretContentElement.textContent = content;
    }
  }

  // Handle files display
  renderFiles(decryptedFiles);
}

/**
 * Mostrar modal de error permanente (no se puede cerrar)
 */
function showPermanentErrorModal(message) {
  const modalHTML = `
<div id="errorModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);">
  <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1.5rem; padding: 2.5rem; max-width: 32rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); margin: auto;">
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <svg style="width: 4rem; height: 4rem; color: #ef4444; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-2xl font-bold text-white mb-3">Error</h3>
    </div>
    <p class="text-slate-300 text-center leading-relaxed mb-4" style="line-height: 1.6;">${message}</p>
    <p class="text-slate-500 text-center text-sm">You can close this tab</p>
  </div>
</div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/**
 * Mostrar modal de contraseña y retornar promesa con la contraseña
 */
function showPasswordModal(onValidate) {
  return new Promise((resolve) => {
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

    // Limpiar error al escribir
    passwordInput.addEventListener("input", () => {
      passwordError.textContent = "";
      passwordInput.style.borderColor = "";
    });

    // Handler del botón decrypt
    const handleDecrypt = async () => {
      const password = passwordInput.value.trim();

      if (!password) {
        passwordError.textContent = "Please enter a password";
        passwordInput.style.borderColor = "#ef4444";
        return;
      }

      // Deshabilitar botón mientras valida
      decryptBtn.disabled = true;
      decryptBtn.textContent = "Validating...";

      // Validar contraseña
      const isValid = await onValidate(password);

      if (isValid) {
        // Contraseña correcta - cerrar modal y resolver
        modal.remove();
        resolve(password);
      } else {
        // Contraseña incorrecta - mostrar error y permitir reintentar
        passwordError.textContent = "Wrong password. Please try again.";
        passwordInput.style.borderColor = "#ef4444";
        passwordInput.value = "";
        passwordInput.focus();
        decryptBtn.disabled = false;
        decryptBtn.textContent = "Decrypt";
      }
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

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error);

    if (isUserPassword) {
      throw new Error("Incorrect password. Please try again.");
    } else {
      throw new Error("Invalid key in URL");
    }
  }
}

/**
 * Decrypt files array
 */
function decryptFiles(encryptedFiles, key) {
  if (!encryptedFiles || encryptedFiles.length === 0) {
    return [];
  }

  const decryptedFiles = [];

  for (const encryptedFile of encryptedFiles) {
    try {
      const decryptedFile = window.GhostVaultCrypto.decryptFile(
        encryptedFile,
        key
      );
      decryptedFiles.push(decryptedFile);
    } catch (error) {
      console.error("❌ File decryption failed:", error);
      throw new Error("Failed to decrypt files. Wrong encryption key.");
    }
  }

  return decryptedFiles;
}

/**
 * Download file from Base64
 */
function downloadFile(filename, base64Content) {
  try {
    // Convert Base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create Blob
    const blob = new Blob([bytes]);

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file");
  }
}

/**
 * Render files list
 */
function renderFiles(decryptedFiles) {
  const filesSection = document.getElementById("filesSection");
  const filesContainer = document.getElementById("filesContainer");

  if (!decryptedFiles || decryptedFiles.length === 0) {
    // Hide files section if no files
    if (filesSection) {
      filesSection.style.display = "none";
    }
    return;
  }

  // Show files section
  if (filesSection) {
    filesSection.style.display = "block";
  }

  // Update file count label
  const label = filesSection?.querySelector("label");
  if (label) {
    label.textContent = `Attached Files (${decryptedFiles.length})`;
  }

  // Check if container exists
  if (!filesContainer) {
    console.error("Files container not found");
    return;
  } // Clear existing content
  filesContainer.innerHTML = "";

  // Render each file
  decryptedFiles.forEach((file, index) => {
    const sizeKB = ((file.base64Content.length * 0.75) / 1024).toFixed(1);
    const sizeMB = (sizeKB / 1024).toFixed(2);
    const displaySize = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    const fileHTML = `
      <div class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <svg class="w-6 h-6 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">${file.filename}</p>
            <p class="text-slate-500 text-sm">${displaySize}</p>
          </div>
        </div>
        <button data-file-index="${index}" class="download-btn ml-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Download</span>
        </button>
      </div>
    `;

    filesContainer.insertAdjacentHTML("beforeend", fileHTML);
  });

  // Add event listeners to download buttons
  filesContainer.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.dataset.fileIndex);
      const file = decryptedFiles[index];
      downloadFile(file.filename, file.base64Content);
    });
  });
}

/**
 * Cargar y desencriptar el secret
 */
async function loadSecret() {
  const uuid = getUUIDFromURL();

  if (!uuid) {
    showError("Invalid URL: No secret ID found");
    return;
  }

  showLoading();

  try {
    const response = await getSecret(uuid);

    if (!response.content) {
      showError("Secret content not found");
      return;
    }

    // ESCENARIO 1: requires_password === true (usuario debe ingresar contraseña)
    if (response.requires_password) {
      const password = await showPasswordModal(async (pwd) => {
        try {
          tryDecrypt(response.content, pwd, true);
          return true; // Contraseña correcta
        } catch (error) {
          return false; // Contraseña incorrecta
        }
      });

      // Si llegamos aquí, la contraseña es correcta
      const decrypted = tryDecrypt(response.content, password, true);
      const decryptedFiles = decryptFiles(response.files || [], password);
      showSecret(decrypted, decryptedFiles);
    }
    // ESCENARIO 2: requires_password === false (clave debe estar en URL hash)
    else {
      const key = window.GhostVaultCrypto.getKeyFromURL();

      if (!key) {
        showPermanentErrorModal(
          "Incomplete URL. The encryption key is missing from the link. Please ask the sender to create a new secret and send you the complete URL."
        );
        return;
      }

      try {
        const decrypted = tryDecrypt(response.content, key, false);

        // Decrypt files with same key
        const decryptedFiles = decryptFiles(response.files || [], key);

        showSecret(decrypted, decryptedFiles);
        // Si llegamos aquí, la contraseña es correcta - remover modal
        const modal = document.getElementById("passwordModal");
        if (modal) modal.remove();
      } catch (error) {
        showPermanentErrorModal(error.message);
      }
    }
  } catch (error) {
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

    showPermanentErrorModal(errorMessage);
  }
}

// Cargar secret cuando la página esté lista
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSecret);
} else {
  loadSecret();
}
