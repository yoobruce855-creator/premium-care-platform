import { createSimulator } from '../services/simulator.js';
import { getDatabase } from '../config/firebase.js';

// Store active simulators and WebSocket connections
const simulators = new Map();
const connections = new Map();

/**
 * Handle new WebSocket connection
 */
export function handleWebSocketConnection(ws, req) {
    const connectionId = Date.now() + Math.random();
    connections.set(connectionId, ws);

    console.log(`📱 New WebSocket connection: ${connectionId}`);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            await handleMessage(ws, connectionId, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log(`📱 WebSocket disconnected: ${connectionId}`);
        connections.delete(connectionId);

        // Stop simulator if this was a patient connection
        const patientId = getPatientIdByConnection(connectionId);
        if (patientId && simulators.has(patientId)) {
            stopSimulator(patientId);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(ws, connectionId, data) {
    const { type, payload } = data;

    switch (type) {
        case 'subscribe':
            await handleSubscribe(ws, connectionId, payload);
            break;

        case 'sensor_data':
            await handleSensorData(ws, payload);
            break;

        case 'manual_checkin':
            await handleManualCheckin(ws, payload);
            break;

        case 'smartphone_sensor':
            await handleSmartphoneSensor(ws, payload);
            break;

        case 'unsubscribe':
            handleUnsubscribe(connectionId, payload);
            break;

        default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
}

/**
 * Subscribe to patient data stream
 */
async function handleSubscribe(ws, connectionId, payload) {
    const { patientId, mode = 'simulator' } = payload;

    if (!patientId) {
        ws.send(JSON.stringify({ error: 'Patient ID required' }));
        return;
    }

    // Store connection info
    connections.set(connectionId, { ws, patientId, mode });

    // Start appropriate data source
    if (mode === 'simulator') {
        startSimulator(patientId, ws);
    }

    ws.send(JSON.stringify({
        type: 'subscribed',
        patientId,
        mode,
        timestamp: Date.now()
    }));
}

/**
 * Start vital signs simulator for a patient
 */
function startSimulator(patientId, ws) {
    if (simulators.has(patientId)) {
        console.log(`Simulator already running for patient ${patientId}`);
        return;
    }

    const simulator = createSimulator(patientId);

    // Send data every 3 seconds
    const interval = setInterval(() => {
        const vitalSigns = simulator.generateVitalSigns();
        const anomaly = simulator.checkForAnomalies(vitalSigns);

        // Send vital signs
        broadcastToPatientSubscribers(patientId, {
            type: 'vital_signs',
            data: vitalSigns
        });

        // Send anomaly alert if detected
        if (anomaly) {
            broadcastToPatientSubscribers(patientId, {
                type: 'alert',
                data: anomaly
            });

            // Save to database
            saveAlert(patientId, anomaly);
        }

        // Save vital signs to database
        saveVitalSigns(patientId, vitalSigns);
    }, 3000);

    simulators.set(patientId, { simulator, interval });
    console.log(`✅ Simulator started for patient ${patientId}`);
}

/**
 * Stop simulator for a patient
 */
function stopSimulator(patientId) {
    const sim = simulators.get(patientId);
    if (sim) {
        clearInterval(sim.interval);
        simulators.delete(patientId);
        console.log(`⏹️  Simulator stopped for patient ${patientId}`);
    }
}

/**
 * Handle smartphone sensor data (accelerometer, gyroscope, etc.)
 */
async function handleSmartphoneSensor(ws, payload) {
    const { patientId, sensorType, data } = payload;

    // Process smartphone sensor data
    const processedData = processSmartphoneSensor(sensorType, data);

    // Check for anomalies (e.g., fall detection from accelerometer)
    const anomaly = detectAnomalyFromSensor(sensorType, processedData);

    if (anomaly) {
        broadcastToPatientSubscribers(patientId, {
            type: 'alert',
            data: anomaly
        });
        await saveAlert(patientId, anomaly);
    }

    // Broadcast sensor data
    broadcastToPatientSubscribers(patientId, {
        type: 'smartphone_sensor',
        sensorType,
        data: processedData
    });
}

/**
 * Process smartphone sensor data
 */
function processSmartphoneSensor(sensorType, data) {
    switch (sensorType) {
        case 'accelerometer':
            // Calculate magnitude of acceleration
            const { x, y, z } = data;
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            return { ...data, magnitude };

        case 'motion':
            // Motion detected from camera
            return { detected: data.detected, intensity: data.intensity };

        case 'sound':
            // Sound level detection
            return { level: data.level, threshold: data.threshold };

        default:
            return data;
    }
}

/**
 * Detect anomalies from smartphone sensors
 */
function detectAnomalyFromSensor(sensorType, data) {
    if (sensorType === 'accelerometer') {
        // Fall detection: sudden high acceleration followed by stillness
        if (data.magnitude > 20) { // Threshold for fall
            return {
                type: 'fall',
                severity: 'critical',
                timestamp: Date.now(),
                source: 'smartphone_accelerometer',
                data
            };
        }
    }

    if (sensorType === 'sound') {
        // Loud sound detection (potential distress)
        if (data.level > data.threshold * 2) {
            return {
                type: 'loud_sound',
                severity: 'warning',
                timestamp: Date.now(),
                source: 'smartphone_microphone',
                data
            };
        }
    }

    return null;
}

/**
 * Handle manual check-in from patient
 */
async function handleManualCheckin(ws, payload) {
    const { patientId, status, note } = payload;

    const checkin = {
        patientId,
        status,
        note,
        timestamp: Date.now(),
        type: 'manual_checkin'
    };

    // Broadcast to guardians
    broadcastToPatientSubscribers(patientId, {
        type: 'checkin',
        data: checkin
    });

    // Save to database
    await saveEvent(patientId, checkin);

    ws.send(JSON.stringify({
        type: 'checkin_received',
        timestamp: Date.now()
    }));
}

/**
 * Handle external sensor data (for future hardware sensors)
 */
async function handleSensorData(ws, payload) {
    const { patientId, sensorType, data } = payload;

    // This will handle mmWave, ESP32, or other hardware sensors
    broadcastToPatientSubscribers(patientId, {
        type: 'sensor_data',
        sensorType,
        data
    });

    await saveVitalSigns(patientId, data);
}

/**
 * Broadcast message to all subscribers of a patient
 */
function broadcastToPatientSubscribers(patientId, message) {
    connections.forEach((conn) => {
        if (conn.patientId === patientId && conn.ws.readyState === 1) {
            conn.ws.send(JSON.stringify(message));
        }
    });
}

/**
 * Save vital signs to database
 */
async function saveVitalSigns(patientId, data) {
    const db = getDatabase();
    if (!db) return; // Skip if Firebase not configured

    try {
        await db.ref(`patients/${patientId}/vitals/${Date.now()}`).set(data);
    } catch (error) {
        console.error('Error saving vital signs:', error);
    }
}

/**
 * Save alert to database
 */
async function saveAlert(patientId, alert) {
    const db = getDatabase();
    if (!db) return;

    try {
        await db.ref(`patients/${patientId}/alerts/${Date.now()}`).set(alert);
    } catch (error) {
        console.error('Error saving alert:', error);
    }
}

/**
 * Save event to database
 */
async function saveEvent(patientId, event) {
    const db = getDatabase();
    if (!db) return;

    try {
        await db.ref(`patients/${patientId}/events/${Date.now()}`).set(event);
    } catch (error) {
        console.error('Error saving event:', error);
    }
}

/**
 * Unsubscribe from patient data
 */
function handleUnsubscribe(connectionId, payload) {
    const conn = connections.get(connectionId);
    if (conn) {
        connections.delete(connectionId);
    }
}

/**
 * Get patient ID by connection ID
 */
function getPatientIdByConnection(connectionId) {
    const conn = connections.get(connectionId);
    return conn?.patientId;
}

export default {
    handleWebSocketConnection,
    startSimulator,
    stopSimulator
};
