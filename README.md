# 👻 GhostVault Frontend

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

**GhostVault** is a secure ephemeral messaging platform with **client-side AES-256 encryption**. Create self-destructing secrets that burn after being read once. The frontend handles all encryption/decryption locally — the server never sees your unencrypted data.

> **Zero-Knowledge Architecture:** All encryption happens in your browser. The decryption key never leaves your device and is never sent to the server.

---

## 👥 Authors

- **José Ferreira** - [GitHub Profile](https://github.com/JoseMiguelFN7)
- **Cesar Vethencourt** - [GitHub Profile](https://github.com/Cvethencourt)
- **Javier Regnault** - [GitHub Profile](https://github.com/jregnaultt)

---

## 🚀 Key Features

- 🔒 **Client-Side AES-256 Encryption:** All encryption/decryption happens in your browser using CryptoJS
- 🔥 **Burn-on-Read:** Secrets self-destruct after being viewed once
- 🔑 **Dual Encryption Modes:**
  - **Password-protected:** User provides password for encryption
  - **Auto-key:** Secure random key generated and included in shareable URL
- ⏰ **Configurable Expiration:** Set secrets to expire after 1-168 hours
- 📎 **File Attachments:** Support for up to 3 files (10 MB each) - _Coming Soon_
- 🎨 **Premium UI:** Glassmorphism design with smooth animations
- ✨ **Inline Validation:** Non-disruptive error messages with visual feedback
- 🌐 **Zero Server Knowledge:** Server only stores encrypted blobs

---

## 📋 Prerequisites

To run this project locally, you need:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge)
- Backend API running (see [GhostVault Backend](https://github.com/JoseMiguelFN7/GhostVault-API.git))

---

## 🛠️ Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/JoseMiguelFN7/GhostVault.git
cd GhostVault
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- `crypto-js` - AES-256 encryption library
- `tailwindcss` - Utility-first CSS framework
- `dotenv` - Environment variables management (dev dependency)

### 3. Configure Environment Variables

Create a `.env` file in the project root from the example:

```bash
cp .env.example .env
```

Edit `.env` and configure your API credentials:

```bash
# .env
API_DOMAIN=https://your-api-domain.com
API_KEY=your_api_key_here
APP_ENV=development
APP_DEBUG=true
```

> **⚠️ Important:** The `.env` file contains secrets and is ignored by git. Never commit it to version control.

### 4. Generate Configuration

Generate `config.js` from your environment variables:

```bash
npm run build:config
```

This automatically creates `src/js/config.js` from your `.env` file.

### 5. Compile Tailwind CSS

**Development mode (watch for changes + auto-regenerate config):**

```bash
npm run watch
```

**Production build (minified):**

```bash
npm run build
```

### 6. Run the Application

Open `src/index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using PHP
php -S localhost:8080

# Using Node.js http-server
npx http-server -p 8080
```

**✅ Done! The app is running at: http://localhost:8080/src/index.html**

---

## 💻 NPM Scripts

```bash
# Generate config.js from .env
npm run build:config

# Development mode (watch CSS changes + auto-regenerate config)
npm run watch

# Production build (minified CSS + optimized config)
npm run build
```

> **Note:** `npm run watch` and `npm run build` automatically run `build:config` first to ensure your configuration is up-to-date.

---

## �📁 Project Structure

```
GhostVault/
├── .env                        # Environment variables (gitignored)
├── .env.example                # Environment variables template
├── build-config.js             # Generates config.js from .env
├── src/
│   ├── index.html              # Main page - Create secrets
│   ├── reception.html          # Reception page - View secrets
│   ├── css/
│   │   ├── input.css          # Tailwind source
│   │   └── output.css         # Compiled CSS
│   └── js/
│       ├── crypto.js          # Encryption/decryption functions
│       ├── config.js          # API configuration (auto-generated)
│       ├── form-api.js        # Form handling & API calls
│       ├── reception.js       # Secret decryption & display
│       ├── script.js          # UI interactions & validation
│       └── vendor/
│           └── crypto-js.js   # CryptoJS library (local copy)
├── assets/                     # Icons, images, fonts
├── .htaccess                   # URL rewriting for /s/{uuid}
├── tailwind.config.js          # Tailwind configuration
├── package.json                # Dependencies
└── README.md
```

---

## 🔐 How It Works

### Creating a Secret

1. **User Input:** User enters message and optional password
2. **Encryption:**
   - **With password:** Content encrypted with user's password
   - **Without password:** Secure random key auto-generated
3. **API Call:** Encrypted content sent to backend with `requires_password` flag
4. **URL Generation:**
   - **Password-protected:** `https://yourapp.com/s/{uuid}`
   - **Auto-key:** `https://yourapp.com/s/{uuid}#auto-key`

### Reading a Secret

1. **URL Access:** User opens secret link
2. **API Request:** Fetch encrypted content from backend
3. **Decryption:**
   - **Password-protected:** Show modal, user enters password
   - **Auto-key:** Extract key from URL hash (#)
4. **Validation:** Check if decryption successful (empty = wrong key)
5. **Display:** Show decrypted message
6. **Burn:** Backend automatically deletes secret after first read

---

## 🎨 Technologies Used

### Core

- **HTML5** - Semantic markup
- **CSS3** - Custom styles + animations
- **JavaScript (ES6+)** - Modern vanilla JS

### Libraries

- **CryptoJS 4.2.0** - AES-256 encryption/decryption
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **dotenv 17.2.3** - Environment variables management (dev dependency)

### Design

- **Glassmorphism** - Modern frosted glass effect
- **Inter Font** - Clean, modern typography
- **Custom animations** - Smooth gradients and transitions

---

## 🔒 Security Features

- ✅ **Client-Side Encryption:** All encryption happens in browser, never on server
- ✅ **Zero-Knowledge:** Server cannot decrypt your secrets
- ✅ **URL Fragment Keys:** Auto-generated keys in URL hash (#) are never sent to server
- ✅ **Burn-on-Read:** Secrets deleted immediately after viewing
- ✅ **Auto-Expiration:** Unread secrets auto-delete after TTL
- ✅ **No Logging:** Decryption keys never logged or stored

---

## 📡 API Integration

The frontend integrates with the GhostVault Backend API. See [Backend Documentation](https://github.com/JoseMiguelFN7/GhostVault-API.git) for API details.

### Required Headers

```javascript
{
  'X-API-KEY': 'your_api_key',
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'  // If using ngrok
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

- [GhostVault Backend](https://github.com/JoseMiguelFN7/GhostVault-API.git) - Laravel API

---
