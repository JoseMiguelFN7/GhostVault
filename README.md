# 👻 GhostVault Frontend

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

**GhostVault** is a secure ephemeral messaging platform rebuilt with a modern stack (**React, TypeScript, Vite**). It features **client-side AES-256 encryption**, creating self-destructing secrets that burn after being read once. The frontend handles all encryption/decryption locally — the server never sees your unencrypted data.

> **Zero-Knowledge Architecture:** The server acts as a blind storage. All encryption/decryption happens in your browser using the user's key, which never travels to the network.

---

## 👥 Authors

- **José Ferreira** - [GitHub Profile](https://github.com/JoseMiguelFN7)
- **Cesar Vethencourt** - [GitHub Profile](https://github.com/Cvethencourt)
- **Javier Regnault** - [GitHub Profile](https://github.com/jregnaultt)

---

## 🚀 Key Features

- 🔒 **Client-Side AES-256 Encryption:** Powered by `crypto-js` and React hooks.
- 🔥 **Burn-on-Read:** Secrets are deleted from the server immediately after retrieval.
- 🛡️ **Magic Token Validation:** Robust integrity check to distinguish between incorrect passwords and corrupted data.
- 📎 **Encrypted File Attachments:** Support for up to 3 files (10 MB each) with individual encryption for names and content.
- 🎨 **Modern UI:** Glassmorphism design, dark mode, and smooth animations using Tailwind CSS.
- ⚡ **Lightning Fast:** Powered by Vite for instant HMR and optimized builds.
- 🧩 **Type Safety:** Full TypeScript implementation for robust logic.

---

## 📋 Prerequisites

To run this project locally, you need:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A backend API running (see [GhostVault Backend](https://github.com/JoseMiguelFN7/GhostVault-API.git))

---

## 🛠️ Installation Guide

### 1. Clone the Repository

```bash
git clone [https://github.com/JoseMiguelFN7/GhostVault-Front-React.git](https://github.com/JoseMiguelFN7/GhostVault-Front-React.git)
cd GhostVault-Front-React
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a .env file in the project root:

```bash
cp .env.example .env
```

Edit .env and configure your API credentials. Note: Variables must start with VITE_ to be exposed to the client.

```Ini,TOML
# .env
VITE_API_DOMAIN=http://localhost:8000
VITE_API_KEY=your_api_key_here
VITE_APP_ENV=development
VITE_APP_DEBUG=true
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173 (or the port shown in your terminal).

---

## 💻 NPM Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with HMR. |
| `npm run build` | Compiles TypeScript and builds the app for production. |
| `npm run preview` | Locally preview the production build. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

---

## 📁 Project Structure

```text
GhostVault-Front-React/
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Template for environment variables
├── index.html                      # Entry HTML file
├── package.json                    # Project dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
└── src/
    ├── assets/                     # Static assets (Logos, images)
    │   └── GhostVault.svg
    ├── components/                 # Reusable UI components
    │   ├── CreateSecretForm.tsx    # Main form logic for creating secrets
    │   ├── ErrorTooltip.tsx        # Custom floating error feedback
    │   ├── FeedbackOverlays.tsx    # Modals (Success, Error, Loading)
    │   └── ReceptionVisuals.tsx    # Components for the secret view (Badge, Password)
    ├── config/                     # Configuration files
    │   └── api.ts                  # Centralized environment variables
    ├── pages/                      # Main Application Views
    │   ├── Home.tsx                # Landing page (Create Secret)
    │   └── SecretView.tsx          # Reception page (Decrypt Secret)
    ├── services/                   # Business Logic & API
    │   ├── api.ts                  # Axios instance and API methods
    │   └── encryption.ts           # AES-256 implementation & Magic Token logic
    ├── utils/                      # Helper functions
    │   └── fileHelper.ts           # File to Base64 converter
    ├── App.tsx                     # Router configuration
    ├── index.css                   # Global styles & Tailwind imports
    └── main.tsx                    # Application entry point
```

---

## 🔐 How It Works (Technical Flow)

### 1. The "Magic Token" Protocol
To ensure data integrity and distinguish between an incorrect password and an empty message, we append a signature before encryption:
`"Message" + "||GV-VALID||" -> Encrypt -> Payload`

Upon decryption, the client checks for this token. If missing, it confirms the encryption key was incorrect, preventing ambiguity with empty strings or corrupted data.

### 2. Creation Flow
1.  **Input:** User enters text and optionally drops files.
2.  **Key Gen:**
    * **Manual:** User provides a password.
    * **Auto:** A secure random 16-char key is generated locally.
3.  **Encryption:**
    * The message (with the Magic Token) is encrypted using AES-256.
    * Files are converted to Base64 and encrypted individually (both name and content).
4.  **Transport:** The encrypted blob (JSON containing message + files) is sent to the API via HTTPS.
5.  **Link Generation:** The app constructs a URL containing the `UUID` (returned by server) and the `Key` (in the URL hash `#`), ensuring the key is never sent to the server.

### 3. Reception Flow
1.  **Parsing:** The app extracts the `UUID` from the path and the `Key` from the URL hash.
2.  **Fetching:** The encrypted payload is retrieved from the API.
3.  **Decryption:**
    * **Auto-Decrypt:** If the URL hash is present, the app attempts to decrypt immediately.
    * **Manual:** If `requires_password` is true (or hash is missing), a modal prompts the user for the password.
4.  **Verification:** The "Magic Token" is validated. If valid, the content is displayed; otherwise, an error is shown.
5.  **Destruction:** The server automatically deletes the secret immediately after it is fetched.

---

## 🎨 Tech Stack

### Core
- **Framework:** [React 18](https://react.dev/) - Component-based UI library
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Statically typed JavaScript for robust code
- **Build Tool:** [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling for instant HMR

### Styling & Design
- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons:** [Lucide React](https://lucide.dev/) - Lightweight, consistent icon set
- **Visuals:** Custom Glassmorphism effects and CSS animations (Gradient Shifts, Glows)

### Logic & Security
- **Cryptography:** [Crypto-JS](https://github.com/brix/crypto-js) - Industry standard AES-256 implementation
- **HTTP Client:** [Axios](https://axios-http.com/) - Promise-based HTTP client for API communication
- **Routing:** [React Router DOM](https://reactrouter.com/) - Declarative routing for Single Page Applications

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔗 Related Projects

- [GhostVault Backend](https://github.com/JoseMiguelFN7/GhostVault-API.git) - Laravel API