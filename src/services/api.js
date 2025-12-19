// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// Auth token management
export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token) => localStorage.setItem('authToken', token);
export const removeAuthToken = () => localStorage.removeItem('authToken');

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// Auth API
export const authAPI = {
    register: (data) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    login: (data) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getCurrentUser: () => apiRequest('/auth/me'),
};

// Patients API
export const patientsAPI = {
    getAll: () => apiRequest('/patients'),

    getById: (id) => apiRequest(`/patients/${id}`),

    create: (data) => apiRequest('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => apiRequest(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => apiRequest(`/patients/${id}`, {
        method: 'DELETE',
    }),
};

// Vitals API
export const vitalsAPI = {
    getVitals: (patientId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/vitals/${patientId}?${query}`);
    },

    getLatest: (patientId) => apiRequest(`/vitals/${patientId}/latest`),

    submit: (patientId, data) => apiRequest(`/vitals/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Alerts API
export const alertsAPI = {
    getAlerts: (patientId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/alerts/${patientId}?${query}`);
    },

    create: (patientId, data) => apiRequest(`/alerts/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    acknowledge: (patientId, alertId, note) => apiRequest(
        `/alerts/${patientId}/${alertId}/acknowledge`,
        {
            method: 'PUT',
            body: JSON.stringify({ note }),
        }
    ),

    delete: (patientId, alertId) => apiRequest(`/alerts/${patientId}/${alertId}`, {
        method: 'DELETE',
    }),
};

// WebSocket connection
export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(WS_URL);

                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('WebSocket message parse error:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 3000);
        }
    }

    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.error('WebSocket not connected');
        }
    }

    subscribe(patientId, mode = 'simulator') {
        this.send('subscribe', { patientId, mode });
    }

    sendSensorData(patientId, sensorType, data) {
        this.send('smartphone_sensor', { patientId, sensorType, data });
    }

    sendCheckin(patientId, status, note) {
        this.send('manual_checkin', { patientId, status, note });
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    handleMessage(message) {
        const { type } = message;
        if (this.listeners.has(type)) {
            this.listeners.get(type).forEach(callback => callback(message));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// HTTP Client for general API calls
const httpClient = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

export default httpClient;
