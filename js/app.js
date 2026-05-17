
document.addEventListener('DOMContentLoaded', () => {
    console.log('SmartTherm Initializing...');

   
    const simulator = new window.ESP32Simulator();

    
    const automation = new window.AutomationEngine(simulator);

    
    const ui = new window.UIManager(simulator, automation);

    
    simulator.start();

    
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
