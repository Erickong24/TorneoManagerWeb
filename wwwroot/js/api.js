/**
 * TorneoManager Web - API Client
 * Centraliza todas las llamadas al backend (Fetch API)
 */
const API_BASE_URL = '/api';

const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Si es 204 No Content, no hay JSON que parsear
            if (response.status === 204) return null;

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMessage = data.error || data.title || 'Error en la petición al servidor';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
