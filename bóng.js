// ==UserScript==
// @name         Bypass Link4m - Bóng X
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Bong x
// @match        https://link4m.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const RAW_URL = "https://raw.githubusercontent.com/doanht898/1.2.1bongx/refs/heads/main/1.%23";
    const MAX_RETRY = 3;

     /* ===============================
         🎵 ÂM THANH CLICK (with fallback)
     =============================== */
     const DEFAULT_CLICK = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f95b0adff8.mp3?filename=click-124467.mp3";
     const clickSound = new Audio();
     clickSound.src = DEFAULT_CLICK;
     clickSound.preload = 'auto';
     clickSound.volume = 0.7;
     clickSound.addEventListener('error', () => {
          console.warn('BX: click sound failed to load');
     });

    /* ===============================
       🎨 FULL GIAO DIỆN BÓNG X
    =============================== */
    GM_addStyle(`
        :root { --bx-accent: #ff3850; --bx-dark: rgba(18,18,18,0.75); }
        .bx-floating-btn {
            position: fixed; bottom: 26px; right: 26px; z-index: 9999999;
            width: 62px; height: 62px; border-radius: 50%;
            background: linear-gradient(135deg, var(--bx-accent), #8b000e);
            box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 20px rgba(255,56,80,0.25);
            display:flex; align-items:center; justify-content:center; color:#fff; font-size:26px;
            cursor:pointer; transition:transform .18s ease, box-shadow .18s ease; user-select:none;
        }
        .bx-floating-btn:active{ transform:scale(.96); }

        #bx-panel{ position:fixed; right:26px; bottom:100px; width:320px; padding:14px; z-index:99999999;
            background: linear-gradient(180deg, rgba(24,24,24,0.82), rgba(16,16,16,0.6));
            border-radius:12px; border:1px solid rgba(255,60,80,0.12); color:#fff; font-family:Inter,Segoe UI,system-ui;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6); transform-origin:100% 100%; opacity:0; transform:translateY(8px) scale(.98);
            pointer-events:none; transition:opacity .22s ease, transform .22s ease;
        }
        #bx-panel.active{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }

        #bx-header{ display:flex; align-items:center; gap:10px; }
        #bx-logo{ font-weight:700; color:var(--bx-accent); text-shadow:0 4px 18px rgba(255,56,80,0.12); }
        #bx-desc{ color:#d0d0d0; font-size:12px; }

        .bx-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:10px; }
        .bx-btn{ padding:10px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600; background:var(--bx-accent); color:#fff; }
        .bx-btn.secondary{ background:transparent; border:1px solid rgba(255,255,255,0.06); color:#fff; }
        .bx-switch{ display:inline-flex; align-items:center; gap:8px; }
        .bx-small{ font-size:13px; color:#e8e8e8; }
        input[type=range]{ width:110px; }
        .bx-note{ font-size:12px; color:#bdbdbd; margin-top:8px; }
    `);

    /* ===============================
       🧩 TẠO UI
    =============================== */
    const circleBtn = document.createElement('button');
    circleBtn.className = 'bx-floating-btn';
    circleBtn.setAttribute('aria-label','Mở Bóng X');
    circleBtn.innerHTML = '⚡';

    const panel = document.createElement('div');
    panel.id = 'bx-panel';

    panel.innerHTML = `
        <div id="bx-header">
            <div id="bx-logo">⚡ BÓNG X</div>
            <div style="flex:1">
                <div id="bx-desc">Bypass tự động link4m </div>
            </div>
        </div>
        <div class="bx-row">
            <button id="bx-run-btn" class="bx-btn">🚀 Bypass ngay</button>
            <button id="bx-settings-toggle" class="bx-btn secondary">⚙️</button>
        </div>
        <div id="bx-settings" style="display:none">
            <div class="bx-row">
                <div class="bx-small">Auto bypass</div>
                <label class="bx-switch"><input type="checkbox" id="bx-auto" /> <span class="bx-small">On</span></label>
            </div>
            <div class="bx-row">
                <div class="bx-small">Âm thanh</div>
                <label class="bx-switch"><input type="checkbox" id="bx-sound" checked /> <span class="bx-small">Bật</span></label>
            </div>
            <div class="bx-row">
                <div class="bx-small">Âm lượng</div>
                <input id="bx-volume" type="range" min="0" max="1" step="0.05" value="0.7" />
            </div>
            <div class="bx-row">
                <div class="bx-small">Âm chọn</div>
                <select id="bx-sound-select" style="flex:1; margin-left:8px; padding:6px; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#fff;">
                    <option value="default">Default click</option>
                    <option value="vn">Âm VN (dán URL bên dưới)</option>
                    <option value="custom">URL tùy chỉnh</option>
                </select>
            </div>
            <div class="bx-row">
                <div class="bx-small">URL nhạc</div>
                <input id="bx-sound-url" type="text" style="flex:1; margin-left:8px; padding:6px; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#fff;" placeholder="https://... .mp3" />
            </div>
            <div class="bx-row">
                <div class="bx-small">RAW URL</div>
                <input id="bx-rawurl" type="text" style="flex:1; margin-left:8px; padding:6px; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#fff;" placeholder="Override RAW URL" />
            </div>
            <div class="bx-note">Phím tắt: <strong>B</strong> mở/đóng, <strong>Enter</strong> chạy</div>
        </div>
        <div id="bx-log" class="bx-note">Last: -</div>
    `;

    document.body.appendChild(circleBtn);
    document.body.appendChild(panel);

    // make panel draggable and remember position
    (function makeDraggable(){
        const header = document.getElementById('bx-header');
        let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

        function loadPos(){
            try{ const p = JSON.parse(localStorage.getItem('bx_pos')||'null'); return p; }catch(e){return null;}
        }
        function savePos(l,t){ localStorage.setItem('bx_pos', JSON.stringify({left:l, top:t})); }

        // apply saved pos if exists
        const pos = loadPos();
        if(pos){ panel.style.left = pos.left + 'px'; panel.style.top = pos.top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; }
        else {
            // convert default right/bottom to left/top
            setTimeout(()=>{
                try{
                    const rect = panel.getBoundingClientRect();
                    const left = window.innerWidth - rect.width - 26;
                    const top = window.innerHeight - rect.height - 100;
                    panel.style.left = left + 'px'; panel.style.top = top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
                }catch(e){}
            }, 50);
        }

        header.style.cursor = 'move';
        header.addEventListener('mousedown', (ev)=>{
            dragging = true; startX = ev.clientX; startY = ev.clientY;
            const rect = panel.getBoundingClientRect(); startLeft = rect.left; startTop = rect.top;
            ev.preventDefault();
        });
        window.addEventListener('mousemove', (ev)=>{
            if(!dragging) return;
            const dx = ev.clientX - startX; const dy = ev.clientY - startY;
            const left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, startLeft + dx));
            const top = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, startTop + dy));
            panel.style.left = left + 'px'; panel.style.top = top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
        });
        window.addEventListener('mouseup', ()=>{ if(dragging){ dragging=false; savePos(parseInt(panel.style.left||0,10), parseInt(panel.style.top||0,10)); } });
    })();

    /* ===============================
       📌 MỞ / ĐÓNG PANEL
    =============================== */
    function togglePanel() {
        try { if (settings.sound) clickSound.play().catch(()=>{}); } catch(e){}
        panel.classList.toggle('active');
        document.getElementById('bx-settings').style.display = panel.classList.contains('active') ? 'block' : 'none';
    }

    circleBtn.addEventListener('click', togglePanel);

    /* ===============================
       🚀 CHẠY Bypass
    =============================== */
    // settings persistence
    const DEFAULTS = { auto: true, sound: true, volume: 0.7, runInPage: true, rawUrl: RAW_URL };
    function loadSettings(){
        try{ return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('bx_settings')||'{}')); }catch(e){ return DEFAULTS; }
    }
    function saveSettings(){ localStorage.setItem('bx_settings', JSON.stringify(settings)); }

    const settings = loadSettings();
    // bind UI values
    const inputAuto = document.getElementById('bx-auto');
    const inputSound = document.getElementById('bx-sound');
    const inputVol = document.getElementById('bx-volume');
    inputAuto.checked = !!settings.auto;
    inputSound.checked = !!settings.sound;
    inputVol.value = settings.volume ?? 0.7;
    clickSound.volume = settings.volume ?? 0.7;

    document.getElementById('bx-settings-toggle').addEventListener('click', ()=>{
        const s = document.getElementById('bx-settings');
        s.style.display = s.style.display === 'none' ? 'block' : 'none';
    });

    inputAuto.addEventListener('change', (e)=>{ settings.auto = e.target.checked; saveSettings(); });
    inputSound.addEventListener('change', (e)=>{ settings.sound = e.target.checked; saveSettings(); });
    inputVol.addEventListener('input', (e)=>{ settings.volume = parseFloat(e.target.value); clickSound.volume = settings.volume; saveSettings(); });
    const soundSelect = document.getElementById('bx-sound-select');
    const soundUrlInput = document.getElementById('bx-sound-url');
    // soundTrack: {type: 'default'|'vn'|'custom', url: '...'}
    settings.soundTrack = settings.soundTrack || { type: 'default', url: '' };
    soundSelect.value = settings.soundTrack.type || 'default';
    soundUrlInput.value = settings.soundTrack.url || '';
    function applySoundTrack(){
        const st = settings.soundTrack || {type:'default', url:''};
        if(st.type === 'default') clickSound.src = DEFAULT_CLICK;
        else if(st.type === 'vn' && st.url) clickSound.src = st.url;
        else if(st.type === 'custom' && st.url) clickSound.src = st.url;
        clickSound.load();
    }
    applySoundTrack();
    soundSelect.addEventListener('change', (e)=>{ settings.soundTrack.type = e.target.value; saveSettings(); applySoundTrack(); });
    soundUrlInput.addEventListener('change', (e)=>{ settings.soundTrack.url = e.target.value.trim(); saveSettings(); applySoundTrack(); });
    const inputRaw = document.getElementById('bx-rawurl');
    inputRaw.value = settings.rawUrl || '';
    inputRaw.addEventListener('change', (e)=>{ settings.rawUrl = e.target.value.trim(); saveSettings(); });

    function updateLog(status, msg){
        try{
            const el = document.getElementById('bx-log');
            const t = new Date();
            const ts = t.toLocaleTimeString();
            el.textContent = `Last: ${status} @ ${ts}${msg?(' — '+msg):''}`;
            const runs = JSON.parse(localStorage.getItem('bx_runs')||'[]');
            runs.unshift({t:Date.now(), status, msg});
            localStorage.setItem('bx_runs', JSON.stringify(runs.slice(0,10)));
        }catch(e){console.warn('BX: log error', e)}
    }

    function setButtonState(btn, state, text){
        btn.disabled = state === 'busy';
        btn.textContent = text;
        if(state === 'ok') btn.style.background = '#28a745';
        else if(state === 'warn') btn.style.background = '#ffc107';
        else if(state === 'err') btn.style.background = '#dc3545';
        else btn.style.background = '';
    }
    function runBypass() {
        const btn = document.getElementById('bx-run-btn');
        setButtonState(btn, 'busy', '⏳ Đang chạy...');
        const urlInput = document.getElementById('bx-rawurl');
        const url = (urlInput && urlInput.value.trim()) || settings.rawUrl || RAW_URL;
        let attempt = 0;

        function tryFetch(){
            attempt++;
            updateLog('Running', `attempt ${attempt}`);
            GM_xmlhttpRequest({ method:'GET', url: url, onload(res){
                try{
                    if(settings.runInPage && typeof unsafeWindow !== 'undefined' && unsafeWindow.eval){
                        unsafeWindow.eval(res.responseText);
                    } else {
                        (new Function(res.responseText))();
                    }
                    setButtonState(btn, 'ok', '✅ Thành công!');
                    updateLog('Success', `attempt ${attempt}`);
                }catch(err){
                    console.error('BX: eval error', err);
                    if(attempt < MAX_RETRY) {
                        updateLog('Retrying', `eval error, retry ${attempt+1}`);
                        setTimeout(tryFetch, 400 * Math.pow(2, attempt));
                        return;
                    } else {
                        setButtonState(btn, 'warn', '⚠️ Lỗi code!');
                        updateLog('Error', 'eval failed');
                    }
                }
                if(settings.sound) try{ clickSound.play().catch(()=>{}); }catch(e){}
                setTimeout(()=> setButtonState(btn, 'idle', '🚀 Bypass ngay'), 2200);
            }, onerror(err){
                console.warn('BX: load error', err);
                if(attempt < MAX_RETRY){
                    updateLog('Retrying', `load error, retry ${attempt+1}`);
                    setTimeout(tryFetch, 400 * Math.pow(2, attempt));
                } else {
                    setButtonState(btn, 'err', '❌ Lỗi tải code!');
                    updateLog('Error', 'load failed');
                    setTimeout(()=> setButtonState(btn, 'idle', '🚀 Bypass ngay'), 2200);
                }
            } });
        }

        tryFetch();
    }

    document.getElementById('bx-run-btn').addEventListener('click', runBypass);

})();