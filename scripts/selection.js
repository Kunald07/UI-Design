(function () {
    let isSelecting = false;
    let startCoords = { x: 0, y: 0 };
    let marquee = null;

    canvas.addEventListener("mousedown", e => {
        
        if ((e.target === canvas || e.target.classList.contains('canvas-frame')) && state.tool === "move") {
            isSelecting = true;
            const coords = getCanvasCoords(e);
            startCoords = coords;

            
            marquee = document.createElement("div");
            marquee.className = "selection-marquee";
            Object.assign(marquee.style, {
                position: "absolute",
                border: "1px solid #0e8be8",
                background: "rgba(14, 139, 232, 0.1)",
                pointerEvents: "none",
                zIndex: "10000",
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                width: "0px",
                height: "0px"
            });
            canvas.appendChild(marquee);

            if (!e.shiftKey) deselectAll();
        }
    });

    window.addEventListener("mousemove", e => {
        if (!isSelecting || !marquee) return;

        const current = getCanvasCoords(e);
        const left = Math.min(startCoords.x, current.x);
        const top = Math.min(startCoords.y, current.y);
        const width = Math.abs(current.x - startCoords.x);
        const height = Math.abs(current.y - startCoords.y);

        Object.assign(marquee.style, {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
        });

        const marqueeRect = marquee.getBoundingClientRect();

        state.elements.forEach(el => {
            const elRect = el.dom.getBoundingClientRect();
            const isInside = !(
                elRect.left > marqueeRect.right ||
                elRect.right < marqueeRect.left ||
                elRect.top > marqueeRect.bottom ||
                elRect.bottom < marqueeRect.top
            );

            if (isInside && !el.locked) {
                if (!state.selectedIds.includes(el.id)) {
                    state.selectedIds.push(el.id);
                }
            }
        });

        state.elements.forEach(el => {
            el.dom.style.outline = state.selectedIds.includes(el.id) ? "3px solid #0e8be8" : "none";
        });
        if (window.onSelectionChange) window.onSelectionChange();
        if (window.highlightLayer) window.highlightLayer();
    });

    window.addEventListener("mouseup", () => {
        if (isSelecting) {
            isSelecting = false;
            marquee?.remove();
            marquee = null;
        }
    });
})();