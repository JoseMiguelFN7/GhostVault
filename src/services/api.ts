import axios from "axios";
import { API_CONFIG } from "../config/api";

// Create an Axios instance with global configuration
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': API_CONFIG.apiKey,
        'ngrok-skip-browser-warning': 'true',
    },
});

// Payload structure for creating a secret with optional encrypted files
export interface EncryptedFilePayload {
    encrypted_name: string;
    file_data: string; // Encrypted Base64 string
}

export interface CreateSecretPayload {
    content: string;            // Encrypted message
    requires_password: boolean; // Flag
    expires_in_hours: number;   // TTL
    files: EncryptedFilePayload[]; // Optional array
}

// Expected JSON response from the API when creating a secret
export interface SecretResponse {
    message: string;
    uuid: string;
    requires_password: boolean;
    expires_at: string;
}

// Data structure for secret data retrieval
export interface SecretData {
  content: string;            // Encrypted message
  requires_password: boolean; // Flag to determine decryption method
  files?: EncryptedFilePayload[]; // Optional array of files
}

export const secretService = {
    /**
     * Sends the structured payload to the backend.
     */
    createSecret: async (payload: CreateSecretPayload): Promise<SecretResponse> => {
        const response = await apiClient.post<SecretResponse>('/api/v1/secrets', payload);
        return response.data;
    },

    getSecret: async (uuid: string): Promise<SecretData> => {
        const response = await apiClient.get<SecretData>(`/api/v1/secrets/${uuid}`);
        return response.data;
    }
};