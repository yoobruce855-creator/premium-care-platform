/**
 * Smartphone Sensor Manager - Full Activation
 * Handles all available device sensors for comprehensive elderly monitoring
 */

class SmartphoneSensorManager {
    constructor() {
        this.isActive = false;
        this.sensors = {
            accelerometer: null,
            gyroscope: null,
            motion: null,
            sound: null,
            light: null,
            proximity: null,
            magnetometer: null,
            gps: null,
            battery: null,
            network: null
        };
        this.callbacks = new Map();
        this.calibration = {
            accelerometer: { x: 0, y: 0, z: 0 },
            gyroscope: { alpha: 0, beta: 0, gamma: 0 },
            magnetometer: { x: 0, y: 0, z: 0 }
        };
    }

    /**
     * Request all sensor permissions
     */
    async requestPermissions() {
        const permissions = [];

        // Motion sensors (accelerometer, gyroscope)
        if (typeof DeviceMotionEvent !== 'undefined') {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const response = await DeviceMotionEvent.requestPermission();
                    permissions.push({ sensor: 'motion', granted: response === 'granted' });
                } catch (error) {
                    console.error('Motion permission error:', error);
                    permissions.push({ sensor: 'motion', granted: false });
                }
            } else {
                permissions.push({ sensor: 'motion', granted: true });
            }
        }

        // Orientation sensors (gyroscope)
        if (typeof DeviceOrientationEvent !== 'undefined') {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const response = await DeviceOrientationEvent.requestPermission();
                    permissions.push({ sensor: 'orientation', granted: response === 'granted' });
                } catch (error) {
                    console.error('Orientation permission error:', error);
                    permissions.push({ sensor: 'orientation', granted: false });
                }
            } else {
                permissions.push({ sensor: 'orientation', granted: true });
            }
        }

        // Microphone for sound detection
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            permissions.push({ sensor: 'microphone', granted: true });
        } catch (error) {
            console.log('Microphone permission denied');
            permissions.push({ sensor: 'microphone', granted: false });
        }

        // Geolocation
        try {
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            permissions.push({ sensor: 'geolocation', granted: true });
        } catch (error) {
            console.log('Geolocation permission denied');
            permissions.push({ sensor: 'geolocation', granted: false });
        }

        return permissions;
    }

    /**
     * Start accelerometer monitoring
     */
    startAccelerometer(callback) {
        if (typeof DeviceMotionEvent === 'undefined') {
            console.error('DeviceMotionEvent not supported');
            return false;
        }

        const handleMotion = (event) => {
            const { x, y, z } = event.accelerationIncludingGravity || {};
            if (x !== null && y !== null && z !== null) {
                const calibrated = {
                    x: x - this.calibration.accelerometer.x,
                    y: y - this.calibration.accelerometer.y,
                    z: z - this.calibration.accelerometer.z,
                    timestamp: Date.now()
                };

                // Calculate magnitude for fall detection
                const magnitude = Math.sqrt(
                    calibrated.x ** 2 + calibrated.y ** 2 + calibrated.z ** 2
                );

                callback('accelerometer', { ...calibrated, magnitude });
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        this.sensors.accelerometer = handleMotion;
        return true;
    }

    /**
     * Start gyroscope monitoring
     */
    startGyroscope(callback) {
        if (typeof DeviceOrientationEvent === 'undefined') {
            console.error('DeviceOrientationEvent not supported');
            return false;
        }

        const handleOrientation = (event) => {
            const { alpha, beta, gamma } = event;
            if (alpha !== null && beta !== null && gamma !== null) {
                const calibrated = {
                    alpha: alpha - this.calibration.gyroscope.alpha,
                    beta: beta - this.calibration.gyroscope.beta,
                    gamma: gamma - this.calibration.gyroscope.gamma,
                    timestamp: Date.now()
                };

                callback('gyroscope', calibrated);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        this.sensors.gyroscope = handleOrientation;
        return true;
    }

    /**
     * Start ambient light sensor
     */
    startAmbientLight(callback) {
        if ('AmbientLightSensor' in window) {
            try {
                const sensor = new AmbientLightSensor();
                sensor.addEventListener('reading', () => {
                    callback('light', {
                        illuminance: sensor.illuminance,
                        timestamp: Date.now()
                    });
                });
                sensor.start();
                this.sensors.light = sensor;
                return true;
            } catch (error) {
                console.error('Ambient light sensor error:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Start proximity sensor
     */
    startProximity(callback) {
        if ('ProximitySensor' in window) {
            try {
                const sensor = new ProximitySensor();
                sensor.addEventListener('reading', () => {
                    callback('proximity', {
                        distance: sensor.distance,
                        max: sensor.max,
                        near: sensor.near,
                        timestamp: Date.now()
                    });
                });
                sensor.start();
                this.sensors.proximity = sensor;
                return true;
            } catch (error) {
                console.error('Proximity sensor error:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Start magnetometer
     */
    startMagnetometer(callback) {
        if ('Magnetometer' in window) {
            try {
                const sensor = new Magnetometer({ frequency: 60 });
                sensor.addEventListener('reading', () => {
                    const calibrated = {
                        x: sensor.x - this.calibration.magnetometer.x,
                        y: sensor.y - this.calibration.magnetometer.y,
                        z: sensor.z - this.calibration.magnetometer.z,
                        timestamp: Date.now()
                    };

                    // Calculate heading
                    const heading = Math.atan2(calibrated.y, calibrated.x) * (180 / Math.PI);

                    callback('magnetometer', { ...calibrated, heading });
                });
                sensor.start();
                this.sensors.magnetometer = sensor;
                return true;
            } catch (error) {
                console.error('Magnetometer error:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Start GPS/Geolocation tracking
     */
    startGPS(callback) {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return false;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                callback('gps', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                console.error('GPS error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        this.sensors.gps = watchId;
        return true;
    }

    /**
     * Start battery monitoring
     */
    async startBattery(callback) {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();

                const updateBattery = () => {
                    callback('battery', {
                        level: battery.level * 100,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime,
                        timestamp: Date.now()
                    });
                };

                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);

                updateBattery(); // Initial call
                this.sensors.battery = battery;
                return true;
            } catch (error) {
                console.error('Battery API error:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Start network monitoring
     */
    startNetwork(callback) {
        if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            const updateNetwork = () => {
                callback('network', {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                    online: navigator.onLine,
                    timestamp: Date.now()
                });
            };

            connection.addEventListener('change', updateNetwork);
            window.addEventListener('online', updateNetwork);
            window.addEventListener('offline', updateNetwork);

            updateNetwork(); // Initial call
            this.sensors.network = connection;
            return true;
        }
        return false;
    }

    /**
     * Start motion detection using camera
     */
    async startMotionDetection(callback) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let previousFrame = null;

            const detectMotion = () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);

                    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    if (previousFrame) {
                        const diff = this.calculateFrameDifference(previousFrame, currentFrame);
                        if (diff > 0.05) { // 5% change threshold
                            callback('motion', { detected: true, intensity: diff, timestamp: Date.now() });
                        }
                    }

                    previousFrame = currentFrame;
                }

                if (this.isActive) {
                    requestAnimationFrame(detectMotion);
                }
            };

            detectMotion();
            this.sensors.motion = { video, stream };
            return true;
        } catch (error) {
            console.error('Motion detection error:', error);
            return false;
        }
    }

    /**
     * Calculate difference between two frames
     */
    calculateFrameDifference(frame1, frame2) {
        let diff = 0;
        const data1 = frame1.data;
        const data2 = frame2.data;

        for (let i = 0; i < data1.length; i += 4) {
            diff += Math.abs(data1[i] - data2[i]); // R
            diff += Math.abs(data1[i + 1] - data2[i + 1]); // G
            diff += Math.abs(data1[i + 2] - data2[i + 2]); // B
        }

        return diff / (data1.length * 255);
    }

    /**
     * Start sound level monitoring
     */
    async startSoundMonitoring(callback) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            microphone.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkSoundLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const normalized = average / 255;

                callback('sound', {
                    level: normalized,
                    threshold: 0.3,
                    loud: normalized > 0.3,
                    timestamp: Date.now()
                });

                if (this.isActive) {
                    setTimeout(checkSoundLevel, 1000);
                }
            };

            checkSoundLevel();
            this.sensors.sound = { stream, audioContext };
            return true;
        } catch (error) {
            console.error('Sound monitoring error:', error);
            return false;
        }
    }

    /**
     * Calibrate sensor
     */
    async calibrateSensor(sensorType) {
        return new Promise((resolve) => {
            const samples = [];
            const sampleCount = 10;
            let count = 0;

            const collectSample = (type, data) => {
                if (type === sensorType) {
                    samples.push(data);
                    count++;

                    if (count >= sampleCount) {
                        // Calculate average
                        const avg = {};
                        Object.keys(samples[0]).forEach(key => {
                            if (typeof samples[0][key] === 'number') {
                                avg[key] = samples.reduce((sum, s) => sum + s[key], 0) / sampleCount;
                            }
                        });

                        this.calibration[sensorType] = avg;
                        resolve(avg);
                    }
                }
            };

            // Temporarily collect samples
            const originalCallback = this.callbacks.get(sensorType);
            this.callbacks.set(sensorType, collectSample);

            setTimeout(() => {
                this.callbacks.set(sensorType, originalCallback);
            }, 2000);
        });
    }

    /**
     * Start all available sensors
     */
    async startMonitoring(callback, options = {}) {
        this.isActive = true;
        const results = {};

        // Start accelerometer
        results.accelerometer = this.startAccelerometer(callback);

        // Start gyroscope
        results.gyroscope = this.startGyroscope(callback);

        // Start ambient light (if available)
        results.light = this.startAmbientLight(callback);

        // Start proximity (if available)
        results.proximity = this.startProximity(callback);

        // Start magnetometer (if available)
        results.magnetometer = this.startMagnetometer(callback);

        // Start GPS
        results.gps = this.startGPS(callback);

        // Start battery monitoring
        results.battery = await this.startBattery(callback);

        // Start network monitoring
        results.network = this.startNetwork(callback);

        // Optional: Start motion detection (camera)
        if (options.enableCamera) {
            results.motion = await this.startMotionDetection(callback);
        }

        // Optional: Start sound monitoring
        if (options.enableSound) {
            results.sound = await this.startSoundMonitoring(callback);
        }

        return results;
    }

    /**
     * Stop all sensors
     */
    stopMonitoring() {
        this.isActive = false;

        // Stop accelerometer
        if (this.sensors.accelerometer) {
            window.removeEventListener('devicemotion', this.sensors.accelerometer);
            this.sensors.accelerometer = null;
        }

        // Stop gyroscope
        if (this.sensors.gyroscope) {
            window.removeEventListener('deviceorientation', this.sensors.gyroscope);
            this.sensors.gyroscope = null;
        }

        // Stop ambient light
        if (this.sensors.light) {
            this.sensors.light.stop();
            this.sensors.light = null;
        }

        // Stop proximity
        if (this.sensors.proximity) {
            this.sensors.proximity.stop();
            this.sensors.proximity = null;
        }

        // Stop magnetometer
        if (this.sensors.magnetometer) {
            this.sensors.magnetometer.stop();
            this.sensors.magnetometer = null;
        }

        // Stop GPS
        if (this.sensors.gps) {
            navigator.geolocation.clearWatch(this.sensors.gps);
            this.sensors.gps = null;
        }

        // Stop motion detection
        if (this.sensors.motion) {
            this.sensors.motion.stream.getTracks().forEach(track => track.stop());
            this.sensors.motion = null;
        }

        // Stop sound monitoring
        if (this.sensors.sound) {
            this.sensors.sound.stream.getTracks().forEach(track => track.stop());
            this.sensors.sound.audioContext.close();
            this.sensors.sound = null;
        }

        // Battery and network don't need explicit stopping
        this.sensors.battery = null;
        this.sensors.network = null;
    }

    /**
     * Check if device supports required sensors
     */
    static isSupported() {
        return {
            accelerometer: typeof DeviceMotionEvent !== 'undefined',
            gyroscope: typeof DeviceOrientationEvent !== 'undefined',
            camera: typeof navigator.mediaDevices !== 'undefined',
            microphone: typeof navigator.mediaDevices !== 'undefined',
            light: 'AmbientLightSensor' in window,
            proximity: 'ProximitySensor' in window,
            magnetometer: 'Magnetometer' in window,
            gps: 'geolocation' in navigator,
            battery: 'getBattery' in navigator,
            network: 'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator
        };
    }

    /**
     * Get sensor status
     */
    getSensorStatus() {
        return {
            accelerometer: this.sensors.accelerometer !== null,
            gyroscope: this.sensors.gyroscope !== null,
            light: this.sensors.light !== null,
            proximity: this.sensors.proximity !== null,
            magnetometer: this.sensors.magnetometer !== null,
            gps: this.sensors.gps !== null,
            battery: this.sensors.battery !== null,
            network: this.sensors.network !== null,
            motion: this.sensors.motion !== null,
            sound: this.sensors.sound !== null
        };
    }
}

export default SmartphoneSensorManager;
