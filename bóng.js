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

    /* ===============================
       🎵 ÂM THANH CLICK
    =============================== */
    const clickSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_f95b0adff8.mp3?filename=click-124467.mp3");

    /* ===============================
       🎨 FULL GIAO DIỆN BÓNG X
    =============================== */
    GM_addStyle(`

        .bx-floating-btn {
            position: fixed;
            bottom: 26px;
            right: 26px;
            z-index: 9999999;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #ff1e32, #8b000e);
            box-shadow: 0 0 18px rgba(255,30,50,0.9);
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 30px;
            font-weight: bold;
            transition: 0.3s;
        }
        .bx-floating-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 28px rgba(255,60,80,1);
        }

        #bx-panel {
            position: fixed;
            bottom: 100px;
            right: 26px;
            width: 260px;
            padding: 18px;
            background: rgba(20,20,20,0.63);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(255,40,60,0.65);
            border-radius: 18px;
            box-shadow: 0 0 22px rgba(255,40,60,0.45);
            color: white;
            font-family: "Segoe UI", sans-serif;
            z-index: 99999999;
            opacity: 0;
            transform: scale(0.6);
            pointer-events: none;
            transition: 0.25s ease;
        }

        #bx-panel.active {
            opacity: 1;
            transform: scale(1);
            pointer-events: auto;
        }

        #bx-logo {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            padding-bottom: 10px;
            color: #ff3b4d;
            text-shadow: 0 0 8px #ff1e32;
        }

        #bx-run-btn {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            background: linear-gradient(120deg, #ff1e32, #d60016);
            color: white;
            box-shadow: 0 0 14px rgba(255,30,50,0.8);
            transition: 0.25s;
        }

        #bx-run-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 0 22px rgba(255,60,80,1);
        }
    `);

    /* ===============================
       🧩 TẠO UI
    =============================== */
    const circleBtn = document.createElement("div");
    circleBtn.className = "bx-floating-btn";
    circleBtn.textContent = "⚡";

    const panel = document.createElement("div");
    panel.id = "bx-panel";

    panel.innerHTML = `
        <div id="bx-logo">⚡ BÓNG X</div>
        <button id="bx-run-btn">🚀 Bypass ngay</button>
    `;

    document.body.appendChild(circleBtn);
    document.body.appendChild(panel);

    /* ===============================
       📌 MỞ / ĐÓNG PANEL
    =============================== */
    function togglePanel() {
        clickSound.play();
        panel.classList.toggle("active");
    }

    circleBtn.onclick = togglePanel;

    /* ===============================
       🚀 CHẠY Bypass
    =============================== */
    function runBypass() {
        const btn = document.getElementById("bx-run-btn");
        btn.textContent = "⏳ Đang chạy...";
        btn.disabled = true;

        GM_xmlhttpRequest({
            method: "GET",
            url: RAW_URL,

            onload: function(res) {
                try {
                    unsafeWindow.eval(res.responseText);
                    btn.textContent = "✅ Thành công!";
                    btn.style.background = "#28a745";
                } catch {
                    btn.textContent = "⚠️ Lỗi code!";
                    btn.style.background = "#ffc107";
                }

                setTimeout(() => {
                    btn.textContent = "🚀 Bypass ngay";
                    btn.style.background = "";
                    btn.disabled = false;
                }, 3000);
            },

            onerror: function() {
                btn.textContent = "❌ Lỗi tải code!";
                btn.style.background = "#dc3545";
                setTimeout(() => {
                    btn.textContent = "🚀 Bypass ngay";
                    btn.style.background = "";
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    document.getElementById("bx-run-btn").onclick = runBypass;

    /* ===============================
       🤖 AUTO-BYPASS KHI VÀO TRANG
    =============================== */
    setTimeout(runBypass, 800);

    /* ===============================
       🛡️ CHỐNG TRANG XÓA PANEL
    =============================== */
    setInterval(() => {
        if (!document.body.contains(circleBtn)) document.body.appendChild(circleBtn);
        if (!document.body.contains(panel)) document.body.appendChild(panel);
    }, 2000);

})();