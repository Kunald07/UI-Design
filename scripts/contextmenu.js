(function () {
    const menu = document.createElement("div");
    menu.id = "custom-context-menu";
    menu.className = "context-menu";
    menu.style.display = "none";
    document.body.appendChild(menu);

    const style = document.createElement("style");
    style.textContent = `
        .context-menu {
            position: fixed;
            background: #2c2c2c;
            border: 1px solid #444;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            padding: 5px;
            min-width: 180px;
            z-index: 999999;
            font-family: sans-serif;
        }
        .context-menu-item {
            padding: 8px 12px;
            color: #eee;
            font-size: 0.8rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            transition: 0.2s;
        }
        .context-menu-item:hover { background: #0e8be8; color: white; }
        .context-menu-item span.shortcut { color: #888; font-size: 0.65rem; margin-left: 10px; }
        .context-menu-divider { height: 1px; background: #444; margin: 5px 0; }
    `;
    document.head.appendChild(style);

    document.addEventListener("contextmenu", (e) => e.preventDefault());

    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();

       
        const globalX = e.clientX;
        const globalY = e.clientY;

        
        const { x, y } = getCanvasCoords(e);

        showMenu(globalX, globalY, x, y);
    });

    function showMenu(pageX, pageY, canvasX, canvasY) {
        menu.innerHTML = "";

        let items = [];

       
        if (state.selectedIds.length > 0) {
            items = [
                { label: "Duplicate", shortcut: "Ctrl+D", action: () => triggerShortcut("d", { ctrlKey: true }) },
                { label: "Delete", shortcut: "Del", action: () => deleteElementsAction() },
                { type: "divider" },
                { label: "Bring Forward", shortcut: "]", action: () => moveZIndex(1) },
                { label: "Send Backward", shortcut: "[", action: () => moveZIndex(-1) }
            ];
        }
        
        else {
            items = [
                { label: "Create Frame", shortcut: "F", action: () => spawn("frame", canvasX, canvasY) },
                { type: "divider" },
                { label: "Rectangle", shortcut: "R", action: () => spawn("rectangle", canvasX, canvasY) },
                { label: "Circle", shortcut: "O", action: () => spawn("ellipse", canvasX, canvasY) },
                { label: "Line", shortcut: "L", action: () => spawn("line", canvasX, canvasY) },
                { label: "Polygon", shortcut: "P", action: () => spawn("polygon", canvasX, canvasY) },
                { label: "Star", shortcut: "S", action: () => spawn("star", canvasX, canvasY) },
                { type: "divider" },
                { label: "Text", shortcut: "T", action: () => spawn("text", canvasX, canvasY) },
                { label: "Upload Image", shortcut: "I", action: () => triggerImageUpload() }
            ];
        }

        items.forEach(item => {
            if (item.type === "divider") {
                const d = document.createElement("div");
                d.className = "context-menu-divider";
                menu.appendChild(d);
                return;
            }
            const div = document.createElement("div");
            div.className = "context-menu-item";
            div.innerHTML = `${item.label} <span class="shortcut">${item.shortcut}</span>`;
            div.onclick = () => {
                item.action();
                hideMenu();
            };
            menu.appendChild(div);
        });

        menu.style.display = "block";

       
        let finalX = pageX;
        let finalY = pageY;
        if ((finalX + menu.offsetWidth) > window.innerWidth) finalX -= menu.offsetWidth;
        if ((finalY + menu.offsetHeight) > window.innerHeight) finalY -= menu.offsetHeight;

        menu.style.left = finalX + "px";
        menu.style.top = finalY + "px";
    }

    
    function spawn(type, x, y) {
        let el;
        const defaultSize = 100;

        switch (type) {
            case "frame": el = createFrame(x, y); break;
            case "rectangle": el = createRectangle(x, y); break;
            case "ellipse": el = createEllipse(x, y); break;
            case "line": el = createLine(x, y); break;
            case "polygon": el = createPolygon(x, y); break;
            case "star": el = createStar(x, y); break;
            case "text": el = createText(x, y); break;
        }

        if (el) {
           
            if (type === "line") {
                el.width = defaultSize;
                el.dom.style.width = defaultSize + "px";
            } else if (type !== "text") {
                el.width = defaultSize;
                el.height = defaultSize;
                el.dom.style.width = defaultSize + "px";
                el.dom.style.height = defaultSize + "px";
            }

            
            if (type === "polygon") updatePolygonPath(el);
            if (type === "star") updateStarPath(el);

            selectElement(el.id);
            if (window.saveState) window.saveState();
        }
    }

    function triggerImageUpload() {
        if (imageDockBtn) imageDockBtn.click();
    }

    function hideMenu() { menu.style.display = "none"; }
    window.addEventListener("mousedown", (e) => { if (!menu.contains(e.target)) hideMenu(); });

    function deleteElementsAction() {
        const selected = getSelectedElements().filter(el => !el.locked);
        selected.forEach(el => {
            if (el.dom && canvas.contains(el.dom)) canvas.removeChild(el.dom);
            state.elements = state.elements.filter(e => e.id !== el.id);
        });
        state.selectedIds = [];
        if (window.removeTransformBox) window.removeTransformBox();
        redrawLayers();
        updateZIndices();
        if (window.saveState) window.saveState();
    }

    function triggerShortcut(key, mods) {
        const event = new KeyboardEvent("keydown", {
            key: key,
            ctrlKey: mods.ctrlKey,
            metaKey: mods.ctrlKey,
            bubbles: true
        });
        window.dispatchEvent(event);
    }

    function moveZIndex(direction) {
        const selected = getSelectedElements();
        selected.forEach(el => {
            const index = state.elements.findIndex(x => x.id === el.id);
            const target = index + direction;
            if (target >= 0 && target < state.elements.length) {
                state.elements.splice(index, 1);
                state.elements.splice(target, 0, el);
            }
        });
        updateZIndices();
        redrawLayers();
        if (window.saveState) window.saveState();
    }
})();