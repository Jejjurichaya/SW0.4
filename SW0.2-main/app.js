// =====================
// Swasthya Mitra - PREMIUM OFFLINE HEALTHCARE APP (ALL FEATURES + CULTURAL CONTEXT + SOS)
// =====================

/* Elements */
const languageSelect = document.getElementById('language');
const cultureSelect = document.getElementById('culture');
const micBtn = document.getElementById('micBtn');
const micIcon = document.getElementById('micIcon');
const micStatus = document.getElementById('micStatus');
const textInput = document.getElementById('textInput');
const textSubmit = document.getElementById('textSubmit');
const imageInput = document.getElementById('imageInput');
const imgPreview = document.getElementById('imgPreview');
const preview = document.getElementById('preview');
const imageAnalysis = document.getElementById('imageAnalysis');
const transcriptDiv = document.getElementById('transcript');
const diagnosisDiv = document.getElementById('diagnosis');
const hospitalSection = document.getElementById('hospital-section');
const hospitalList = document.getElementById('hospital-list');
const ttsControls = document.getElementById('ttsControls');
const ttsToggleBtn = document.getElementById('ttsToggleBtn');
const ttsStopBtn = document.getElementById('ttsStopBtn');
const loadingScreen = document.getElementById('loadingScreen');
const statusDiv = document.getElementById('status') || document.createElement('div');
const themeToggle = document.getElementById('themeToggle');

const schedulesList = document.getElementById('schedulesList');
const scheduleForm = document.getElementById('scheduleForm');
const schedName = document.getElementById('schedName');
const schedTime = document.getElementById('schedTime');
const schedRepeat = document.getElementById('schedRepeat');
const customDays = document.getElementById('customDays');
const alarmAudio = document.getElementById('alarmAudio');

const readingsUpload = document.getElementById('readingsUpload');
const downloadReport = document.getElementById('downloadReport');

const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

let symptomsDB = null;
let normalizedDB = {};
let recognition = null;
let isListening = false;
let currentImageFile = null;
let ttsMsg = null;
let ttsState = "idle";
let isAlarmPaused = false;

// 🔥 FIXED: Use safe localStorage helpers
let schedules = [];
let scheduleTimers = [];
let medicines = [];
let healthData = { bp: [], sugar: [], weight: [] };
let currentTracker = 'bp';
let activeAlarmInterval = null;

// 🔥 LOCALSTORAGE HELPERS (FIXED)
function getLocalStorageArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn(`${key} contains invalid JSON`);
    return [];
  }
}

function getLocalStorageObject(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    console.warn(`${key} contains invalid JSON`);
    return {};
  }
}

// Initialize global data safely
schedules = getLocalStorageArray('swasthyaSchedules');
medicines = getLocalStorageArray('swasthyaMeds');
healthData = getLocalStorageObject('swasthyaHealth');

// 🔥 SOS EMERGENCY SYSTEM (FULLY FIXED)
const sosSystem = {
  contacts: getLocalStorageArray('sosContacts'),
  isActive: false,
  pressTimer: null,
  longPressCount: 0,

refreshContacts() {
    this.contacts = getLocalStorageArray('sosContacts');
    console.log('📱 SOS Contacts refreshed:', this.contacts);
  },







  async triggerSOS() {
    this.isActive = true;
    
    // Show fullscreen alert + play alarm
    const sosAlert = document.getElementById('sosAlert');
    const sosAlarm = document.getElementById('sosAlarm');
    if (sosAlert) sosAlert.classList.add('show');
    if (sosAlarm) {
      try { 
        sosAlarm.volume = 1.0; 
        sosAlarm.play(); 
      } catch(e) { console.log('SOS Alarm play failed:', e); }
    }
    
    // Get GPS location
    let location = 'Location unavailable';
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
      });
      location = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    } catch(e) { console.warn('GPS failed:', e.message); }
    
    // Get all health data for SOS (SAFE)
    const globalHealthData = getLocalStorageObject('swasthyaHealth');
    const bmiHistory = getLocalStorageArray('bmiHistory');
    
    const sosHealthData = {
      symptoms: localStorage.getItem('lastSymptoms') || 'No symptoms recorded',
      bp: globalHealthData.bp?.slice(-1)[0]?.sys || 'N/A',
      sugar: globalHealthData.sugar?.slice(-1)[0]?.sugar || 'N/A',
      bmi: bmiHistory.slice(-1)[0]?.bmi || 'N/A',
      timestamp: new Date().toLocaleString('en-IN')
    };
    
    const sosMessage = `🚨 EMERGENCY SOS - SWASTHYA MITRA
📍 LOCATION: ${location}
🩺 SYMPTOMS: ${sosHealthData.symptoms}
💉 BP: ${sosHealthData.bp}
🍬 SUGAR: ${sosHealthData.sugar}
📊 BMI: ${sosHealthData.bmi}
⏰ ${sosHealthData.timestamp}`;
    
    console.log('🚨 SOS TRIGGERED - Contacts:', this.contacts.length);
    
    // Send to ALL contacts via WhatsApp
    this.contacts.forEach((contact, i) => {
      setTimeout(() => {
        const phone = contact.replace(/\D/g, '');
        if (phone.length >= 10) {
          console.log(`📱 Sending WhatsApp to ${phone}`);
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(sosMessage)}`, '_blank');
        }
      }, i * 1000);
    });
    
    // Auto call 112 India Emergency
    setTimeout(() => {
      console.log('📞 Calling 112 Emergency');
      window.open('tel:112');
    }, 2500);
    
    if (statusDiv) statusDiv.textContent = `✅ SOS SENT to ${this.contacts.length} contacts!`;
  },

  stopEmergency() {
    this.isActive = false;
    const sosAlert = document.getElementById('sosAlert');
    const sosAlarm = document.getElementById('sosAlarm');
    if (sosAlert) sosAlert.classList.remove('show');
    if (sosAlarm) {
      sosAlarm.pause();
      sosAlarm.currentTime = 0;
    }
    if (statusDiv) statusDiv.textContent = '✅ Emergency STOPPED';
  },

  initSOSButton() {
    const btn = document.getElementById('sosBtn');
    if (!btn) {
      console.warn('🚨 SOS Button NOT FOUND - Add <button id="sosBtn"> to HTML');
      return;
    }
    console.log('🚨 SOS Button initialized');

    let pressStart = null;

    const startPress = (e) => {
      console.log('🚨 SOS Press START');
      e.preventDefault();
      pressStart = Date.now();
      this.longPressCount = 0;
      const timer = setInterval(() => {
        this.longPressCount++;
        btn.textContent = `🚨 ${this.longPressCount}s`;
        console.log(`🚨 SOS Press: ${this.longPressCount}s`);
        if (this.longPressCount >= 3) {
          clearInterval(timer);
          if (confirm('🚨 CONFIRM EMERGENCY SOS?\nSend location + ALL health data to contacts?')) {
            this.triggerSOS();
          } else {
            btn.textContent = '🚨 SOS';
            this.longPressCount = 0;
          }
        }
      }, 1000);
      this.pressTimer = timer;
    };

    const cancelPress = () => {
      console.log('🚨 SOS Press CANCEL');
      if (this.pressTimer) {
        clearInterval(this.pressTimer);
        this.pressTimer = null;
      }
      btn.textContent = '🚨 SOS';
      this.longPressCount = 0;
      pressStart = null;
    };

    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('mouseup', cancelPress);
    btn.addEventListener('touchend', cancelPress);
    btn.addEventListener('mouseleave', cancelPress);

    // Stop button
    const stopBtn = document.getElementById('stopSOS');
    if (stopBtn) stopBtn.addEventListener('click', () => this.stopEmergency());
  }
};

// ✅ ADD STATUS DIV
if (!document.getElementById('status')) {
  statusDiv.id = 'status';
  statusDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.8);color:white;padding:8px;border-radius:8px;font-size:12px;z-index:9999;max-width:300px;';
  document.body.appendChild(statusDiv);
}

// 🔥 CULTURAL CONTEXT DATABASE
const culturalRemedies = {
  general: {
    fever: "Rest, drink plenty of fluids, paracetamol if needed. Consult doctor if persists >3 days.",
    headache: "Rest in dark room, hydrate, cold compress. Avoid screens.",
    stomach: "ORS solution, light khichdi diet, avoid oily/spicy food."
  },
  karnataka: {
    fever: "[translate:ಬೆಚ್ಚಗೆ: ನೀರು ತಂಗಾಳಿ, ತೇನೆ+ಎಲಕ್ಕಿ, ದಾಸರಿ ಬೀಳು.] Rest, honey+ginger, tulsi water.",
    headache: "[translate:ತಲೆನೋವು: ಬೆಲೆ+ಥಂಗೇ, ಶಾಂತಿ ಮಾಡಿ.] Betel leaves+camphor, rest quietly.",
    stomach: "[translate:ಉದರ: ಜೇನುತುಪ್ಪ+ಹಾಸಿ, ಮೆಹುದಿ ಜೋಳದ ಗೋದಿ.] Honey+ghee, rice water."
  },
  'north-india': {
    fever: "Haldi doodh, adrak chai, paudina chutney. Desi cow ghee for recovery.",
    headache: "Heeng+ajwain water, til oil massage on temples.",
    stomach: "Jeera water, ajwain+saunf, moong dal khichdi."
  },
  'south-india': {
    fever: "Rasam with milagu+tamarind, nimbu pani, tender coconut water.",
    headache: "Pirandai juice, thengai thylam head massage.",
    stomach: "Jeeraga rasam, butter milk with karuveppilai."
  }
};

const symptomToCultureMap = {
  fever: 'fever', 'feverish': 'fever', headache: 'headache', 'head pain': 'headache', 
  'stomach pain': 'stomach', 'stomachache': 'stomach', 
  'ಸೂಳೆ': 'fever', 'ತಲೆನಾಳ್': 'headache', 'ಕಡುಪು': 'stomach'
};

/* -------------- Symptoms DB -------------- */
async function loadSymptoms() {
  try {
    if (loadingScreen) loadingScreen.style.display = 'block';
    const res = await fetch('data/symptoms.json');
    symptomsDB = await res.json();
    normalizedDB = {};
    for (const langKey of Object.keys(symptomsDB)) {
      normalizedDB[langKey] = symptomsDB[langKey].map(item => ({
        raw: item,
        normKeywords: (item.keywords || []).map(k => normalizeForMatch(k))
      }));
    }
    if (statusDiv) statusDiv.textContent = '✅ Symptoms loaded';
  } catch (e) {
    console.error('Symptoms load failed', e);
    if (statusDiv) statusDiv.textContent = '⚠ Symptoms DB offline. Basic AI works.';
  } finally {
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
}

/* ----------------- Helpers ----------------- */
function normalizeForMatch(s) {
  if (!s && s !== '') return '';
  let out = s.normalize ? s.normalize('NFC') : s;
  out = out.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  out = out.replace(/\s+/g, ' ').trim();
  return out.toLowerCase();
}

function isIndicScript(s) { 
  return /[\u0900-\u097F\u0C80-\u0CFF\u0B80-\u0BFF]/u.test(s || ''); 
}

function matchKeywordInText(keyword, text) {
  if (!keyword || !text) return false;
  const nk = normalizeForMatch(keyword), nt = normalizeForMatch(text);
  if (isIndicScript(nk) || isIndicScript(nt)) return nt.includes(nk);
  const escaped = nk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (nk.length < 4) return nt.includes(nk);
  return new RegExp(`\\b${escaped}\\b`, 'i').test(nt);
}

function normalizeLang(code) { 
  return code?.startsWith('hi') ? 'hi' : code?.startsWith('kn') ? 'kn' : 'en'; 
}

/* ----------------- SPEECH RECOGNITION ----------------- */
function getSpeechLocale() {
  const val = languageSelect?.value;
  return val === 'hi' ? 'hi-IN' : val === 'kn' ? 'kn-IN' : 'en-IN';
}

function createRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    if (statusDiv) statusDiv.textContent = '❌ Speech recognition not supported';
    return null;
  }
  const r = new SpeechRec();
  r.continuous = true;
  r.interimResults = true;
  r.lang = getSpeechLocale();
  
  r.onstart = () => { console.log('🎤 Listening started'); };
  let finalTranscript = '';
  
  r.onresult = (e) => {
    let interimTranscript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    const displayText = finalTranscript.trim() || interimTranscript;
    if (transcriptDiv) {
      transcriptDiv.innerHTML = `🎤 "${displayText}" <span style="color:#999">${interimTranscript ? ' (live...)' : ''}</span>`;
      transcriptDiv.style.display = 'block';
    }
    if (textInput) textInput.value = displayText;
    console.log('🔍 Live transcript:', displayText);
  };
  
  r.onerror = (e) => { 
    console.error('❌ Speech error:', e.error);
    stopListeningUI();
    if (micStatus) micStatus.textContent = `Error: ${e.error}`;
  };
  
  r.onend = () => {
    if (isListening && recognition) {
      setTimeout(() => recognition.start(), 200);
    }
  };
  return r;
}

function setupRecognition() { recognition = createRecognition(); }

function startListeningUI() { 
  isListening = true; 
  if (micBtn) micBtn.classList.add('listening'); 
  if (micStatus) micStatus.textContent = 'Listening... 🔴'; 
  if (micIcon) micIcon.textContent = '🎙'; 
}

function stopListeningUI() { 
  isListening = false; 
  if (micBtn) micBtn.classList.remove('listening'); 
  if (micStatus) micStatus.textContent = 'Ready to listen'; 
  if (micIcon) micIcon.textContent = '🎤'; 
}

function analyzeSpeech() {
  const finalText = textInput?.value.trim();
  if (!finalText) return;
  if (transcriptDiv) {
    transcriptDiv.textContent = `⟶ "${finalText}"`;
    transcriptDiv.style.display = 'block';
  }
  stopListeningUI();
  handleUserInput(finalText);
}

function handleUserInput(text) {
  console.log('🔍 ANALYZING:', text);
  if (!symptomsDB) {
    if (diagnosisDiv) {
      diagnosisDiv.innerHTML = '<div class="diagnosis">⚠️ Load symptoms.json first</div>';
      diagnosisDiv.style.display = 'block';
    }
    return;
  }
  
  if (statusDiv) statusDiv.textContent = `🔍 Analyzing: ${text.substring(0,30)}...`;
  const lang = normalizeLang(languageSelect?.value);
  const culture = cultureSelect?.value || 'general';
  
  // 🔥 SAVE for SOS
  localStorage.setItem('lastSymptoms', text);

  const matches = [];
  
  for (const symptom of normalizedDB[lang] || normalizedDB.en || []) {
    for (const keyword of symptom.normKeywords || []) {
      if (matchKeywordInText(keyword, text)) {
        matches.push(symptom.raw);
        break;
      }
    }
  }
  
  setTimeout(() => {
    if (matches.length === 0) {
      if (diagnosisDiv) {
        diagnosisDiv.innerHTML = `<div class="diagnosis">
          ❓ No matches. Try: fever, headache, stomach pain / [translate:ಸೂಳೆ, ತಲೆನಾಳ್]
        </div>`;
        diagnosisDiv.style.display = 'block';
      }
    } else {
      const firstMatch = matches[0];
      const urgencyColor = firstMatch.urgency === 'critical' ? '#ef4444' : 
                            firstMatch.urgency === 'high' ? '#f59e0b' : '#16a34a';
      
      const symptomKey = symptomToCultureMap[firstMatch.name?.toLowerCase()] || 'stomach';
      const symptomAdvice = firstMatch.advice || 'No medical advice available';
      const cultureAdvice = culturalRemedies[culture]?.[symptomKey] || '';
      
      const combinedAdvice = cultureAdvice 
        ? `${symptomAdvice}\n\n🌿 CULTURAL:\n${cultureAdvice}`
        : symptomAdvice;
      
      if (diagnosisDiv) {
        diagnosisDiv.innerHTML = `
         
        <div class="diagnosis" style="padding:16px; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <h4 style="color:${urgencyColor}; margin:0 0 12px 0">✅ ${matches.length} Match${matches.length>1?'es':''}</h4>
            <div style="font-size:18px; font-weight:bold; margin-bottom:8px;">
                ${firstMatch.name || firstMatch.symptom || 'Unknown'}
            </div>
            <div style="background:#f0f9ff; padding:12px; border-radius:8px; border-left:4px solid ${urgencyColor}; margin:12px 0; white-space: pre-wrap;">
                <strong>🏥 Medical Advice:</strong><br>${symptomAdvice}<br><br>
                ${cultureAdvice ? `<strong>🌿 ${culture.toUpperCase()} Remedy:</strong><br>${cultureAdvice}` : ''}
            </div>
            ${matches.length > 1 ? `<div style="opacity:0.7; margin-top:12px">+${matches.length-1} more matches</div>` : ''}
        </div>`;
        diagnosisDiv.style.display = 'block';
      }
    }
    if (statusDiv) statusDiv.textContent = `✅ Found ${matches.length} matches (${culture})`;

    // 🔥 SPEAK COMBINED ADVICE
    if (matches.length > 0) {
      speakAdvice(combinedAdvice, lang);
    }
  }, 500);
}

/* ----------------- UI Navigation & Text Input ----------------- */
navButtons.forEach(btn => btn.addEventListener('click', (ev) => {
  navButtons.forEach(b => b.classList.remove('active'));
  ev.currentTarget.classList.add('active');
  const target = ev.currentTarget.getAttribute('data-target');
  showSection(target);
}));

function showSection(id) {
  sections.forEach(s => s.style.display = (s.id === id) ? 'block' : 'none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (textSubmit) {
  textSubmit.addEventListener('click', () => {
    const t = textInput?.value.trim();
    if (!t) return alert('Please type symptoms or use mic.');
    if (transcriptDiv) {
      transcriptDiv.textContent = `⟶ "${t}"`;
      transcriptDiv.style.display = 'block';
    }
    handleUserInput(t); 
    if (textInput) textInput.value = '';
  });
}

if (textInput) {
  textInput.addEventListener('keydown', (e) => { 
    if (e.key === 'Enter') textSubmit?.click(); 
  });
}

/* ----------------- TEXT-TO-SPEECH ----------------- */
let synth = null;
let currentUtterance = null;

function initTTS() {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
    console.log('✅ TTS ready');
  }
}

function speakAdvice(adviceText, lang = 'en') {
  if (!synth) return;
  synth.cancel();
  currentUtterance = new SpeechSynthesisUtterance(adviceText);
  currentUtterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
  currentUtterance.rate = 0.9;
  currentUtterance.pitch = 1.1;
  synth.speak(currentUtterance);
}

function speakDiagnosis(matches, lang) {
  if (!matches.length) return;
  const advice = matches[0].advice || 'No advice available';
  speakAdvice(advice, lang);
}

/* ----------------- TIMETABLE / ALARM SYSTEM ----------------- */
function saveSchedules() {
  localStorage.setItem('swasthyaSchedules', JSON.stringify(schedules));
}

function renderSchedules() {
  if (!schedulesList) return;
  schedulesList.innerHTML = '';

  if (!schedules.length) {
    schedulesList.innerHTML = "<p style='opacity:0.6;text-align:center;padding:20px;'>No schedules added.</p>";
    return;
  }

  schedules.forEach(s => {
    const div = document.createElement("div");
    div.className = "schedule-item";
    div.style.cssText = "padding:12px;margin:8px 0;background:#fff;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center;";

    div.innerHTML = `
        <div>
            <strong>${s.name}</strong><br>
            <small>${s.time} • ${s.repeat === "custom" ? "Days: "+s.days.join(",") : s.repeat}</small>
        </div>
        <div style="display:flex; gap:10px;">
            <input type="checkbox" class="toggleSched" data-id="${s.id}" ${s.enabled ? "checked" : ""}>
            <button class="delSched" data-id="${s.id}" style="background:#ff4444;color:white;padding:6px 10px;border-radius:6px;border:none;">Delete</button>
        </div>
    `;
    schedulesList.appendChild(div);
  });

  document.querySelectorAll(".toggleSched").forEach(chk => {
    chk.addEventListener("change", () => {
      const id = parseInt(chk.dataset.id);
      const sch = schedules.find(x => x.id === id);
      if (sch) {
        sch.enabled = chk.checked;
        saveSchedules();
        scheduleEngine();
      }
    });
  });

  document.querySelectorAll(".delSched").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      schedules = schedules.filter(x => x.id !== id);
      saveSchedules();
      renderSchedules();
      scheduleEngine();
    });
  });
}

function scheduleEngine() {
  scheduleTimers.forEach(t => clearInterval(t));
  scheduleTimers = [];

  const timer = setInterval(() => {
    if (isAlarmPaused) return;
    
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    const day = now.getDay();

    schedules.forEach(s => {
      if (!s.enabled || s.time !== hhmm) return;

      if (s.repeat === "once") {
        triggerAlarm(s);
        s.enabled = false;
        saveSchedules();
        renderSchedules();
      } else if (s.repeat === "daily") {
        triggerAlarm(s);
      } else if (s.repeat === "custom" && s.days.includes(day)) {
        triggerAlarm(s);
      }
    });
  }, 10000);

  scheduleTimers.push(timer);
  console.log('⏰ Alarm engine started');
}

function triggerAlarm(s) {
  if (isAlarmPaused) return;
  
  console.log("🔔 Alarm:", s.name);
  const controls = document.getElementById("alarmControls");
  if (controls) controls.style.display = "flex";

  if (statusDiv) statusDiv.innerHTML = `🔔 <strong>${s.name}</strong> time!`;

  if (alarmAudio) {
    alarmAudio.currentTime = 0;
    alarmAudio.play().catch(() => {});
  }

  if (navigator.vibrate) navigator.vibrate([300, 200, 300]);

  if (activeAlarmInterval) clearInterval(activeAlarmInterval);
  activeAlarmInterval = setInterval(() => {
    if (alarmAudio) {
      alarmAudio.currentTime = 0;
      alarmAudio.play().catch(() => {});
    }
    if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
  }, 5000);
}

function setupAlarmControls() {
  const stopBtn = document.getElementById("stopAlarmBtn");
  if (stopBtn) {
    stopBtn.onclick = () => {
      if (activeAlarmInterval) {
        clearInterval(activeAlarmInterval);
        activeAlarmInterval = null;
      }
      if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
      }
      isAlarmPaused = true;
      const controls = document.getElementById("alarmControls");
      if (controls) controls.style.display = "none";
      if (statusDiv) statusDiv.textContent = '✅ Alarm STOPPED (All silenced)';
    };
  }

  const resumeBtn = document.getElementById("resumeAlarmBtn");
  if (resumeBtn) {
    resumeBtn.onclick = async () => {
      console.log('▶ RESUME CLICKED');
      isAlarmPaused = false;
      
      try {
        if (alarmAudio) {
          alarmAudio.currentTime = 0;
          await alarmAudio.play();
          if (statusDiv) statusDiv.textContent = '▶ Playing now...';
          
          if (activeAlarmInterval) clearInterval(activeAlarmInterval);
          
          activeAlarmInterval = setInterval(async () => {
            try {
              if (alarmAudio) {
                alarmAudio.currentTime = 0;
                await alarmAudio.play();
              }
              if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
            } catch(e) {
              console.log('Interval play failed:', e);
            }
          }, 5000);
          
          if (statusDiv) statusDiv.textContent = '✅ RESUMED - Every 5s ✓';
        }
      } catch(e) {
        console.error('❌ Resume failed:', e);
        if (statusDiv) statusDiv.textContent = '⚠️ Audio blocked';
      }
    };
  }
}

function setupScheduleForm() {
  if (!scheduleForm || !schedRepeat) return;

  schedRepeat.addEventListener("change", () => {
    if (customDays) customDays.style.display = schedRepeat.value === "custom" ? "flex" : "none";
  });

  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log('📅 FORM SUBMITTED!');

    const name = schedName?.value.trim();
    const time = schedTime?.value;
    const repeat = schedRepeat?.value;
    let days = [];

    if (repeat === "custom") {
      days = Array.from(customDays.querySelectorAll("input:checked")).map(c => parseInt(c.value));
      if (!days.length) return alert("Select days");
    }

    if (!name || !time) return alert("Enter medicine name & time");

    schedules.push({
      id: Date.now(),
      name,
      time,
      repeat,
      days,
      enabled: true
    });

    saveSchedules();
    scheduleForm.reset();
    if (customDays) customDays.style.display = "none";
    renderSchedules();
    scheduleEngine();
    if (statusDiv) statusDiv.textContent = `✅ Added: ${name}`;
  });
}

/* ----------------- STUBS ----------------- */
function updateHealthDisplay() {}
function showTracker(type) { currentTracker = type; }

/* ----------------- APP INIT ----------------- */
async function initApp() {
  setupRecognition();
  initTTS();
  setupScheduleForm();
  setupAlarmControls();
  
  // 🔥 INIT SOS BUTTON
  sosSystem.initSOSButton();
  
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      console.log('🎤 MIC CLICKED');
      if (isListening) {
        recognition?.stop();
        stopListeningUI();
        setTimeout(analyzeSpeech, 500);
      } else {
        if (!recognition) {
          if (statusDiv) statusDiv.textContent = '❌ Use Chrome/Edge';
          return;
        }
        recognition.lang = getSpeechLocale();
        recognition.start();
        startListeningUI();
      }
    });
  }
  
  await loadSymptoms();
  renderSchedules();
  updateHealthDisplay();
  scheduleEngine();
  
  if (statusDiv) statusDiv.textContent = '🚀 Ready! Cultural context + SOS + All features ✓';
  showSection('symptom-section');
}

// 🔥 START APP
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
