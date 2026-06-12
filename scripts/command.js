(function () {
    const paletteHTML = `
    <div id="command-palette" class="palette-overlay" style="display: none;">
        <div class="palette-modal">
            <div class="palette-input-wrapper">
                <svg class="palette-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="palette-input" placeholder="Type a command or rectangle(w, h)..." autocomplete="off">
            </div>
            <div id="palette-results" class="palette-results"></div>
            <div class="palette-footer">
                <span><kbd>↑↓</kbd> to navigate</span>
                <span><kbd>Enter</kbd> to select</span>
                <span><kbd>Esc</kbd> to dismiss</span>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', paletteHTML);

    const overlay = document.getElementById("command-palette");
    const input = document.getElementById("palette-input");
    const resultsContainer = document.getElementById("palette-results");

    let selectedIndex = 0;
    let filteredActions = [];

    const actions = [
        { id: 'rect', label: 'Create Rectangle', shortcut: 'R', cmd: 'rectangle(100, 100)', run: (w, h) => createQuickShape('rectangle', w, h) },
        { id: 'ellipse', label: 'Create Ellipse', shortcut: 'O', cmd: 'ellipse(100, 100)', run: (w, h) => createQuickShape('ellipse', w, h) },
        { id: 'frame', label: 'Create Frame', shortcut: 'F', cmd: 'frame(800, 600)', run: (w, h) => createQuickShape('frame', w, h) },
        { id: 'star', label: 'Create Star', shortcut: 'S', cmd: 'star(100, 100)', run: (w, h) => createQuickShape('star', w, h) },
        { id: 'poly', label: 'Create Polygon', shortcut: 'P', cmd: 'polygon(100, 100)', run: (w, h) => createQuickShape('polygon', w, h) },
        { id: 'line', label: 'Create Line', shortcut: 'L', cmd: 'line(200)', run: (w) => createQuickShape('line', w) },
        {
            id: 'text',
            label: 'Create Text',
            shortcut: 'T',
            cmd: 'text("content")',
            run: (content) => {
                
                const x = (canvas.clientWidth / 2) - 50;
                const y = (canvas.clientHeight / 2) - 10;

                
                const el = createText(x, y);

                if (content) {
                    
                    const cleanText = content.replace(/['"]+/g, '');
                    el.dom.textContent = cleanText;
                    el.text = cleanText;
                }

                selectElement(el.id);

                
                if (window.redrawLayers) window.redrawLayers();
                if (window.saveState) window.saveState();
            }
        },
        { id: 'del', label: 'Delete Selected', shortcut: '⌫', run: () => window.deleteSelectedElements() },
        { id: 'clear', label: 'Clear Canvas', run: () => { if (confirm("Clear everything?")) { state.elements = []; canvas.innerHTML = ""; redrawLayers(); } } }
    ];


    function createQuickShape(type, w = 100, h = 100) {
        const x = (canvas.clientWidth / 2) - (w / 2);
        const y = (canvas.clientHeight / 2) - (h / 2);
        let el;

        switch (type) {
            case 'rectangle': el = createRectangle(x, y); break;
            case 'ellipse': el = createEllipse(x, y); break;
            case 'frame': el = createFrame(x, y); break;
            case 'star': el = createStar(x, y); break;
            case 'polygon': el = createPolygon(x, y); break;
            case 'line': el = createLine(x, y); break;
        }

        if (el) {
            el.width = parseInt(w);
            el.height = parseInt(h);
            Object.assign(el.dom.style, { width: el.width + 'px', height: el.height + 'px' });
            if (type === 'polygon') updatePolygonPath(el);
            if (type === 'star') updateStarPath(el);
            selectElement(el.id);
            if (window.saveState) window.saveState();
        }
    }

    function open() {
        overlay.style.display = "flex";
        input.value = "";
        input.focus();
        renderResults();
    }

    function close() {
        overlay.style.display = "none";
        selectedIndex = 0;
    }

    function renderResults() {
        const query = input.value.toLowerCase();

        const funcMatch = query.match(/^(\w+)\s*\(?\s*(\d+)?\s*,?\s*(\d+)?\s*\)?/);

        filteredActions = actions.filter(a =>
            a.label.toLowerCase().includes(query) ||
            a.id.toLowerCase().includes(query)
        );

        resultsContainer.innerHTML = filteredActions.map((a, i) => `
            <div class="result-item ${i === selectedIndex ? 'active' : ''}" data-index="${i}">
                <span class="result-label">${a.label}</span>
                <span class="result-cmd">${a.cmd || ''}</span>
                ${a.shortcut ? `<span class="result-key">${a.shortcut}</span>` : ''}
            </div>
        `).join("");
    }

    function execute() {
        const val = input.value.trim();

        const funcMatch = val.match(/^(\w+)\s*\(([^)]*)\)/);

        if (funcMatch) {
            const commandName = funcMatch[1].toLowerCase();
            const paramsRaw = funcMatch[2]; 

            const params = paramsRaw.split(',').map(p => p.trim().replace(/['"]+/g, ''));

            const action = actions.find(a => a.id.startsWith(commandName.substring(0, 3)));

            if (action && action.run) {
                action.run(params[0], params[1]);
                close();
                return;
            }
        }

        const selected = filteredActions[selectedIndex];
        if (selected) {
            selected.run();
            close();
        }
    }

    window.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            open();
        }

        if (overlay.style.display === "flex") {
            if (e.key === "Escape") close();
            if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % filteredActions.length;
                renderResults();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + filteredActions.length) % filteredActions.length;
                renderResults();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                execute();
            }
        }
    });

    input.addEventListener("input", () => {
        selectedIndex = 0;
        renderResults();
    });

    overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) close();
    });

    const pillTrigger = document.getElementById("sidebar-command-trigger");
    if (pillTrigger) {
        pillTrigger.onclick = () => {
            if (typeof open === "function") open();
            else {
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    metaKey: true
                }));
            }
        };
    }
})();