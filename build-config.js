/**
 * Build Configuration from .env
 * Generates src/js/config.js from environment variables
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Read environment variables
let apiDomain = process.env.API_DOMAIN || "http://localhost:8000";
const apiKey = process.env.API_KEY || "";
const appEnv = process.env.APP_ENV || "development";
const appDebug = process.env.APP_DEBUG === "true";

// Normalize API_DOMAIN - remove trailing slash to prevent //
apiDomain = apiDomain.replace(/\/+$/, "");

// Generate config.js content
const configContent = `/**
 * GhostVault - API Configuration
 * 
 * ⚠️ AUTO-GENERATED from .env - DO NOT EDIT MANUALLY
 * Run: npm run build:config to regenerate this file
 */

const ENV = {
  API_DOMAIN: "${apiDomain}",
  API_KEY: "${apiKey}",
  APP_ENV: "${appEnv}",
  APP_DEBUG: ${appDebug}
};

async function apiRequest(endpoint, options = {}) {
  const url = \`\${ENV.API_DOMAIN}\${endpoint}\`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": ENV.API_KEY,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    const responseText = await response.text();

   

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "❌ Response is not JSON:",
          responseText.substring(0, 500)
        );
        throw new Error(
          \`API Error \${response.status}: \${responseText.substring(0, 100)}\`
        );
      }
      throw new Error(
        errorData.message ||
          \`API Error: \${response.status} \${response.statusText}\`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Success response is not JSON:", responseText);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

async function createSecret(secretData) {
  const payload = {
    content: secretData.content,
    requires_password: secretData.requires_password || false,
    expires_in_hours: secretData.expires_in_hours || 1,
    files: secretData.files || [],
  };

  if (secretData.requires_password && secretData.password) {
    payload.password = secretData.password;
  }

  return await apiRequest("/api/v1/secrets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function getSecret(uuid) {
  return await apiRequest(\`/api/v1/secrets/\${uuid}\`, {
    method: "GET",
  });
}`;

// Write to src/js/config.js
const outputPath = path.join(__dirname, "src", "js", "config.js");
fs.writeFileSync(outputPath, configContent, "utf-8");
