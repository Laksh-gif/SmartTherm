/**
 * Simulator to mock ESP32 hardware data.
 * Generates random variations for temperature and power based on AC status,
 * and simulates occupancy events.
 */
class ESP32Simulator {
    constructor() {
        this.rooms = {
            'room1': { name: 'Conference Room A', temp: 24.5, power: 0.2, occupied: false, acState: { on: false, mode: 'cool', targetTemp: 24 }, lastMovement: Date.now() },
            'room2': { name: 'Main Office', temp: 23.0, power: 1.5, occupied: true, acState: { on: true, mode: 'cool', targetTemp: 22 }, lastMovement: Date.now() },
            'room3': { name: 'Server Room', temp: 20.5, power: 3.2, occupied: false, acState: { on: true, mode: 'cool', targetTemp: 20 }, lastMovement: Date.now() }
        };
        
        this.listeners = [];
        this.interval = null;
    }

    start() {
        // Emit initial data
        this.emit();
        
        // Update data every 2 seconds
        this.interval = setInterval(() => {
            this.updateSimulatedData();
            this.emit();
        }, 2000);

        // Randomly change occupancy every 15-30 seconds for simulation purposes
        setInterval(() => {
            this.randomizeOccupancy();
        }, 20000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    emit() {
        // Deep copy to prevent reference issues
        this.listeners.forEach(cb => cb(JSON.parse(JSON.stringify(this.rooms))));
    }

    updateSimulatedData() {
        Object.keys(this.rooms).forEach(roomId => {
            let room = this.rooms[roomId];
            
            // Temperature simulation
            let tempDelta = 0;
            if (room.acState.on) {
                if (room.acState.mode === 'cool' && room.temp > room.acState.targetTemp) {
                    tempDelta = -0.1; // Cooling down
                } else if (room.acState.mode === 'eco') {
                    // Eco mode cools slower
                    if (room.temp > room.acState.targetTemp + 1) tempDelta = -0.05;
                    else tempDelta = 0.05; // Drifts up slightly
                } else if (room.acState.mode === 'fan') {
                    tempDelta = 0.02; // Fan doesn't cool, temp drifts up slowly
                }
            } else {
                // AC is off, temp drifts towards ambient (assume 28C)
                if (room.temp < 28) tempDelta = +0.1;
            }
            
            // Add some noise
            tempDelta += (Math.random() - 0.5) * 0.05;
            room.temp = Math.max(16, Math.min(35, room.temp + tempDelta)); // Bound between 16-35

            // Power simulation
            let basePower = 0.1; // Baseline (lights, small devices)
            if (roomId === 'room3') basePower = 2.0; // Server room has high base load

            let acPower = 0;
            if (room.acState.on) {
                if (room.acState.mode === 'cool') {
                    // If room is hot, AC works harder (more power)
                    let diff = Math.max(0, room.temp - room.acState.targetTemp);
                    acPower = 1.0 + (diff * 0.2); 
                } else if (room.acState.mode === 'eco') {
                    acPower = 0.6;
                } else if (room.acState.mode === 'fan') {
                    acPower = 0.2;
                }
            }

            // Random spikes
            let noise = (Math.random() * 0.1);
            let simulatedPower = basePower + acPower + noise;

            // Introduce occasional overload spike for testing alerts (2% chance)
            if (Math.random() < 0.02 && room.acState.on) {
                simulatedPower += 2.5; 
            }

            room.power = simulatedPower;
        });
    }

    randomizeOccupancy() {
        // Randomly toggle occupancy for a room to test automation
        const roomIds = Object.keys(this.rooms);
        const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
        
        // Don't toggle server room occupancy as often
        if (randomRoomId === 'room3' && Math.random() > 0.3) return;

        let room = this.rooms[randomRoomId];
        room.occupied = !room.occupied;
        room.lastMovement = Date.now();
        
        // Trigger immediate emit for occupancy change
        this.emit();
    }

    // Methods for UI/Automation to interact with hardware
    setACState(roomId, newState) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].acState = { ...this.rooms[roomId].acState, ...newState };
            this.emit();
        }
    }
}

// Export for module use if needed, else attached to window
window.ESP32Simulator = ESP32Simulator;
