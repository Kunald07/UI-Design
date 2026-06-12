
(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    const FILE_ID = urlParams.get("fileId");

    if (!FILE_ID) {
        window.location.replace("dashboard.html");
        return;
    }

    
    const STORAGE_KEY = `rachna_data_${FILE_ID}`;
    const INDEX_KEY = "rachna_projects_list";

    let isRestoring = false;
    let saveTimeout;

    function debouncedSave() {
        if (isRestoring) return;

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveState();
            console.log("💾 Project Auto-saved");
        }, 500);
    }

    function saveState() {
        if (isRestoring || !window.state) return;

        const currentFileName = document.querySelector(".filename")?.textContent.trim() || "Untitled";

        try {
            const data = {
                elements: window.state.elements.map(el => ({
                    id: el.id,
                    type: el.type,
                    name: el.name,
                    x: el.x,
                    y: el.y,
                    width: el.width,
                    height: el.height,
                    zIndex: el.zIndex,
                    visible: el.visible,
                    locked: el.locked,
                    rotation: el.rotation || 0,
                    text: el.text,
                    fontSize: el.fontSize || parseInt(el.dom.style.fontSize),
                    fontWeight: el.fontWeight,
                    fontFamily: el.fontFamily,
                    shadowX: el.shadowX,
                    shadowY: el.shadowY,
                    shadowBlur: el.shadowBlur,
                    shadowColor: el.shadowColor,
                    imageSrc: el.imageSrc,
                    background: el.dom.style.background,
                    color: el.dom.style.color,
                    borderRadius: el.dom.style.borderRadius,
                    border: el.dom.style.border,
                    angle: el.angle
                })),
                filename: currentFileName,
                lastId: window.idCounter
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            const projects = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
            const pIdx = projects.findIndex(p => p.id === FILE_ID);
            if (pIdx !== -1) {
                projects[pIdx].name = currentFileName;
                projects[pIdx].lastModified = Date.now();
                localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
            }

        } catch (e) { console.error("💾 Save Error:", e); }
    }

    function restoreState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;
        try {
            isRestoring = true;
            const data = JSON.parse(savedData);
            const canvas = document.getElementById("canvas");

            canvas.innerHTML = "";
            window.state.elements = [];
            window.state.selectedIds = [];
            window.idCounter = data.lastId || 0;

            if (data.filename) document.querySelector(".filename").textContent = data.filename;

            data.elements.forEach(saved => {
                const element = recreateElement(saved, canvas);
                window.state.elements.push(element);
                if (typeof window.makeDraggable === "function") window.makeDraggable(element);
            });

            if (typeof window.updateZIndices === "function") window.updateZIndices();
            if (typeof window.redrawLayers === "function") window.redrawLayers();
        } catch (e) { console.error("💾 Restore Error:", e); } finally { isRestoring = false; }
    }

    function recreateElement(saved, canvas) {
        const div = document.createElement("div");
        div.dataset.id = saved.id;

        const typeClassMap = {
            'rectangle': 'canvas-rect',
            'ellipse': 'canvas-ellipse',
            'line': 'canvas-line',
            'polygon': 'canvas-polygon',
            'star': 'canvas-star',
            'text': 'canvas-text',
            'image': 'canvas-image',
            'frame': 'canvas-frame'
        };
        div.className = typeClassMap[saved.type] || `canvas-${saved.type}`;

        const elementObj = {
            ...saved,
            x: Number(saved.x), y: Number(saved.y),
            width: Number(saved.width), height: Number(saved.height),
            dom: div
        };

        Object.assign(div.style, {
            position: "absolute",
            left: `${elementObj.x}px`, top: `${elementObj.y}px`,
            width: `${elementObj.width}px`, height: `${elementObj.height}px`,
            zIndex: elementObj.zIndex,
            background: elementObj.background,
            color: elementObj.color,
            borderRadius: elementObj.borderRadius,
            border: elementObj.border,
            display: elementObj.visible === false ? "none" : "block",
            transform: `rotate(${elementObj.rotation || 0}deg)`,
            cursor: elementObj.locked ? "default" : "pointer",
            outline: "none"
        });

        if (elementObj.shadowColor) {
            div.style.boxShadow = `${elementObj.shadowX}px ${elementObj.shadowY}px ${elementObj.shadowBlur}px 0px ${elementObj.shadowColor}`;
        }

        if (saved.type === "frame") {
            const label = document.createElement("div");
            label.className = "frame-label";
            label.textContent = saved.name;
            div.appendChild(label);
        }

        if (elementObj.type === "text") {
            div.textContent = elementObj.text || "Text";
            div.style.fontSize = (elementObj.fontSize || 16) + "px";
            div.style.fontWeight = elementObj.fontWeight || "400";
            div.style.fontFamily = elementObj.fontFamily || "Arial, sans-serif";
            div.style.whiteSpace = "pre-wrap";

            div.addEventListener("dblclick", e => {
                if (elementObj.locked) return;
                e.stopPropagation(); div.contentEditable = true; div.focus();
            });
            div.addEventListener("blur", () => {
                div.contentEditable = false;
                elementObj.text = div.textContent;
                if (window.redrawLayers) window.redrawLayers();
                debouncedSave();
            });
        } else if (elementObj.type === "image" && elementObj.imageSrc) {
            const img = document.createElement("img");
            img.src = elementObj.imageSrc;
            img.style.width = "100%"; img.style.height = "100%"; img.draggable = false;
            div.appendChild(img);
        }
        canvas.appendChild(div);
        return elementObj;
    }

    window.saveState = debouncedSave;

    window.addEventListener("load", () => {
        setTimeout(() => {
            restoreState();
        
            const observer = new MutationObserver((mutations) => {
                if (isRestoring) return;

                debouncedSave();

                const shouldRedraw = mutations.some(m => m.type === 'childList');
                if (shouldRedraw && typeof window.redrawLayers === "function") {
                    window.redrawLayers();
                }
            });

            observer.observe(document.getElementById("canvas"), {
                childList: true,
                subtree: true,
                attributes: true
            });

            const nameEl = document.querySelector(".filename");
            if (nameEl) {
                nameEl.addEventListener("input", debouncedSave);
            }
        }, 50);
    });
})();