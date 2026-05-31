// Cache Management (moved to the top for language initialization)
const CACHE_KEY = 'endless_tool_cache';
function loadCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch(e) { return {}; } }
function saveCache(id, key, value) { let cache = loadCache(); if (!cache[id]) cache[id] = {}; cache[id][key] = value; localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }

// Initial language detection (URL > Cache > Default 'en')
const urlLang = new URLSearchParams(window.location.search).get('lang');
const cachedLang = loadCache()['app']?.['lang'];
let currentLang = (urlLang === 'fr' || urlLang === 'en') ? urlLang : (cachedLang || 'en');

let audioCtx = null;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }

function playNotification() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime); osc.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.1); 
    gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.5);
}

function sortTimersDOM() {
    const container = document.getElementById('timers-container');
    const cards = Array.from(container.children);
    cards.sort((a, b) => {
        const aDisabled = a.classList.contains('is-disabled') ? 1 : 0;
        const bDisabled = b.classList.contains('is-disabled') ? 1 : 0;
        if (aDisabled !== bDisabled) return aDisabled - bDisabled;
        return a.dataset.index - b.dataset.index;
    });
    cards.forEach(card => container.appendChild(card));
}

const timerConfigs = [
    { id: 'recrutement', names: { en: 'Refresh Recruit', fr: 'Actualiser Recrutement' }, base: 60, unit: 'min', type: 'none' },
    { id: 'reliques', names: { en: 'Refresh Relic Shop', fr: 'Actualiser Boutique de Reliques' }, base: 60, unit: 'min', type: 'none' },
    { id: 'donjon', names: { en: 'Dungeon', fr: 'Donjon' }, base: 10, unit: 'min', type: 'mult', maxMult: 5 },
    { id: 'classement', names: { en: 'Infinite Ranking', fr: 'Classement infini' }, base: 60, unit: 'min', type: 'mult', maxMult: 5 },
    { id: 'tour', names: { en: 'Tower of Challenges', fr: 'Tour des défis' }, base: 10, unit: 'min', type: 'mult', maxMult: 5 },
    { id: 'pub_honneur', names: { en: 'Ad Shop - Honor Coins', fr: 'Pub Boutique - Pièces d\'Honneur' }, base: 5, unit: 'min', type: 'none' },
    { id: 'pub_gemmes', names: { en: 'Ad Shop - Gems', fr: 'Pub Boutique - Gemmes' }, base: 5, unit: 'min', type: 'none' },
    { id: 'rage', names: { en: 'Rage', fr: 'Rage' }, base: 100, unit: 'sec', type: 'rage', maxMult: 6 }
];

const timers = {};

class Timer {
    constructor(config, index) {
        this.config = config; this.index = index; this.baseValue = config.base;
        const cache = loadCache()[this.config.id] || {};
        this.multiplier = cache.mult || 1; this.percent = cache.percent || 0; this.enabled = cache.enabled !== undefined ? cache.enabled : true;
        this.timeLeft = 0; this.maxSeconds = 0; this.interval = null; this.isRunning = false;
        this.initDOM(); this.calculateMaxTime(true);
    }

    toggleEnabled() {
        this.enabled = !this.enabled; saveCache(this.config.id, 'enabled', this.enabled);
        const btn = document.getElementById(`btn-toggle-${this.config.id}`); btn.innerText = this.enabled ? '✅' : '❌';
        if (!this.enabled) { this.cardElement.classList.add('is-disabled'); this.pause(); } else { this.cardElement.classList.remove('is-disabled'); }
        sortTimersDOM();
    }

    calculateMaxTime(isInit = false) {
        let baseSeconds = this.config.unit === 'min' ? this.baseValue * 60 : this.baseValue;
        if (this.config.type === 'mult' || this.config.type === 'rage') baseSeconds *= this.multiplier;
        if (this.config.type === 'percent' || this.config.type === 'rage') baseSeconds *= (1 - (this.percent / 100));
        const oldMax = this.maxSeconds; this.maxSeconds = Math.max(0, Math.floor(baseSeconds));
        if (isInit) this.reset();
        else if (this.cardElement.classList.contains('timer-finished')) this.reset();
        else if (!this.isRunning && this.timeLeft === oldMax) { this.timeLeft = this.maxSeconds; this.updateDisplay(); }
    }

    start() {
        if (!this.enabled) return;
        initAudio();
        if (this.cardElement.classList.contains('timer-finished')) this.reset();
        this.cardElement.classList.remove('timer-finished');
        if (!this.isRunning && this.timeLeft > 0) {
            this.isRunning = true; this.toggleButtons();
            this.interval = setInterval(() => {
                this.timeLeft--; this.updateDisplay();
                if (this.timeLeft <= 0) { this.pause(); this.timeLeft = 0; this.updateDisplay(); this.cardElement.classList.add('timer-finished'); playNotification(); }
            }, 1000);
        }
    }

    pause() { this.isRunning = false; this.toggleButtons(); clearInterval(this.interval); }
    reset() { initAudio(); this.pause(); this.timeLeft = this.maxSeconds; this.cardElement.classList.remove('timer-finished'); this.updateDisplay(); }
    toggleButtons() { const btnPlay = document.getElementById(`btn-play-${this.config.id}`); const btnPause = document.getElementById(`btn-pause-${this.config.id}`); if (this.isRunning) { btnPlay.classList.add('hidden'); btnPause.classList.remove('hidden'); } else { btnPlay.classList.remove('hidden'); btnPause.classList.add('hidden'); } }
    setMultiplier(val) { this.multiplier = val; saveCache(this.config.id, 'mult', val); document.querySelectorAll(`#mult-group-${this.config.id} .btn-mult`).forEach(b => b.classList.remove('active')); document.getElementById(`btn-mult-${this.config.id}-${val}`).classList.add('active'); this.calculateMaxTime(); }
    formatTime(seconds) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60; const format2 = (num) => num.toString().padStart(2, '0'); return h > 0 ? `${format2(h)}:${format2(m)}:${format2(s)}` : `${format2(m)}:${format2(s)}`; }
    updateDisplay() { document.getElementById(`display-${this.config.id}`).innerText = this.formatTime(this.timeLeft); }

    initDOM() {
        const container = document.getElementById('timers-container');
        this.cardElement = document.createElement('div'); this.cardElement.className = 'timer-card'; this.cardElement.dataset.index = this.index;
        if (!this.enabled) this.cardElement.classList.add('is-disabled');
        let multRow = '', percentInline = '';
        if (this.config.type === 'mult' || this.config.type === 'rage') {
            let btns = []; for(let i = 1; i <= (this.config.maxMult || 5); i++) btns.push(`<button class="btn-mult ${(this.multiplier === i) ? 'active' : ''}" id="btn-mult-${this.config.id}-${i}" onclick="timers['${this.config.id}'].setMultiplier(${i})">x${i}</button>`);
            multRow = `<div class="modifier-group" id="mult-group-${this.config.id}">${btns.join('')}</div>`;
        }
        if (this.config.type === 'percent' || this.config.type === 'rage') percentInline = `<div class="modifier-inline"><span>-%:</span><input type="number" id="mod-${this.config.id}" value="${this.percent}" min="0" max="90"></div>`;
        this.cardElement.innerHTML = `
            <div class="top-row">
                <button class="btn-toggle" id="btn-toggle-${this.config.id}" onclick="timers['${this.config.id}'].toggleEnabled()">${this.enabled ? '✅' : '❌'}</button>
                <div class="timer-title" id="title-${this.config.id}">${this.config.names[currentLang]}</div>
                <div class="timer-display" id="display-${this.config.id}">00:00</div>
                <div class="controls">
                    <button id="btn-play-${this.config.id}" class="btn-ctrl btn-play" onclick="timers['${this.config.id}'].start()">▶️</button>
                    <button id="btn-pause-${this.config.id}" class="btn-ctrl btn-pause hidden" onclick="timers['${this.config.id}'].pause()">⏸️</button>
                    <button class="btn-ctrl btn-reset" onclick="timers['${this.config.id}'].reset()">🔄</button>
                </div>
            </div>
            <div class="settings-container">
                <div class="base-row"><label>Base:</label><input type="number" id="base-${this.config.id}" value="${this.baseValue}" min="1" max="${this.config.base}"><span>${this.config.unit}</span>${percentInline}</div>
                ${multRow}
            </div>`;
        container.appendChild(this.cardElement);
        document.getElementById(`base-${this.config.id}`).addEventListener('input', (e) => { let val = Math.max(1, Math.min(this.config.base, parseFloat(e.target.value) || 0)); this.baseValue = val; this.calculateMaxTime(); });
        if (this.config.type === 'percent' || this.config.type === 'rage') document.getElementById(`mod-${this.config.id}`).addEventListener('input', (e) => { this.percent = Math.max(0, Math.min(90, parseFloat(e.target.value) || 0)); saveCache(this.config.id, 'percent', this.percent); this.calculateMaxTime(); });
    }
}

// Function to change the language and save it
function setLang(lang) {
    currentLang = lang;
    saveCache('app', 'lang', lang); // Sauvegarde persistante du choix
    
    // Update appearance of language buttons
    document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-lang-fr').classList.toggle('active', lang === 'fr');
    
    // Timer titles updated
    timerConfigs.forEach(config => {
        const titleEl = document.getElementById(`title-${config.id}`);
        if (titleEl) titleEl.innerText = config.names[lang];
    });
}

// Application initialization
timerConfigs.forEach((config, idx) => timers[config.id] = new Timer(config, idx));
sortTimersDOM();
setLang(currentLang); // Apply the detected language at startup