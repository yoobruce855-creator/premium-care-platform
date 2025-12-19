import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/firebase.js';
import { authenticateToken, requireRole, requirePatientAccess } from '../middleware/auth-middleware.js';

const router = express.Router();

/**
 * GET /api/patients
 * Get all patients for the current user (guardian)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const db = getDatabase();

        if (db) {
            // Get all patients
            const patientsSnapshot = await db.ref('patients').once('value');
            const allPatients = patientsSnapshot.val() || {};

            // Filter patients where user is a guardian
            const userPatients = Object.values(allPatients).filter(patient =>
                patient.guardians && patient.guardians.includes(userId)
            );

            res.json(userPatients);
        } else {
            // Demo mode
            res.json([{
                id: 'patient-1',
                name: '어르신',
                age: 75,
                gender: 'female',
                status: 'normal',
                guardians: [userId],
                createdAt: Date.now()
            }]);
        }
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Failed to get patients' });
    }
});

/**
 * GET /api/patients/:patientId
 * Get specific patient details
 */
router.get('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const db = getDatabase();

        if (db) {
            const patientSnapshot = await db.ref(`patients/${patientId}`).once('value');
            const patient = patientSnapshot.val();

            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            res.json(patient);
        } else {
            // Demo mode
            res.json({
                id: patientId,
                name: '어르신',
                age: 75,
                gender: 'female',
                status: 'normal',
                medicalInfo: {
                    bloodType: 'A+',
                    allergies: [],
                    medications: [],
                    conditions: []
                },
                guardians: [req.user.id],
                location: {
                    address: '서울시 강남구',
                    coordinates: { lat: 37.5, lng: 127.0 }
                },
                emergencyContacts: [],
                createdAt: Date.now()
            });
        }
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ error: 'Failed to get patient' });
    }
});

/**
 * POST /api/patients
 * Create a new patient
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, age, gender, medicalInfo, location, emergencyContacts } = req.body;

        if (!name || !age) {
            return res.status(400).json({ error: 'Name and age are required' });
        }

        const db = getDatabase();
        const patientId = uuidv4();

        const newPatient = {
            id: patientId,
            name,
            age,
            gender: gender || 'other',
            medicalInfo: medicalInfo || {
                bloodType: '',
                allergies: [],
                medications: [],
                conditions: []
            },
            guardians: [userId],
            status: 'normal',
            location: location || {
                address: '',
                coordinates: { lat: 0, lng: 0 }
            },
            emergencyContacts: emergencyContacts || [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (db) {
            await db.ref(`patients/${patientId}`).set(newPatient);

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'patient_created',
                description: `Patient ${name} created`,
                data: { patientId },
                userId,
                timestamp: Date.now()
            });

            res.status(201).json(newPatient);
        } else {
            res.status(503).json({
                error: 'Patient creation not available in demo mode',
                message: 'Please configure Firebase to enable patient management'
            });
        }
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({ error: 'Failed to create patient' });
    }
});

/**
 * PUT /api/patients/:patientId
 * Update patient information
 */
router.put('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { name, age, gender, medicalInfo, location, emergencyContacts } = req.body;
        const db = getDatabase();

        if (db) {
            const updates = {
                updatedAt: Date.now()
            };

            if (name) updates.name = name;
            if (age) updates.age = age;
            if (gender) updates.gender = gender;
            if (medicalInfo) updates.medicalInfo = medicalInfo;
            if (location) updates.location = location;
            if (emergencyContacts) updates.emergencyContacts = emergencyContacts;

            await db.ref(`patients/${patientId}`).update(updates);

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'patient_updated',
                description: 'Patient information updated',
                data: { updates },
                userId: req.user.id,
                timestamp: Date.now()
            });

            const patientSnapshot = await db.ref(`patients/${patientId}`).once('value');
            res.json(patientSnapshot.val());
        } else {
            res.status(503).json({ error: 'Patient update not available in demo mode' });
        }
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

/**
 * DELETE /api/patients/:patientId
 * Delete a patient
 */
router.delete('/:patientId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const db = getDatabase();

        if (db) {
            // Delete patient and all related data
            const updates = {
                [`patients/${patientId}`]: null,
                [`vitals/${patientId}`]: null,
                [`alerts/${patientId}`]: null,
                [`events/${patientId}`]: null
            };

            await db.ref().update(updates);

            res.json({ message: 'Patient deleted successfully' });
        } else {
            res.status(503).json({ error: 'Patient deletion not available in demo mode' });
        }
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

/**
 * POST /api/patients/:patientId/guardians
 * Add a guardian to a patient
 */
router.post('/:patientId/guardians', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId } = req.params;
        const { guardianEmail } = req.body;

        if (!guardianEmail) {
            return res.status(400).json({ error: 'Guardian email required' });
        }

        const db = getDatabase();

        if (db) {
            // Find guardian by email
            const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(guardianEmail).once('value');

            if (!usersSnapshot.exists()) {
                return res.status(404).json({ error: 'User not found' });
            }

            const users = usersSnapshot.val();
            const guardianId = Object.keys(users)[0];

            // Add guardian to patient
            const patientSnapshot = await db.ref(`patients/${patientId}`).once('value');
            const patient = patientSnapshot.val();

            if (!patient.guardians.includes(guardianId)) {
                patient.guardians.push(guardianId);
                await db.ref(`patients/${patientId}/guardians`).set(patient.guardians);

                // Log event
                await db.ref(`events/${patientId}/${uuidv4()}`).set({
                    id: uuidv4(),
                    type: 'guardian_added',
                    description: `Guardian ${guardianEmail} added`,
                    data: { guardianId, guardianEmail },
                    userId: req.user.id,
                    timestamp: Date.now()
                });
            }

            res.json({ message: 'Guardian added successfully', guardians: patient.guardians });
        } else {
            res.status(503).json({ error: 'Guardian management not available in demo mode' });
        }
    } catch (error) {
        console.error('Add guardian error:', error);
        res.status(500).json({ error: 'Failed to add guardian' });
    }
});

/**
 * DELETE /api/patients/:patientId/guardians/:guardianId
 * Remove a guardian from a patient
 */
router.delete('/:patientId/guardians/:guardianId', authenticateToken, requirePatientAccess, async (req, res) => {
    try {
        const { patientId, guardianId } = req.params;
        const db = getDatabase();

        if (db) {
            const patientSnapshot = await db.ref(`patients/${patientId}`).once('value');
            const patient = patientSnapshot.val();

            // Don't allow removing the last guardian
            if (patient.guardians.length <= 1) {
                return res.status(400).json({ error: 'Cannot remove the last guardian' });
            }

            const updatedGuardians = patient.guardians.filter(id => id !== guardianId);
            await db.ref(`patients/${patientId}/guardians`).set(updatedGuardians);

            // Log event
            await db.ref(`events/${patientId}/${uuidv4()}`).set({
                id: uuidv4(),
                type: 'guardian_removed',
                description: 'Guardian removed',
                data: { guardianId },
                userId: req.user.id,
                timestamp: Date.now()
            });

            res.json({ message: 'Guardian removed successfully', guardians: updatedGuardians });
        } else {
            res.status(503).json({ error: 'Guardian management not available in demo mode' });
        }
    } catch (error) {
        console.error('Remove guardian error:', error);
        res.status(500).json({ error: 'Failed to remove guardian' });
    }
});

export default router;
