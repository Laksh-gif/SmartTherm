
class UIManager {
    constructor(simulator, automation) {
        this.simulator = simulator;
        this.automation = automation;
        this.currentRoomId = 'room1';
        this.roomsData = null;
        
       
        this.history = {
            labels: [],
            tempData: [],
            powerData: []
        };
        this.maxHistoryPoints = 30;

        this.initDOM();
        this.initChart();
        this.initAnalyticsCharts();
        this.bindEvents();
    }

    initDOM() {
       
        this.els = {
            roomSelector: document.getElementById('room-selector'),
            roomTitle: document.getElementById('current-room-title'),
            clock: document.getElementById('clock'),
            alertBadge: document.getElementById('alert-badge'),
            
            
            valTemp: document.getElementById('val-temp'),
            valPower: document.getElementById('val-power'),
            valOcc: document.getElementById('val-occ'),
            valAc: document.getElementById('val-ac'),
            acIcon: document.getElementById('ac-icon'),
            
            trendTemp: document.getElementById('trend-temp'),
            trendPower: document.getElementById('trend-power'),
            trendOcc: document.getElementById('trend-occ'),
            trendAc: document.getElementById('trend-ac'),
            
            
            autoToggle: document.getElementById('auto-toggle'),
            btnPower: document.getElementById('btn-power'),
            btnTempDown: document.getElementById('btn-temp-down'),
            btnTempUp: document.getElementById('btn-temp-up'),
            valTargetTemp: document.getElementById('val-target-temp'),
            btnModes: document.querySelectorAll('.btn-mode'),
            
            
            eventLog: document.getElementById('event-log'),
            toastContainer: document.getElementById('toast-container'),
            
            
            navItems: document.querySelectorAll('.nav-item[data-target]'),
            views: document.querySelectorAll('.view'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            navLinks: document.getElementById('nav-links'),
            
            
            btnSaveSettings: document.getElementById('btn-save-settings'),
            settingTimeout: document.getElementById('setting-timeout'),
            settingOverload: document.getElementById('setting-overload')
        };
        
        
        setInterval(() => {
            const now = new Date();
            this.els.clock.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }, 1000);
    }

    initChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
       
        Chart.defaults.color = '#a1a1aa';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(9, 9, 11, 0.9)';
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold' };

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.labels,
                datasets: [
                    {
                        label: 'Power (kW)',
                        data: this.history.powerData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 3,
                        tension: 0.5,
                        yAxisID: 'y',
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Temperature (°C)',
                        data: this.history.tempData,
                        borderColor: '#06b6d4',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.5,
                        yAxisID: 'y1',
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false } 
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: {
                        type: 'linear', display: true, position: 'left', min: 0, max: 6,
                        grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] },
                        border: { display: false }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right', min: 15, max: 35,
                        grid: { display: false }, border: { display: false }
                    }
                }
            }
        });
    }

    initAnalyticsCharts() {
        const ctxTemp = document.getElementById('analyticsTempChart')?.getContext('2d');
        const ctxOcc = document.getElementById('analyticsOccChart')?.getContext('2d');
        const ctxEnergy = document.getElementById('energyTrendChart')?.getContext('2d');

        if (ctxTemp) {
            new Chart(ctxTemp, {
                type: 'bar',
                data: {
                    labels: ['Conf Room A', 'Main Office', 'Server Room'],
                    datasets: [{
                        label: 'Avg Temp (°C)',
                        data: [23.5, 24.1, 20.8],
                        backgroundColor: ['rgba(6, 182, 212, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, border: { display: false } },
                        y: { grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] }, border: { display: false } }
                    }
                }
            });
        }

        if (ctxOcc) {
            new Chart(ctxOcc, {
                type: 'doughnut',
                data: {
                    labels: ['Occupied', 'Empty', 'Standby'],
                    datasets: [{
                        data: [45, 30, 25],
                        backgroundColor: ['#10b981', '#f59e0b', '#3f3f46'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                    plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } }
                }
            });
        }

        if (ctxEnergy) {
            new Chart(ctxEnergy, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Energy Usage (kWh)',
                        data: [1200, 1150, 1080, 950, 890, 780],
                        backgroundColor: 'rgba(6, 182, 212, 0.8)',
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, border: { display: false } },
                        y: { grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] }, border: { display: false } }
                    }
                }
            });
        }
    }

    bindEvents() {
       
        this.els.roomSelector.addEventListener('change', (e) => {
            this.currentRoomId = e.target.value;
            
            this.history.labels = [];
            this.history.tempData = [];
            this.history.powerData = [];
            this.updateUI(); 
        });

        
        this.els.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                
                this.els.navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
               
                const targetId = e.currentTarget.dataset.target;
                this.els.views.forEach(view => {
                    if (view.id === targetId) {
                        view.classList.add('active');
                    } else {
                        view.classList.remove('active');
                    }
                });

                
                if (this.els.navLinks && this.els.navLinks.classList.contains('active')) {
                    this.els.navLinks.classList.remove('active');
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        });

        
        if (this.els.mobileMenuBtn && this.els.navLinks) {
            this.els.mobileMenuBtn.addEventListener('click', () => {
                this.els.navLinks.classList.toggle('active');
                if (this.els.navLinks.classList.contains('active')) {
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                } else {
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        }

       
        this.els.autoToggle.addEventListener('change', (e) => {
            this.automation.toggleAuto(this.currentRoomId, e.target.checked);
        });

        this.els.btnPower.addEventListener('click', () => {
            if(!this.roomsData) return;
            const currentOn = this.roomsData[this.currentRoomId].acState.on;
        
            this.simulator.setACState(this.currentRoomId, { on: !currentOn });
        });

        this.els.btnTempDown.addEventListener('click', () => {
            if(!this.roomsData) return;
            let t = this.roomsData[this.currentRoomId].acState.targetTemp;
            if(t > 16) this.simulator.setACState(this.currentRoomId, { targetTemp: t - 1 });
        });

        this.els.btnTempUp.addEventListener('click', () => {
            if(!this.roomsData) return;
            let t = this.roomsData[this.currentRoomId].acState.targetTemp;
            if(t < 30) this.simulator.setACState(this.currentRoomId, { targetTemp: t + 1 });
        });

        this.els.btnModes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.simulator.setACState(this.currentRoomId, { mode: mode, on: true }); 
            });
        });

        
        this.simulator.subscribe((data) => {
            this.roomsData = data;
            this.updateUI();
        });

      
        this.automation.setEventCallback((event) => this.addLogEntry(event));
        this.automation.setAlertCallback((alert) => this.showToast(alert.title, alert.message, alert.type));

    
        if (this.els.btnSaveSettings) {
            this.els.btnSaveSettings.addEventListener('click', () => {
                const timeout = parseInt(this.els.settingTimeout.value, 10);
                const overload = parseFloat(this.els.settingOverload.value);
                
                if (timeout && timeout > 0) this.automation.settings.unoccupiedTimeoutMs = timeout * 1000;
                if (overload && overload > 0) this.automation.settings.powerOverloadThreshold = overload;
                
                this.showToast('Settings Saved', 'Automation thresholds updated successfully.', 'success');
            });
        }
    }

    updateUI() {
        if (!this.roomsData || !this.roomsData[this.currentRoomId]) return;
        
        const room = this.roomsData[this.currentRoomId];
        const ac = room.acState;

        
        this.els.roomTitle.textContent = room.name;

  
        this.els.valTemp.textContent = room.temp.toFixed(1);
        this.els.valPower.textContent = room.power.toFixed(2);
        
        if (room.power > 3.0) {
            this.els.trendPower.className = 'trend danger';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> High Load';
        } else if (room.power > 1.5) {
            this.els.trendPower.className = 'trend warning';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-bolt"></i> Moderate';
        } else {
            this.els.trendPower.className = 'trend';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-check"></i> Normal';
        }

        if (room.occupied) {
            this.els.valOcc.textContent = 'Occupied';
            this.els.trendOcc.className = 'trend neutral';
            this.els.trendOcc.textContent = 'Movement detected';
        } else {
            this.els.valOcc.textContent = 'Empty';
            this.els.trendOcc.className = 'trend warning';
            const secEmpty = Math.floor((Date.now() - room.lastMovement)/1000);
            this.els.trendOcc.textContent = `Empty for ${secEmpty}s`;
        }

        if (ac.on) {
            this.els.valAc.textContent = `ON (${ac.mode.toUpperCase()})`;
            this.els.acIcon.style.animationPlayState = 'running';
            this.els.acIcon.style.color = ac.mode === 'eco' ? 'var(--accent-green)' : 'var(--accent-cyan)';
            this.els.trendAc.textContent = ac.mode === 'eco' ? 'Energy Saving Active' : `Target: ${ac.targetTemp}°C`;
        } else {
            this.els.valAc.textContent = 'OFF';
            this.els.acIcon.style.animationPlayState = 'paused';
            this.els.acIcon.style.color = 'var(--text-muted)';
            this.els.trendAc.textContent = 'Standby';
        }

     
        this.els.autoToggle.checked = this.automation.settings.autoEnabled[this.currentRoomId];
        this.els.valTargetTemp.textContent = ac.targetTemp;
        
        if (ac.on) {
            this.els.btnPower.classList.add('active');
            this.els.btnPower.innerHTML = '<i class="fa-solid fa-power-off"></i>';
        } else {
            this.els.btnPower.classList.remove('active');
            this.els.btnPower.innerHTML = '<i class="fa-solid fa-power-off"></i>';
        }

        this.els.btnModes.forEach(btn => {
            if (btn.dataset.mode === ac.mode && ac.on) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        
        const timeLabel = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        this.history.labels.push(timeLabel);
        this.history.powerData.push(room.power);
        this.history.tempData.push(room.temp);

        if (this.history.labels.length > this.maxHistoryPoints) {
            this.history.labels.shift();
            this.history.powerData.shift();
            this.history.tempData.shift();
        }

        this.chart.update('none'); 
    }

    addLogEntry(event) {
        
        if (event.roomId !== this.currentRoomId) return;

        const li = document.createElement('li');
        li.className = 'log-item';
        
        let iconHtml = '';
        if (event.type === 'info') iconHtml = '<i class="fa-solid fa-circle-info log-icon info"></i>';
        else if (event.type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation log-icon warning"></i>';
        else if (event.type === 'danger') iconHtml = '<i class="fa-solid fa-circle-xmark log-icon danger"></i>';
        else if (event.type === 'success') iconHtml = '<i class="fa-solid fa-circle-check log-icon success"></i>';

        const timeStr = event.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

        li.innerHTML = `
            ${iconHtml}
            <div class="log-content">
                <span class="log-time">${timeStr}</span>
                <p>${event.message}</p>
            </div>
        `;
        
        this.els.eventLog.prepend(li);
    }

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-info';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation';
        if (type === 'danger') iconClass = 'fa-radiation';
        
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} fa-lg"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        this.els.toastContainer.appendChild(toast);
        
     
        let currentCount = parseInt(this.els.alertBadge.textContent);
        this.els.alertBadge.textContent = currentCount + 1;
        this.els.alertBadge.style.display = 'block';

        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 5000);
    }
}

window.UIManager = UIManager;
