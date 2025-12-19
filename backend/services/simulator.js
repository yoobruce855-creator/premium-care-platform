import { v4 as uuidv4 } from 'uuid';

/**
 * Realistic vital signs simulator
 * Generates human-like patterns with circadian rhythms
 */
class VitalSignsSimulator {
    constructor(patientId) {
        this.patientId = patientId;
        this.baseHeartRate = 70;
        this.baseRespiratoryRate = 16;
        this.activityLevel = 'resting';
        this.lastUpdate = Date.now();
    }

    /**
     * Generate realistic heart rate with circadian rhythm
     */
    generateHeartRate() {
        const hour = new Date().getHours();
        const timeOfDay = this.getTimeOfDayFactor(hour);

        // Base heart rate varies by time of day
        let target = this.baseHeartRate;

        // Lower during sleep (midnight to 6am)
        if (hour >= 0 && hour < 6) {
            target = this.baseHeartRate - 10;
        }
        // Higher during active hours (9am to 9pm)
        else if (hour >= 9 && hour < 21) {
            target = this.baseHeartRate + 5;
        }

        // Add natural variation (±5 bpm)
        const variation = (Math.random() - 0.5) * 10;
        const heartRate = Math.round(target + variation);

        // Ensure realistic range (50-100 for elderly at rest)
        return Math.max(50, Math.min(100, heartRate));
    }

    /**
     * Generate realistic respiratory rate
     */
    generateRespiratoryRate() {
        const hour = new Date().getHours();
        let target = this.baseRespiratoryRate;

        // Slower during sleep
        if (hour >= 0 && hour < 6) {
            target = this.baseRespiratoryRate - 2;
        }

        // Add natural variation (±2 breaths/min)
        const variation = (Math.random() - 0.5) * 4;
        const respiratoryRate = Math.round(target + variation);

        // Ensure realistic range (12-20 for elderly)
        return Math.max(12, Math.min(20, respiratoryRate));
    }

    /**
     * Determine activity status based on time and patterns
     */
    generateActivityStatus() {
        const hour = new Date().getHours();
        const random = Math.random();

        // Sleep time (11pm - 7am)
        if (hour >= 23 || hour < 7) {
            return random > 0.95 ? 'restless' : 'sleeping';
        }
        // Active hours (7am - 10pm)
        else {
            if (random > 0.9) return 'active';
            if (random > 0.7) return 'walking';
            return 'resting';
        }
    }

    /**
     * Generate complete vital signs snapshot
     */
    generateVitalSigns() {
        const now = Date.now();
        const heartRate = this.generateHeartRate();
        const respiratoryRate = this.generateRespiratoryRate();
        const activity = this.generateActivityStatus();

        return {
            patientId: this.patientId,
            timestamp: now,
            heartRate,
            respiratoryRate,
            activity,
            quality: 'good', // Signal quality
            batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
        };
    }

    /**
     * Simulate anomaly detection (rare events)
     */
    checkForAnomalies(vitalSigns) {
        const random = Math.random();

        // Very rare events (0.1% chance)
        if (random > 0.999) {
            return {
                type: 'fall',
                severity: 'critical',
                timestamp: Date.now(),
                location: this.getRandomLocation(),
                vitalSigns
            };
        }

        // Rare events (0.5% chance)
        if (random > 0.995) {
            return {
                type: 'abnormal_heart_rate',
                severity: 'warning',
                timestamp: Date.now(),
                value: vitalSigns.heartRate,
                vitalSigns
            };
        }

        return null;
    }

    getRandomLocation() {
        const locations = ['침실', '거실', '화장실', '주방', '현관'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getTimeOfDayFactor(hour) {
        // Returns a factor based on time of day (0-1)
        if (hour >= 0 && hour < 6) return 0.7; // Sleep
        if (hour >= 6 && hour < 9) return 0.85; // Wake up
        if (hour >= 9 && hour < 12) return 1.0; // Morning active
        if (hour >= 12 && hour < 14) return 0.9; // Lunch rest
        if (hour >= 14 && hour < 18) return 1.0; // Afternoon active
        if (hour >= 18 && hour < 21) return 0.95; // Evening
        return 0.8; // Pre-sleep
    }
}

/**
 * Event logger for tracking patient activities
 */
export function generateEvent(patientId, type, data = {}) {
    return {
        id: uuidv4(),
        patientId,
        type,
        timestamp: Date.now(),
        data,
        acknowledged: false
    };
}

/**
 * Create simulator instance for a patient
 */
export function createSimulator(patientId) {
    return new VitalSignsSimulator(patientId);
}

export default VitalSignsSimulator;
