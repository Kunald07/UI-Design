(function () {

    function cloneElement(el, offsetX = 20, offsetY = 20) {
        const newId = generateId();

        const newDom = el.dom.cloneNode(true);
        newDom.dataset.id = newId;

        const newElement = {
            ...el,
            id: newId,
            x: el.x + offsetX,
            y: el.y + offsetY,
            dom: newDom,
            zIndex: state.elements.length + 1
        };

        newDom.style.left = `${newElement.x}px`;
        newDom.style.top = `${newElement.y}px`;
        newDom.style.outline = "none";

        canvas.appendChild(newDom);
        state.elements.push(newElement);

        if (typeof makeDraggable === "function") makeDraggable(newElement);

        return newElement;
    }

    window.addEventListener("keydown", e => {
        if (document.activeElement && (document.activeElement.isContentEditable || document.activeElement.tagName === "INPUT")) return;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
            e.preventDefault();

            const selected = getSelectedElements();
            if (selected.length === 0) return;

            const newIds = [];
            selected.forEach(el => {
                const clone = cloneElement(el, 20, 20);
                newIds.push(clone.id);
            });

            state.selectedIds = newIds;

            if (window.redrawLayers) redrawLayers();
            if (window.updateZIndices) updateZIndices();
            if (window.onSelectionChange) window.onSelectionChange();
            if (window.saveState) window.saveState();
        }
    });

    // Alt + Drag Logic
    canvas.addEventListener("mousedown", e => {
        if (e.altKey && e.target !== canvas && state.tool === "move") {
            const elDom = e.target.closest('[data-id]');
            if (!elDom) return;

            const originalEl = getElementById(elDom.dataset.id);
            if (!originalEl || originalEl.locked) return;

            e.stopPropagation();

            const clone = cloneElement(originalEl, 0, 0);

            selectElement(clone.id);

            state.isDragging = true;
            state.dragOffsetX = e.clientX - clone.x;
            state.dragOffsetY = e.clientY - clone.y;

            if (window.onSelectionChange) window.onSelectionChange();
        }
    }, true);

})();