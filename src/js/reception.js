/**
 * GhostVault - Reception Page
 * Obtiene y muestra el secret desde la API
 */

// Elementos del DOM
const secretContentElement = document.getElementById("secretContent");

/**
 * Extraer UUID de la URL
 * Puede venir de dos formas:
 * 1. Query parameter: ?uuid=xxx (desde .htaccess redirect)
 * 2. Path: /s/xxx (si se accede directo)
 */
function getUUIDFromURL() {
  // Primero intentar query parameter (más común después del redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const uuidFromQuery = urlParams.get("uuid");

  if (uuidFromQuery) {
    console.log("📌 UUID found in query parameter");
    return uuidFromQuery;
  }

  // Si no, intentar extraer del path
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
      <div class="flex items-center justify-center py-8 text-red-400">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="ml-3">${message}</span>
      </div>
    `;
  }
}

/**
 * Mostrar secret
 */
function showSecret(content) {
  if (secretContentElement) {
    secretContentElement.textContent = content;
  }
}

/**
 * Cargar el secret al cargar la página
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

    if (response.content) {
      showSecret(response.content);
    } else {
      showError("Secret content not found");
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
