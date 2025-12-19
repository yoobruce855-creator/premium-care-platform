// In-memory database for demo mode (when Firebase is not configured)
class MemoryDatabase {
    constructor() {
        this.data = {
            users: new Map(),
            patients: new Map(),
            vitals: new Map(),
            alerts: new Map(),
            events: new Map()
        };

        // Create demo user
        this.data.users.set('demo@example.com', {
            id: 'demo-user-1',
            email: 'demo@example.com',
            password: '$2a$10$8ZqrQxKxDZ0qKZ0qKZ0qKOYxGxGxGxGxGxGxGxGxGxGxGxGxGxG', // demo123
            name: '데모 사용자',
            phone: '010-1234-5678',
            role: 'guardian',
            createdAt: Date.now()
        });

        // Create demo patient
        this.data.patients.set('patient-1', {
            id: 'patient-1',
            name: '어르신',
            age: 75,
            guardians: ['demo-user-1'],
            status: 'normal',
            createdAt: Date.now()
        });
    }

    // User operations
    getUser(email) {
        return this.data.users.get(email);
    }

    getUserById(id) {
        for (const user of this.data.users.values()) {
            if (user.id === id) return user;
        }
        return null;
    }

    createUser(userData) {
        this.data.users.set(userData.email, userData);
        return userData;
    }

    // Patient operations
    getPatient(id) {
        return this.data.patients.get(id);
    }

    getPatientsByGuardian(guardianId) {
        const patients = [];
        for (const patient of this.data.patients.values()) {
            if (patient.guardians.includes(guardianId)) {
                patients.push(patient);
            }
        }
        return patients;
    }

    createPatient(patientData) {
        this.data.patients.set(patientData.id, patientData);
        return patientData;
    }

    updatePatient(id, updates) {
        const patient = this.data.patients.get(id);
        if (patient) {
            Object.assign(patient, updates);
            return patient;
        }
        return null;
    }

    // Vitals operations
    addVitals(patientId, vitalData) {
        const key = `${patientId}-${vitalData.timestamp}`;
        const vital = { ...vitalData, patientId };
        this.data.vitals.set(key, vital);
        return vital;
    }

    getVitals(patientId, limit = 100) {
        const vitals = [];
        for (const [key, vital] of this.data.vitals.entries()) {
            if (vital.patientId === patientId) {
                vitals.push(vital);
            }
        }
        return vitals.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    getLatestVitals(patientId) {
        const vitals = this.getVitals(patientId, 1);
        return vitals[0] || null;
    }

    // Alert operations
    addAlert(alertData) {
        const key = `alert-${Date.now()}-${Math.random()}`;
        this.data.alerts.set(key, alertData);
        return alertData;
    }

    getAlerts(patientId, limit = 50) {
        const alerts = [];
        for (const alert of this.data.alerts.values()) {
            if (alert.patientId === patientId) {
                alerts.push(alert);
            }
        }
        return alerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    // Event operations
    addEvent(eventData) {
        const key = `event-${Date.now()}-${Math.random()}`;
        this.data.events.set(key, eventData);
        return eventData;
    }

    getEvents(patientId, limit = 100) {
        const events = [];
        for (const event of this.data.events.values()) {
            if (event.patientId === patientId) {
                events.push(event);
            }
        }
        return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    // Clear all data (for testing)
    clear() {
        this.data.vitals.clear();
        this.data.alerts.clear();
        this.data.events.clear();
    }
}

// Singleton instance
const memoryDB = new MemoryDatabase();

export default memoryDB;
