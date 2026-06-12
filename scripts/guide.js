(function () {
    const guideOverlay = document.querySelector("#guide-overlay");
    const guideBtn = document.querySelector("#shortcut-guide-btn");
    const closeBtn = document.querySelector(".close-guide");
    const listContainer = document.querySelector("#shortcuts-list");

    const shortcuts = [
        { key: "⌘ + K", desc: "Command Palette" },
        { key: "V / M", desc: "Move Tool" },
        { key: "H", desc: "Hand Tool (Pan)" },
        { key: "Space + Drag", desc: "Temporary Pan" },
        { key: "F", desc: "Frame Tool" },
        { key: "R", desc: "Rectangle Tool" },
        { key: "O / E", desc: "Ellipse Tool" },
        { key: "L", desc: "Line Tool" },
        { key: "P", desc: "Polygon Tool" },
        { key: "S", desc: "Star Tool" },
        { key: "Ctrl + D", desc: "Duplicate Element" },
        { key: "Alt + Drag", desc: "Quick Duplicate" },
        { key: "Ctrl + A", desc: "Select All" },
        { key: "Del / Backspace", desc: "Delete Selection" },
        { key: "Arrows", desc: "Nudge 1px (Shift for 10px)" },
        { key: "Shift + /", desc: "Toggle this Guide" }
    ];

    // CSS Injected dynamically to match Command Palette
    const style = document.createElement("style");
    style.textContent = `
        .guide-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center; z-index: 20000;
        }
        .guide-modal {
            background: #1e1e1e; width: 450px; border-radius: 12px;
            border: 1px solid #333; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.8);
            overflow: hidden; font-family: 'Inter', sans-serif;
        }
        .guide-header {
            padding: 16px 20px; border-bottom: 1px solid #333;
            display: flex; justify-content: space-between; align-items: center;
            background: #1e1e1e;
        }
        .guide-header h3 { margin: 0; color: #fff; font-size: 1rem; font-weight: 500; }
        .close-guide { color: #666; cursor: pointer; font-size: 1.1rem; transition: color 0.2s; }
        .close-guide:hover { color: #fff; }
        
        .guide-content { 
            padding: 12px; max-height: 450px; overflow-y: auto; 
            background: #1e1e1e;
        }
        .guide-content::-webkit-scrollbar { width: 8px; }
        .guide-content::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

        .shortcut-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 12px; border-radius: 8px;
            transition: background 0.2s;
        }
        .shortcut-item:hover { background: rgba(255, 255, 255, 0.03); }
        
        .shortcut-desc { color: #eee; font-size: 0.85rem; }
        
        .shortcut-key {
            background: #2c2c2c; color: #888; padding: 3px 8px;
            border-radius: 4px; font-size: 0.7rem; font-weight: 600;
            border: 1px solid #3d3d3d; min-width: 40px; text-align: center;
            font-family: monospace;
        }
    `;
    document.head.appendChild(style);

    listContainer.innerHTML = shortcuts.map(s => `
        <div class="shortcut-item">
            <span class="shortcut-desc">${s.desc}</span>
            <span class="shortcut-key">${s.key}</span>
        </div>
    `).join("");

    function show() { guideOverlay.style.display = "flex"; }
    function hide() { guideOverlay.style.display = "none"; }

    function toggle() {
        if (guideOverlay.style.display === "none" || guideOverlay.style.display === "") {
            show();
        } else {
            hide();
        }
    }

    if (guideBtn) guideBtn.onclick = (e) => { e.stopPropagation(); toggle(); };
    if (closeBtn) closeBtn.onclick = hide;

    guideOverlay.addEventListener("mousedown", (e) => {
        if (e.target === guideOverlay) hide();
    });

    window.addEventListener("keydown", (e) => {
        if (document.activeElement && (document.activeElement.isContentEditable || ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))) return;

        if (e.key === "?") {
            e.preventDefault();
            toggle();
        }

        if (e.key === "Escape" && guideOverlay.style.display === "flex") {
            hide();
        }
    });
})();