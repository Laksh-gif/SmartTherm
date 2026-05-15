/**
 * Main application entry point.
 * Initializes the simulator, automation engine, and UI manager.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('SmartTherm Initializing...');

    // 1. Initialize Hardware Simulator
    const simulator = new window.ESP32Simulator();

    // 2. Initialize Automation Logic
    const automation = new window.AutomationEngine(simulator);

    // 3. Initialize UI
    const ui = new window.UIManager(simulator, automation);

    // 4. Start Simulation
    simulator.start();

    // 5. Handle Loading Screen
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const appContainer = document.getElementById('app-container');
        
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        
        appContainer.style.opacity = '1';
        
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }, 2000);

    console.log('SmartTherm Running.');
});
