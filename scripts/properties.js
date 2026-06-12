(function () {
    const panel = document.querySelector(".properties");
    if (!panel) return;

    
    panel.style.cssText = `
        padding: 0.5rem;
        background-color: #2c2c2c;
        overflow-y: auto;
        overflow-x: hidden;
        height: 100vh;
        max-height: 100vh;
        box-sizing: border-box;
        position: sticky;
        top: 0;
        contain: size layout;
    `;

    const style = document.createElement("style");
    style.textContent = `
        .properties::-webkit-scrollbar { width: 8px; }
        .properties::-webkit-scrollbar-track { background: #1e1e1e; }
        .properties::-webkit-scrollbar-thumb { background: #4a4a4a; border-radius: 4px; }
        .properties h3 { margin: 0.75rem; color: #fafafa; font-size: 1rem; font-weight: 600; }
        .properties h4 { margin: 0 0 0.5rem 0; color: #9ca3af; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    `;
    document.head.appendChild(style);

    function getSelectedElement() {
        if (!window.state || state.selectedIds.length !== 1) return null;
        return state.elements.find(el => el.id === state.selectedIds[0]);
    }

    function rebuild() {
        const el = getSelectedElement();

        if (!el) {
            panel.innerHTML = `
                <h3>Properties</h3>
                <div class="properties-placeholder" style="
                    margin-top: 40px; padding: 20px; text-align: center; color: #888;
                    font-size: 0.85rem; line-height: 1.6; border: 1px dashed #444;
                    border-radius: 8px; margin: 0 10px;
                ">
                    <p>Select an element to view properties.</p>
                </div>
            `;
            return;
        }

        el.rotation ??= 0; el.scaleX ??= 1; el.scaleY ??= 1;
        el.fontSize ??= 16; el.fontWeight ??= 400;
        el.fontFamily ??= "Arial, sans-serif";
        el._autoSized ??= false;

        el.shadowX ??= 0;
        el.shadowY ??= 4;
        el.shadowBlur ??= 10;
        el.shadowColor ??= "#00000066";

        panel.innerHTML = "<h3>Properties</h3>";

        panel.appendChild(section("Position", [
            numberInput("X", el.x, v => { el.x = v; el.dom.style.left = v + "px" }),
            numberInput("Y", el.y, v => { el.y = v; el.dom.style.top = v + "px" })
        ]));

    
        panel.appendChild(section("Transform", [
            button("Rotate 90°", () => { el.rotation = (el.rotation + 90) % 360; applyTransform(el) }),
            button("Flip V", () => { el.scaleY *= -1; applyTransform(el) }),
            button("Flip H", () => { el.scaleX *= -1; applyTransform(el) })
        ], true));


        panel.appendChild(section("Layout", [
            numberInput("W", el.dom.offsetWidth, v => {
                el.dom.style.width = v + "px";
                el._autoSized = false;
                if (el.type === "text") requestAnimationFrame(() => adjustTextFontSize(el));
            }),
            numberInput("H", el.dom.offsetHeight, v => {
                el.dom.style.height = v + "px";
                el._autoSized = false;
                if (el.type === "text") requestAnimationFrame(() => adjustTextFontSize(el));
            })
        ], false));

        panel.appendChild(section("Appearance", [
            numberInput("Opacity", el.dom.style.opacity || 1, v => { el.dom.style.opacity = Math.min(1, Math.max(0, v)) }),
            numberInput("Radius", parseInt(el.dom.style.borderRadius) || 0, v => { el.dom.style.borderRadius = v + "px" })
        ]));

        if (el.type === "text") {
            panel.appendChild(section("Text", [
                numberInput("Font Size", parseInt(getComputedStyle(el.dom).fontSize), v => {
                    el.dom.style.fontSize = v + "px";
                    el.fontSize = v;
                    requestAnimationFrame(() => {
                        const neededHeight = el.dom.scrollHeight;
                        if (neededHeight > el.dom.offsetHeight) {
                            el.dom.style.height = neededHeight + "px";
                            el.height = neededHeight;
                        }
                        el._autoSized = false;
                        adjustTextFontSize(el);
                    });
                }),
                selectInput("Weight", el.fontWeight, ["100", "200", "300", "400", "500", "600", "700", "800", "900"], v => {
                    el.fontWeight = v; el.dom.style.fontWeight = v; el._autoSized = false; adjustTextFontSize(el);
                }),
                selectInput("Font Family", el.fontFamily, [
                    "Arial, sans-serif", "Georgia, serif", "Times New Roman, serif",
                    "Courier New, monospace", "Verdana, sans-serif", "Impact, sans-serif"
                ], v => {
                    el.fontFamily = v; el.dom.style.fontFamily = v; el._autoSized = false; adjustTextFontSize(el);
                })
            ], false));
        }

        if (el.type !== "image") {
            const fill = document.createElement("input");
            fill.type = "color";
            fill.value = rgbToHex(getComputedStyle(el.dom)[el.type === "text" ? "color" : "backgroundColor"]);
            fill.oninput = e => el.dom.style[el.type === "text" ? "color" : "background"] = e.target.value;
            fill.style.cssText = "width:100%; height:32px; cursor:pointer; border:1px solid #353535; border-radius:0.375rem; background:#1e1e1e;";
            panel.appendChild(section("Fill", [fill], false));
        }

        panel.appendChild(section("Effects (Shadow)", [
            numberInput("X", el.shadowX, v => { el.shadowX = v; applyShadow(el); }),
            numberInput("Y", el.shadowY, v => { el.shadowY = v; applyShadow(el); }),
            numberInput("Blur", el.shadowBlur, v => { el.shadowBlur = v; applyShadow(el); }),
            (function () {
                const c = document.createElement("input");
                c.type = "color";
                c.value = el.shadowColor.length > 7 ? el.shadowColor.substring(0, 7) : el.shadowColor;
                c.oninput = e => { el.shadowColor = e.target.value; applyShadow(el); };
                c.style.cssText = "width:100%; height:32px; cursor:pointer; border:1px solid #353535; border-radius:0.375rem; background:#1e1e1e;";
                return c;
            })()
        ]));

        panel.appendChild(section("Stroke", [
            numberInput("Thickness", parseInt(el.dom.style.borderWidth) || 0, v => {
                el.dom.style.borderStyle = "solid";
                el.dom.style.borderWidth = v + "px";
                el.dom.style.borderColor = el.dom.style.borderColor || "#000000";
            }),
            (function () {
                const c = document.createElement("input");
                c.type = "color";
                c.value = rgbToHex(getComputedStyle(el.dom).borderColor || "rgb(0,0,0)");
                c.oninput = e => el.dom.style.borderColor = e.target.value;
                c.style.cssText = "width:100%; height:32px; cursor:pointer; border:1px solid #353535; border-radius:0.375rem; background:#1e1e1e;";
                return c;
            })()
        ]));

        if (el.type === "text" && !el._autoSized) {
            requestAnimationFrame(() => adjustTextFontSize(el));
        }
    }


    function applyShadow(el) {
        el.dom.style.boxShadow = `${el.shadowX}px ${el.shadowY}px ${el.shadowBlur}px 0px ${el.shadowColor}`;
    }

    function section(title, items, inline = false) {
        const wrap = document.createElement("div"); wrap.style.marginBottom = "1rem";
        const h = document.createElement("h4"); h.textContent = title; wrap.appendChild(h);
        const body = document.createElement("div");
        body.style.cssText = `display:flex; flex-direction:${inline ? 'row' : 'column'}; flex-wrap:wrap; gap:0.5rem;`;
        items.forEach(i => body.appendChild(i)); wrap.appendChild(body); return wrap;
    }

    function numberInput(label, value, onChange) {
        const row = document.createElement("div"); row.style.cssText = "display:flex; align-items:center; gap:0.5rem;";
        const l = document.createElement("span"); l.textContent = label; l.style.cssText = "width:50px; color:#d1d5db; font-size:0.75rem;";
        const i = document.createElement("input"); i.type = "number"; i.value = Math.round(value);
        i.style.cssText = "flex:1; min-width:50px; padding:0.375rem 0.5rem; background:#1e1e1e; border:1px solid #353535; border-radius:0.375rem; color:#fafafa; font-size:0.75rem;";
        i.oninput = () => onChange(+i.value); row.append(l, i); return row;
    }

    function selectInput(label, value, options, onChange) {
        const row = document.createElement("div"); row.style.cssText = "display:flex; align-items:center; gap:0.5rem;";
        const l = document.createElement("span"); l.textContent = label; l.style.cssText = "width:50px; color:#d1d5db; font-size:0.75rem;";
        const s = document.createElement("select");
        s.style.cssText = "flex:1; padding:0.375rem 0.5rem; background:#1e1e1e; border:1px solid #353535; border-radius:0.375rem; color:#fafafa; font-size:0.75rem; cursor:pointer;";
        options.forEach(opt => { const o = document.createElement("option"); o.value = opt; o.textContent = opt; if (opt == value) o.selected = true; s.appendChild(o); });
        s.onchange = () => onChange(s.value); row.append(l, s); return row;
    }

    function button(text, fn) {
        const b = document.createElement("button"); b.textContent = text;
        b.style.cssText = "padding:0.375rem 0.5rem; font-size:0.75rem; background:#1e1e1e; border:1px solid #353535; border-radius:0.375rem; color:#fafafa; cursor:pointer;";
        b.onclick = fn; return b;
    }

    function applyTransform(el) { el.dom.style.transform = `rotate(${el.rotation}deg) scale(${el.scaleX},${el.scaleY})`; }

    function rgbToHex(rgb) {
        const m = rgb.match(/\d+/g);
        return m ? "#" + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, "0")).join("") : "#000000";
    }

    function adjustTextFontSize(el) {
        if (el.type !== "text" || el._autoSized) return;
        el._autoSized = true;
        const box = el.dom;
        const probe = document.createElement("div");
        probe.style.cssText = "position:fixed; top:-9999px; visibility:hidden; white-space:pre-wrap; pointer-events:none;";
        probe.style.fontFamily = getComputedStyle(box).fontFamily;
        probe.style.fontWeight = getComputedStyle(box).fontWeight;
        probe.style.width = box.clientWidth + "px";
        probe.textContent = box.textContent;
        document.body.appendChild(probe);

        let size = parseInt(getComputedStyle(box).fontSize);
        const maxH = box.clientHeight || 1;
        probe.style.fontSize = size + "px";
        while (probe.getBoundingClientRect().height > maxH && size > 1) {
            size--;
            probe.style.fontSize = size + "px";
        }
        box.style.fontSize = size + "px";
        document.body.removeChild(probe);
    }

    window.onSelectionChange = rebuild;
    rebuild();
})();