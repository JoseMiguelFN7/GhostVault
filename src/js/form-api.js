/**
 * GhostVault - Formulario Integración API
 */

const ghForm = document.getElementById("ghostForm");
const msgInput = document.getElementById("message");
const pwdInput = document.getElementById("password");
const durInput = document.getElementById("duration");
const submitButton = ghForm?.querySelector('button[type="submit"]');

// Mostrar error inline cerca del input
function showInlineError(inputElement, message) {
  // Remover error anterior si existe
  const oldError = document.getElementById("inlineError");
  if (oldError) oldError.remove();

  // Cambiar borde a rojo
  inputElement.style.borderColor = "#ef4444";
  inputElement.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";

  // Crear tooltip
  const errorTooltip = document.createElement("div");
  errorTooltip.id = "inlineError";
  errorTooltip.style.cssText = `
    position: absolute;
    background: rgba(20, 20, 20, 0.95);
    color: #ef4444;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    z-index: 50;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(239, 68, 68, 0.3);
  `;
  errorTooltip.textContent = message;

  // Insertar después del input
  inputElement.parentElement.style.position = "relative";
  inputElement.parentElement.appendChild(errorTooltip);

  // Remover error al escribir
  const removeError = () => {
    inputElement.style.borderColor = "";
    inputElement.style.boxShadow = "";
    errorTooltip.remove();
    inputElement.removeEventListener("input", removeError);
  };

  inputElement.addEventListener("input", removeError);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (document.getElementById("inlineError")) {
      removeError();
    }
  }, 5000);
}

/**
 * Show loading modal while creating secret
 */
function showLoadingModal() {
  const modalHTML = `
<div id="loadingModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px);">
  <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1.5rem; padding: 2.5rem 3rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); text-align: center;">
    <div class="flex items-center justify-center gap-3">
      <svg class="animate-spin w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-white text-lg font-medium">Creating secret...</span>
    </div>
  </div>
</div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/**
 * Hide loading modal
 */
function hideLoadingModal() {
  const modal = document.getElementById("loadingModal");
  if (modal) modal.remove();
}

/**
 * Show error modal with close button
 */
function showErrorModal(message) {
  const modalHTML = `
<div id="errorModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px);">
  <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1.5rem; padding: 2.5rem; max-width: 28rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <svg style="width: 4rem; height: 4rem; color: #ef4444; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-2xl font-bold text-white mb-3">Error</h3>
    </div>
    <p class="text-slate-300 text-center leading-relaxed mb-6" style="line-height: 1.6;">${message}</p>
    <button id="closeErrorBtn" class="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors">
      Close
    </button>
  </div>
</div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("errorModal");
  const closeBtn = document.getElementById("closeErrorBtn");

  // Close on button click
  closeBtn.addEventListener("click", () => modal.remove());

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

ghForm?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const content = msgInput.value.trim();
  const password = pwdInput.value.trim();
  const expiresInHours = parseInt(durInput.value) || 1;

  // Verificar que haya contenido (mensaje O archivos)
  const hasMessage = content.length > 0;
  const hasFiles =
    typeof selectedFiles !== "undefined" && selectedFiles.length > 0;

  if (!hasMessage && !hasFiles) {
    showInlineError(
      msgInput,
      "Please enter a message or attach at least one file"
    );
    return;
  }

  if (password && password.length < 6) {
    showInlineError(pwdInput, "Password must be at least 6 characters");
    return;
  }

  // ========== ENCRYPTION LOGIC ==========
  let encryptionKey;
  let requiresPassword;
  let autoGeneratedKey = null;

  if (password && password.length > 0) {
    // Escenario 1: Usuario ingresó contraseña
    encryptionKey = password;
    requiresPassword = true;
  } else {
    // Escenario 2: Generar clave automática
    encryptionKey = window.GhostVaultCrypto.generateSecureKey();
    requiresPassword = false;
    autoGeneratedKey = encryptionKey; // Guardar para incluir en URL
  }

  // Encriptar el contenido (o placeholder si está vacío)
  const contentToEncrypt = content || "[Files Only]"; // Placeholder si solo hay archivos
  const encryptedContent = window.GhostVaultCrypto.encryptMessage(
    contentToEncrypt,
    encryptionKey
  );

  // ========== FILE ENCRYPTION LOGIC ==========
  const encryptedFiles = [];

  // Check if there are files to encrypt (selectedFiles is defined in script.js)
  if (typeof selectedFiles !== "undefined" && selectedFiles.length > 0) {
    try {
      // Encrypt each file
      for (const file of selectedFiles) {
        const encryptedFile = await window.GhostVaultCrypto.encryptFile(
          file,
          encryptionKey
        );
        encryptedFiles.push(encryptedFile);
      }
    } catch (error) {
      console.error("❌ File encryption failed:", error);
      showInlineError(msgInput, "Failed to encrypt files. Please try again.");
      return;
    }
  }

  // Preparar datos para enviar al backend
  const secretData = {
    content: encryptedContent, // Enviar contenido ENCRIPTADO
    requires_password: requiresPassword,
    expires_in_hours: expiresInHours,
    files: encryptedFiles, // Archivos encriptados
  };

  // NO enviamos la contraseña al backend - solo se usa para encriptar
  // El backend solo necesita saber si requires_password o no

  submitButton.disabled = true;
  showLoadingModal();

  try {
    const response = await createSecret(secretData);

    if (response.uuid) {
      const baseUrl = window.location.origin;
      let secretUrl = baseUrl + "/GhostVault/s/" + response.uuid;

      // Si se generó clave automática, incluirla en el hash de la URL
      if (autoGeneratedKey) {
        secretUrl += "#" + autoGeneratedKey;
      }

      showSuccessModal(secretUrl, {
        uuid: response.uuid,
        expires_in_hours: expiresInHours,
        requires_password: requiresPassword,
      });

      ghForm.reset();
      const charCount = document.getElementById("charCount");
      if (charCount) charCount.textContent = "0 / 1000 characters";
    } else {
      throw new Error("Missing UUID in response");
    }
  } catch (error) {
    console.error("Error:", error);
    let msg = "Failed to create secret. ";

    if (!navigator.onLine) {
      msg += "No internet connection.";
    } else if (error.message.includes("API Error: 401")) {
      msg += "Invalid API key.";
    } else {
      msg += error.message || "Unknown error occurred.";
    }

    showErrorModal(msg);
  } finally {
    hideLoadingModal();
    submitButton.disabled = false;
  }
});

// Modal de éxito - Centrado y más ancho
function showSuccessModal(url, data) {
  const oldModal = document.getElementById("successModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "successModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 9999;
    backdrop-filter: blur(10px);
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 1.5rem;
    padding: 2.5rem;
    max-width: 42rem;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    margin: auto;
  `;

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; background: rgba(34, 197, 94, 0.2); border-radius: 9999px; margin-bottom: 1rem;">
        <svg style="width: 2rem; height: 2rem; color: #4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 style="font-size: 1.75rem; font-weight: bold; color: white; margin-bottom: 0.5rem;">¡Secret Created!</h2>
      <p style="color: #cbd5e1; font-size: 0.9375rem;">Share this URL with the recipient</p>
    </div>
    
    <div style="background: rgba(0,0,0,0.4); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.15);">
      <p id="secretUrlText" style="color: white; font-family: 'Courier New', monospace; font-size: 0.9375rem; word-break: break-all; margin: 0; line-height: 1.6;">${url}</p>
    </div>
    
    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
      <button id="copyUrlBtn" style="flex: 1; padding: 0.875rem; background: #7c3aed; color: white; font-weight: 600; border-radius: 0.625rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s; font-size: 0.9375rem;">
        <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy URL
      </button>
      <button id="closeModalBtn" style="padding: 0 1.75rem; border: 2px solid rgba(255,255,255,0.25); background: transparent; color: white; font-weight: 600; border-radius: 0.625rem; cursor: pointer; transition: all 0.2s; font-size: 0.9375rem;">
        Close
      </button>
    </div>
    
    <div style="padding: 0.875rem; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 0.625rem;">
      <p style="color: #fdba74; font-size: 0.8125rem; margin: 0; line-height: 1.5;">
        <strong>⚠️ Important:</strong> This URL will self-destruct after being viewed or in ${
          data.expires_in_hours || 1
        } hour(s).
      </p>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Hover effects
  const copyBtn = document.getElementById("copyUrlBtn");
  const closeBtn = document.getElementById("closeModalBtn");

  copyBtn.addEventListener("mouseenter", () => {
    copyBtn.style.background = "#6d28d9";
  });
  copyBtn.addEventListener("mouseleave", () => {
    copyBtn.style.background = "#7c3aed";
  });

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(255,255,255,0.1)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "transparent";
  });

  // Copy button
  copyBtn.addEventListener("click", async () => {
    const urlText = document.getElementById("secretUrlText").textContent;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = urlText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => {
        copyBtn.innerHTML =
          '<svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy URL';
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("❌ Could not copy.");
    }
  });

  // Close
  closeBtn.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}
