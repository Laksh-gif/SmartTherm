/**
 * Automation logic for SmartTherm.
 * Evaluates room data and triggers actions based on occupancy, temperature, and power.
 */
class AutomationEngine {
    constructor(simulator) {
        this.simulator = simulator;
        
        // Automation Settings
        this.settings = {
            unoccupiedTimeoutMs: 15000, // Time before switching to eco (fast for demo)
            powerOverloadThreshold: 4.0, // kW limit before alert/reduction
            autoEnabled: {
                'room1': true,
                'room2': true,
                'room3': true // Server room might always be auto
            }
        };

        this.eventLog = [];
        this.onEventCallback = null;
        this.onAlertCallback = null;

        // Keep track of state to prevent spamming logs
        this.lastState = {};

        // Bind to simulator
        this.simulator.subscribe((data) => this.processData(data));
    }

    setEventCallback(cb) { this.onEventCallback = cb; }
    setAlertCallback(cb) { this.onAlertCallback = cb; }

    toggleAuto(roomId, isEnabled) {
        this.settings.autoEnabled[roomId] = isEnabled;
        this.logEvent(roomId, `Automation ${isEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    processData(roomsData) {
        const now = Date.now();

        Object.keys(roomsData).forEach(roomId => {
            let room = roomsData[roomId];
            
            // Check for power overload (independent of auto setting for safety)
            if (room.power > this.settings.powerOverloadThreshold) {
                if (!this.lastState[`${roomId}_overload`]) {
                    this.triggerAlert(roomId, 'High Power Consumption Detected!', `Power usage in ${room.name} exceeded ${this.settings.powerOverloadThreshold} kW.`, 'danger');
                    this.lastState[`${roomId}_overload`] = true;
                    
                    // Safety override: Force Eco mode
                    if (room.acState.on && room.acState.mode !== 'eco') {
                        this.logEvent(roomId, 'Safety Override: Forcing ECO mode to reduce load.', 'warning');
                        this.simulator.setACState(roomId, { mode: 'eco' });
                    }
                }
            } else {
                this.lastState[`${roomId}_overload`] = false;
            }

            // Only proceed with comfort/occupancy automation if enabled
            if (!this.settings.autoEnabled[roomId]) return;

            // Occupancy Automation
            if (!room.occupied) {
                const timeSinceMovement = now - room.lastMovement;
                if (timeSinceMovement > this.settings.unoccupiedTimeoutMs && room.acState.on && room.acState.mode === 'cool') {
                    // Room empty for a while, AC is running full cool. Switch to Eco.
                    if (!this.lastState[`${roomId}_eco_triggered`]) {
                        this.logEvent(roomId, 'Room unoccupied. Switching AC to ECO mode to save energy.', 'success');
                        this.simulator.setACState(roomId, { mode: 'eco' });
                        this.lastState[`${roomId}_eco_triggered`] = true;
                        this.triggerAlert(roomId, 'Energy Saving Active', `${room.name} unoccupied. AC switched to ECO.`, 'warning');
                    }
                }
            } else {
                // Room is occupied
                this.lastState[`${roomId}_eco_triggered`] = false;
                
                // If it's occupied but AC is off, and it's warm -> Turn ON
                if (!room.acState.on && room.temp > room.acState.targetTemp + 0.5) {
                     if (!this.lastState[`${roomId}_auto_on`]) {
                         this.logEvent(roomId, 'Occupancy detected and temp high. Turning AC ON.', 'info');
                         this.simulator.setACState(roomId, { on: true, mode: 'cool' });
                         this.lastState[`${roomId}_auto_on`] = true;
                     }
                } else {
                     this.lastState[`${roomId}_auto_on`] = false;
                }

                // If it's in eco but occupied and getting warm -> Switch to cool
                if (room.acState.on && room.acState.mode === 'eco' && room.temp > room.acState.targetTemp + 1.0) {
                     // Check if overload is NOT active before overriding
                     if (!this.lastState[`${roomId}_overload`]) {
                         this.logEvent(roomId, 'Room warming up while occupied. Switching ECO -> COOL.', 'info');
                         this.simulator.setACState(roomId, { mode: 'cool' });
                     }
                }
            }
        });
    }

    logEvent(roomId, message, type = 'info') {
        const event = {
            id: Date.now() + Math.random(),
            roomId,
            time: new Date(),
            message,
            type
        };
        this.eventLog.unshift(event);
        if (this.eventLog.length > 50) this.eventLog.pop(); // Keep log size manageable
        
        if (this.onEventCallback) this.onEventCallback(event);
    }

    triggerAlert(roomId, title, message, type) {
        if (this.onAlertCallback) {
            this.onAlertCallback({ roomId, title, message, type });
        }
    }
}

window.AutomationEngine = AutomationEngine;
