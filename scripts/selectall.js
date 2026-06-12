(function () {
    window.addEventListener("keydown", e => {
    
        const isTyping = document.activeElement && (
            document.activeElement.isContentEditable ||
            document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA"
        );
        if (isTyping) return;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
            e.preventDefault(); 

            const selectableElements = state.elements.filter(el => !el.locked);

            state.selectedIds = selectableElements.map(el => el.id);

            state.elements.forEach(el => {
                el.dom.style.outline = state.selectedIds.includes(el.id)
                    ? "3px solid #0e8be8"
                    : "none";
            });

            if (window.highlightLayer) window.highlightLayer();
            if (window.onSelectionChange) window.onSelectionChange();

            if (state.selectedIds.length !== 1 && window.removeTransformBox) {
                window.removeTransformBox();
            }
        }
    });
})();