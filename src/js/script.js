// ========== SANITIZACIÓN ULTRA-AGRESIVA PARA INPUT DE DURACIÓN ==========

const durationInput = document.getElementById("duration");

if (durationInput) {
  durationInput.addEventListener("keydown", function (e) {
    const invalidKeys = [".", ",", "-", "+", "e", "E"];

    if (invalidKeys.includes(e.key)) {
      e.preventDefault();
      return false;
    }

    if (e.key === "0" && (this.value === "" || this.selectionStart === 0)) {
      e.preventDefault();
      return false;
    }
  });

  durationInput.addEventListener("input", function () {
    const cursorPos = this.selectionStart;

    this.value = this.value.replace(/[^0-9]/g, "");

    if (this.value.startsWith("0")) {
      this.value = this.value.replace(/^0+/, "");
    }

    if (this.value === "") {
      return;
    }

    let numValue = parseInt(this.value, 10);

    if (numValue > 168) {
      this.value = "168";
    }

    this.setSelectionRange(cursorPos, cursorPos);
  });

  durationInput.addEventListener("blur", function () {
    if (
      this.value === "" ||
      parseInt(this.value) < 1 ||
      isNaN(parseInt(this.value))
    ) {
      this.value = "1";
    }
  });

  durationInput.addEventListener("paste", function (e) {
    e.preventDefault();

    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    const cleaned = pastedText.replace(/[^0-9]/g, "");

    if (cleaned === "") {
      return;
    }

    let value = cleaned.replace(/^0+/, "");

    if (value === "") {
      this.value = "1";
      return;
    }

    let numValue = parseInt(value, 10);
    if (numValue > 168) {
      this.value = "168";
    } else if (numValue < 1) {
      this.value = "1";
    } else {
      this.value = value;
    }
  });
}

// ========== GESTIÓN DINÁMICA DE ARCHIVOS (UX Mejorada) ==========

// Contador de caracteres
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");

messageInput?.addEventListener("input", function () {
  const length = this.value.length;
  const maxLength = 1000;
  charCount.textContent = `${length} / ${maxLength} characters`;

  if (length > maxLength) {
    this.value = this.value.substring(0, maxLength);
  }
});

// Toggle visibilidad de contraseña
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

togglePasswordBtn?.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  if (type === "text") {
    eyeIcon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        `;
  } else {
    eyeIcon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
  }
});

// ========== GESTIÓN COMPLETA DE ARCHIVOS CON ESTADO DINÁMICO ==========

const dropZone = document.getElementById("dropZone");
const dropzoneContainer = document.getElementById("dropzoneContainer");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const fileCountText = document.getElementById("fileCountText");

// ESTADO: Array para trackear archivos seleccionados
let selectedFiles = [];
const MAX_FILES = 3;

// Actualiza la UI basada en el estado actual
function updateFileUI() {
  const fileCount = selectedFiles.length;

  // Actualizar contador
  fileCountText.textContent = `${fileCount} / ${MAX_FILES} files selected | 10 MB max each`;

  // Ocultar/Mostrar dropzone basado en el límite
  if (fileCount >= MAX_FILES) {
    dropzoneContainer.classList.add("hidden");
  } else {
    dropzoneContainer.classList.remove("hidden");
  }

  // Renderizar lista de archivos
  renderFileList();
}

// Renderiza la lista de archivos con botones de eliminación
function renderFileList() {
  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const fileSize = (file.size / 1024).toFixed(2);
    const fileSizeUnit =
      fileSize > 1024 ? `${(fileSize / 1024).toFixed(2)} MB` : `${fileSize} KB`;

    const fileItem = document.createElement("div");
    fileItem.className =
      "flex items-center justify-between bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10 hover:bg-white/8 transition-all duration-200";

    fileItem.innerHTML = `
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <svg class="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate text-sm">${file.name}</p>
              <p class="text-slate-500 text-xs">${fileSizeUnit}</p>
            </div>
          </div>
          <button type="button" data-file-index="${index}" class="remove-file-btn text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-all duration-200 ml-2 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        `;

    fileList.appendChild(fileItem);
  });

  // Añadir event listeners a los botones de eliminar
  document.querySelectorAll(".remove-file-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-file-index"));
      removeFileByIndex(index);
    });
  });
}

// Elimina un archivo del estado por índice
function removeFileByIndex(index) {
  selectedFiles.splice(index, 1);
  updateFileUI();
}

// Validación y sanitización de archivos (con estado actualizado)
function validateAndSanitizeFiles(files) {
  // CAPTURAR la cantidad de archivos ANTES de cualquier validación
  const filesCount = files.length;

  // Calcular cuántos archivos faltan para llegar al límite
  const availableSlots = MAX_FILES - selectedFiles.length;

  if (filesCount > availableSlots) {
    return {
      valid: false,
      error: `❌ File Limit Exceeded!\n\nYou selected ${filesCount} file(s). Limit is ${MAX_FILES}.\nCurrent: ${selectedFiles.length}/${MAX_FILES}\n\nPlease remove files before adding new ones, or select fewer files.`,
      files: [],
    };
  }

  const forbiddenExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".php",
    ".pl",
    ".cgi",
    ".jar",
    ".vbs",
    ".msi",
    ".bin",
    ".py",
    ".js",
    ".app",
    ".com",
    ".scr",
    ".pif",
    ".apk",
    ".deb",
    ".rpm",
  ];

  const suspiciousMimes = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
    "application/x-sh",
    "application/x-perl",
    "application/x-python",
  ];

  for (let file of files) {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf("."));

    if (forbiddenExtensions.includes(extension)) {
      return {
        valid: false,
        error: `🚫 Security Threat Detected!\n\nFile: "${file.name}"\nType: Executable/Script (${extension})\n\nFor security reasons, executable files and scripts are not allowed.\n\nAllowed: Documents, images, archives, etc.`,
        files: [],
      };
    }

    if (!file.type || file.type === "" || suspiciousMimes.includes(file.type)) {
      return {
        valid: false,
        error: `🚫 Security Threat Detected!\n\nFile: "${file.name}"\nReason: Suspicious or missing file type\n\nThis file appears to be an executable or has no valid MIME type.\nFor security, it cannot be uploaded.`,
        files: [],
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: `📦 File Too Large!\n\nFile: "${file.name}"\nSize: ${(
          file.size /
          1024 /
          1024
        ).toFixed(
          2
        )} MB\n\nMaximum allowed: 10 MB\n\nPlease select a smaller file.`,
        files: [],
      };
    }
  }

  return {
    valid: true,
    error: null,
    files: Array.from(files),
  };
}

// Maneja la adición de archivos al estado
function handleFiles(files) {
  const result = validateAndSanitizeFiles(files);

  if (!result.valid) {
    alert(result.error);
    return false;
  }

  // Añadir archivos al estado
  selectedFiles.push(...result.files);
  updateFileUI();
  return true;
}

// Event listeners para drag & drop
dropZone?.addEventListener("click", () => fileInput.click());

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropZone?.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone?.addEventListener(eventName, () => {
    dropZone.classList.add("border-violet-500", "bg-violet-500/10");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone?.addEventListener(eventName, () => {
    dropZone.classList.remove("border-violet-500", "bg-violet-500/10");
  });
});

dropZone?.addEventListener("drop", function (e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

fileInput?.addEventListener("change", function (e) {
  const success = handleFiles(this.files);
  // Limpiar el input para permitir re-selección del mismo archivo
  this.value = "";
});

// Manejo del envío del formulario
const ghostForm = document.getElementById("ghostForm");

ghostForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  // ========== GLOBAL EMPTY STATE VALIDATION ==========
  // Check if BOTH message AND files are empty (OR condition)
  const messageText = messageInput.value.trim();
  const hasFiles = selectedFiles.length > 0;

  if (messageText === "" && !hasFiles) {
    // BLOCK SUBMISSION - User must provide either text or files
    alert(
      "⚠️ Empty Submission Blocked\n\nYou must provide either text or a file to create a secret."
    );
    return; // Stop execution immediately
  }
  // ====================================================

  const formData = {
    message: messageInput.value,
    password: passwordInput.value,
    duration: durationInput.value,
    files: selectedFiles.map((f) => ({ name: f.name, size: f.size })),
  };

  console.log("Datos del formulario:", formData);
  alert(
    `GhostVault created!\nExpires in ${formData.duration} hours\nFiles attached: ${selectedFiles.length}\n(This is a demo)`
  );
});
