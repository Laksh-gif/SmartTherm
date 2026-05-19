
// Animated counter utility
function animateCounter(element, target, duration = 1000) {
    if (!element) return;
    const start = parseFloat(element.textContent) || 0;
    const range = target - start;
    const increment = range / (duration / 16);
    let current = start;
    let frame = 0;
    const totalFrames = Math.ceil(duration / 16);
    
    function update() {
        current += increment;
        frame++;
        
        if (frame >= totalFrames) {
            element.textContent = target.toFixed(1);
        } else {
            element.textContent = current.toFixed(1);
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Setup counter animations on stat cards
function setupCounterAnimations() {
    const statCards = document.querySelectorAll('.stat-card');
    let observed = new Set();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !observed.has(entry.target)) {
                observed.add(entry.target);
                const valueElement = entry.target.querySelector('.value');
                if (valueElement) {
                    const currentValue = parseFloat(valueElement.textContent);
                    animateCounter(valueElement, currentValue, 800);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statCards.forEach(card => observer.observe(card));
}

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
        
        // Setup animations after app loads
        setupCounterAnimations();
        
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }, 2000);

    console.log('SmartTherm Running.');
});
