const state = {
    tool: "move",
    activeShape: "rectangle",

    elements: [],
    selectedIds: [],

    isDrawing: false,
    startX: 0,
    startY: 0,
    currentElement: null,

    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,

    draggingLayerId: null
}

state.transform = {
    box: null,
    target: null,
    mode: null,
    handle: null,
    start: null
}


const canvas = document.getElementById("canvas")
const layersPanel = document.querySelector(".layers")
const toolButtons = document.querySelectorAll(".tool-btn")
const shapeButtons = document.querySelectorAll("[data-shape]")
const shapeDockBtn = document.querySelector(".tool-group > .tool-btn")
const shapeDropdown = document.querySelector(".tool-dropdown")
const textDockBtn = document.querySelector('[data-tool="text"]')
const imageDockBtn = document.querySelector('[data-tool="image"]')
const prototype = document.querySelector("#prototype");

prototype.addEventListener("click", () => {
    window.alert("this feature will come in Version 3.0.0");
})

console.log("Rachna JS loaded 🚀")

// utilities

window.idCounter = 0;
const generateId = () => `el_${++window.idCounter}`;

function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function getElementById(id) {
    return state.elements.find(el => el.id === id)
}

function updateZIndices() {
    state.elements.forEach((el, index) => {
        el.zIndex = index + 1
        el.dom.style.zIndex = el.zIndex
    })
}

function getSelectedElements() {
    return state.selectedIds.map(id => getElementById(id))
}


// global delete function

window.deleteSelectedElements = function () {
    const selected = getSelectedElements().filter(el => !el.locked);
    if (selected.length === 0) return;

    selected.forEach(el => {
        if (el.dom && canvas.contains(el.dom)) {
            canvas.removeChild(el.dom);
        }
        state.elements = state.elements.filter(e => e.id !== el.id);
    });

    state.selectedIds = [];
    removeTransformBox();
    redrawLayers();
    updateZIndices();
    if (typeof saveState === "function") saveState();
};

// shared drag handler

function makeDraggable(element) {
    element.dom.addEventListener("mousedown", e => {

        if (e.altKey) return;

        e.stopPropagation()
        selectElement(element.id, e.shiftKey)

        const el = getElementById(element.id)
        if (state.tool !== "move" || el.locked) return

        state.isDragging = true
        state.dragOffsetX = e.clientX - el.x
        state.dragOffsetY = e.clientY - el.y
    })
}


// tool selection

function setTool(toolName) {
    state.tool = toolName;

    // 1. Remove active class from all buttons
    document.querySelectorAll(".tool-btn").forEach(btn => btn.classList.remove("active"));
    shapeDockBtn.classList.remove("active");

    // 2. Add active class to the correct button
    const activeBtn = document.querySelector(`[data-tool="${toolName}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    } else if (toolName === "shape") {
        shapeDockBtn.classList.add("active");
    }

    // 3. Update Cursor
    canvas.style.cursor = (toolName === "hand") ? "grab" : "default";

    // 4. Cleanup
    if (toolName !== "move") deselectAll();
}

// Main Tool Buttons (Move, Hand, Frame, etc.)
toolButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const tool = btn.dataset.tool;
        if (tool) setTool(tool);
    });
});

// Dropdown Shape Buttons
shapeButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent closing dropdown immediately if needed
        state.activeShape = btn.dataset.shape;
        setTool("shape");

        // Update main button text/icon to show which shape is active
        shapeDockBtn.innerHTML = `${btn.dataset.shape.charAt(0).toUpperCase() + btn.dataset.shape.slice(1)} <kbd>${btn.querySelector('kbd').textContent}</kbd>`;

        shapeDropdown.style.display = "none";
    });
});


// shape selection

shapeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        state.activeShape = btn.dataset.shape
        state.tool = "shape"

        // Close dropdown
        // shapeDropdown.style.display = "none"

        // Update dock button text
        shapeDockBtn.textContent = btn.dataset.shape.charAt(0).toUpperCase() + btn.dataset.shape.slice(1)
    })
})


// frame selection

function createFrame(x, y) {
    const id = generateId();
    const div = document.createElement("div");

    div.className = "canvas-frame";
    div.dataset.id = id;

    const label = document.createElement("div");
    label.className = "frame-label";
    label.textContent = "Frame " + (state.elements.filter(e => e.type === 'frame').length + 1);
    div.appendChild(label);

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        background: "#ffffff",
        border: "1px solid #bcbcbc",
        overflow: "hidden",
        cursor: "pointer",
    });

    canvas.appendChild(div);

    const element = {
        id,
        type: "frame",
        name: label.textContent,
        visible: true,
        locked: false,
        x, y,
        width: 0, height: 0,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    };

    state.elements.push(element);
    makeDraggable(element);
    redrawLayers();
    updateZIndices();

    return element;
}

// rectangle element

function createRectangle(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-rect"
    div.dataset.id = id

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        background: "#D9D9D9",
        borderRadius: "4px",
        cursor: "pointer",
        userSelect: "none",
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "rectangle",
        name: "Rectangle",
        visible: true,
        locked: false,
        x, y,
        width: 0, height: 0,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// ellipse element

function createEllipse(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-ellipse"
    div.dataset.id = id

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        background: "#D9D9D9",
        borderRadius: "50%",
        cursor: "pointer",
        userSelect: "none",
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "ellipse",
        name: "Ellipse",
        visible: true,
        locked: false,
        x, y,
        width: 0, height: 0,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// line element

function createLine(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-line"
    div.dataset.id = id

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "2px",
        background: "#D9D9D9",
        transformOrigin: "left center",
        cursor: "pointer",
        userSelect: "none",
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "line",
        name: "Line",
        visible: true,
        locked: false,
        x, y,
        width: 0,
        height: 2,
        angle: 0,
        dom: div,
        groupId: null,
        zIndex: state.elements.length + 1
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// polygon element

function createPolygon(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-polygon"
    div.dataset.id = id

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        cursor: "pointer",
        userSelect: "none",
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "polygon",
        name: "Triangle",
        visible: true,
        locked: false,
        x, y,
        width: 0, height: 0,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// star element

function createStar(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-star"
    div.dataset.id = id

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "0px",
        height: "0px",
        cursor: "pointer",
        userSelect: "none",
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "star",
        name: "Star",
        visible: true,
        locked: false,
        x, y,
        width: 0, height: 0,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// text element

function createText(x, y) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-text"
    div.dataset.id = id
    div.contentEditable = false

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        minWidth: "30px",
        minHeight: "20px",
        fontSize: "16px",
        color: "#ffffff",
        cursor: "text",
        userSelect: "none",
        background: "transparent",
        outline: "none",
    })

    div.addEventListener("dblclick", e => {
        e.stopPropagation()
        div.contentEditable = true
        div.focus()
    })

    div.addEventListener("blur", () => {
        div.contentEditable = false
        const el = getElementById(id)
        el.text = div.textContent || "Text"
        redrawLayers()
    })

    canvas.appendChild(div)

    const element = {
        id,
        type: "text",
        name: "Text",
        text: "Text",
        visible: true,
        locked: false,
        x, y,
        width: div.offsetWidth,
        height: div.offsetHeight,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// image element

function createImage(x, y, imageSrc, imageWidth, imageHeight) {
    const id = generateId()
    const div = document.createElement("div")

    div.className = "canvas-image"
    div.dataset.id = id

    const img = document.createElement("img")
    img.src = imageSrc
    img.style.width = "100%"
    img.style.height = "100%"
    img.style.objectFit = "contain"
    img.draggable = false

    Object.assign(div.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
    })

    div.appendChild(img)
    canvas.appendChild(div)

    const element = {
        id,
        type: "image",
        name: "Image",
        visible: true,
        locked: false,
        x, y,
        width: imageWidth,
        height: imageHeight,
        zIndex: state.elements.length + 1,
        dom: div,
        groupId: null,
        imageSrc
    }

    state.elements.push(element)
    makeDraggable(element)
    redrawLayers()
    updateZIndices()

    return element
}

// transform

function applyElementTransform(el) {
    el.dom.style.left = el.x + "px"
    el.dom.style.top = el.y + "px"
    el.dom.style.width = el.width + "px"
    el.dom.style.height = el.height + "px"
    el.dom.style.transform = `rotate(${el.rotation || 0}deg)`
}

function showTransformBox(el) {
    removeTransformBox()

    const box = document.createElement("div")
    box.className = "transform-box"

    Object.assign(box.style, {
        position: "absolute",
        left: el.x + "px",
        top: el.y + "px",
        width: el.width + "px",
        height: el.height + "px",
        transform: `rotate(${el.rotation || 0}deg)`,
        transformOrigin: "center",
        border: "1px dashed #0e8be8",
        pointerEvents: "none",
        zIndex: 9999
    })

    canvas.appendChild(box)

    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
    handles.forEach(h => {
        const handle = document.createElement("div")
        handle.className = "resize-handle"
        handle.dataset.handle = h

        Object.assign(handle.style, {
            width: "8px",
            height: "8px",
            background: "#fff",
            border: "1px solid #0e8be8",
            position: "absolute",
            pointerEvents: "auto",
            cursor: h + "-resize"
        })

        positionResizeHandle(handle, h)
        handle.addEventListener("mousedown", e => startResize(e, el, h))
        box.appendChild(handle)
    })

    const rotate = document.createElement("div")
    Object.assign(rotate.style, {
        width: "10px",
        height: "10px",
        background: "#0e8be8",
        borderRadius: "50%",
        position: "absolute",
        top: "-26px",
        left: "50%",
        transform: "translateX(-50%)",
        cursor: "grab",
        pointerEvents: "auto"
    })

    rotate.addEventListener("mousedown", e => startRotate(e, el))
    box.appendChild(rotate)

    state.transform.box = box
    state.transform.target = el
}


function positionResizeHandle(h, pos) {
    const map = {
        nw: ["-4px", "-4px"],
        n: ["50%", "-4px"],
        ne: ["calc(100% - 4px)", "-4px"],
        e: ["calc(100% - 4px)", "50%"],
        se: ["calc(100% - 4px)", "calc(100% - 4px)"],
        s: ["50%", "calc(100% - 4px)"],
        sw: ["-4px", "calc(100% - 4px)"],
        w: ["-4px", "50%"]
    }

    h.style.left = map[pos][0]
    h.style.top = map[pos][1]
    h.style.transform = "translate(-50%, -50%)"
}

function startResize(e, el, handle) {
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const { x, y, width, height } = el

    function move(ev) {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        if (handle.includes("e")) el.width = Math.max(10, width + dx)
        if (handle.includes("s")) el.height = Math.max(10, height + dy)

        if (handle.includes("w")) {
            el.width = Math.max(10, width - dx)
            el.x = x + dx
        }

        if (handle.includes("n")) {
            el.height = Math.max(10, height - dy)
            el.y = y + dy
        }

        applyElementTransform(el)
        updateTransformBox()
    }

    function up() {
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
}

function startRotate(e, el) {
    e.stopPropagation()

    const rect = el.dom.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    function move(ev) {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx)
        el.rotation = angle * 180 / Math.PI + 90
        applyElementTransform(el)
        updateTransformBox()
    }

    function up() {
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
}

function updateTransformBox() {
    const box = state.transform.box
    const el = state.transform.target
    if (!box || !el) return

    Object.assign(box.style, {
        left: el.x + "px",
        top: el.y + "px",
        width: el.width + "px",
        height: el.height + "px",
        transform: `rotate(${el.rotation || 0}deg)`
    })
}

function removeTransformBox() {
    state.transform.box?.remove()
    state.transform.box = null
    state.transform.target = null
}


// share updates handlers

function updatePolygonPath(element) {
    const w = element.width;
    const h = element.height;

    const points = `${w / 2}px 0px, ${w}px ${h}px, 0px ${h}px`;

    element.dom.style.clipPath = `polygon(${points})`;
    element.dom.style.background = "#D9D9D9";
}

function updateStarPath(element) {
    const w = element.width
    const h = element.height
    const cx = w / 2
    const cy = h / 2
    const outerRadius = Math.min(w, h) / 2
    const innerRadius = outerRadius * 0.4

    let points = []
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const x = cx + radius * Math.cos(angle)
        const y = cy + radius * Math.sin(angle)
        points.push(`${x}px ${y}px`)
    }

    element.dom.style.clipPath = `polygon(${points.join(', ')})`
    element.dom.style.background = "#D9D9D9"
}

// canvas events

// deselect outside the canvas

canvas.addEventListener("mousedown", e => {

    if (e.target !== canvas) return

    deselectAll()
})

canvas.addEventListener("mousedown", e => {
    const { x, y } = getCanvasCoords(e);


    if (state.tool === "hand") {
        return;
    }


    if (state.tool === "frame") {
        state.isDrawing = true;
        state.startX = x;
        state.startY = y;
        state.currentElement = createFrame(x, y);
        return;
    }


    if (state.tool === "shape") {
        state.isDrawing = true;
        state.startX = x;
        state.startY = y;

        switch (state.activeShape) {
            case "rectangle": state.currentElement = createRectangle(x, y); break;
            case "ellipse": state.currentElement = createEllipse(x, y); break;
            case "line": state.currentElement = createLine(x, y); break;
            case "polygon": state.currentElement = createPolygon(x, y); break;
            case "star": state.currentElement = createStar(x, y); break;
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if (state.isDrawing && state.currentElement) {
        const { x, y } = getCanvasCoords(e)
        const el = state.currentElement

        let w = x - state.startX
        let h = y - state.startY


        if (el.type === "line") {
            const length = Math.sqrt(w * w + h * h)
            const angle = Math.atan2(h, w) * (180 / Math.PI)

            el.width = Math.max(1, length)
            el.angle = angle

            Object.assign(el.dom.style, {
                width: `${el.width}px`,
                transform: `rotate(${angle}deg)`
            })
        } else {

            if (e.shiftKey) {
                const size = Math.max(10, Math.max(Math.abs(w), Math.abs(h)))
                w = w < 0 ? -size : size
                h = h < 0 ? -size : size
            }

            el.width = Math.max(10, Math.abs(w))
            el.height = Math.max(10, Math.abs(h))
            el.x = w < 0 ? state.startX + w : state.startX
            el.y = h < 0 ? state.startY + h : state.startY

            Object.assign(el.dom.style, {
                width: `${el.width}px`,
                height: `${el.height}px`,
                left: `${el.x}px`,
                top: `${el.y}px`,
            })


            if (el.type === "polygon") {
                updatePolygonPath(el)
            } else if (el.type === "star") {
                updateStarPath(el)
            }
        }
    }


    if (state.selectedIds.length === 1) {
        showTransformBox(getElementById(state.selectedIds[0]))
    } else {
        removeTransformBox()
    }

    // transform ends


    if (state.isDragging && state.selectedIds.length) {
        const dx = e.clientX - state.dragOffsetX
        const dy = e.clientY - state.dragOffsetY

        getSelectedElements().forEach(el => {
            if (el.locked) return
            el.x = dx
            el.y = dy
            Object.assign(el.dom.style, {
                left: `${el.x}px`,
                top: `${el.y}px`,
            })
        })
    }
})

window.addEventListener("mouseup", () => {
    if (state.isDrawing && state.currentElement) {
        selectElement(state.currentElement.id);
        setTool("move");
    }
    state.isDrawing = false;
    state.currentElement = null;
    state.isDragging = false;
});

// selection

function selectElement(id, multi = false) {
    if (!multi) state.selectedIds = [id]
    else if (!state.selectedIds.includes(id)) state.selectedIds.push(id)

    state.elements.forEach(el => {
        el.dom.style.outline =
            state.selectedIds.includes(el.id) ? "3px solid #0e8be8" : "none"
    })

    highlightLayer()


    if (window.onSelectionChange) window.onSelectionChange()
}

function deselectAll() {
    state.selectedIds = []
    state.elements.forEach(el => el.dom.style.outline = "none")
    highlightLayer()

    if (window.onSelectionChange) window.onSelectionChange()
}

// layers panel

function redrawLayers() {
    layersPanel.innerHTML = ""

    state.elements.slice().reverse().forEach(el => {
        const layer = document.createElement("div")
        layer.className = "layer-item"
        layer.dataset.id = el.id
        layer.draggable = true
        layer.style.display = "flex"
        layer.style.alignItems = "center"
        layer.style.justifyContent = "space-between"
        layer.style.padding = "0.5rem"
        layer.style.borderRadius = "0.5rem"
        layer.style.cursor = "grab"

        const eye = document.createElement("span")
        const VISIBLE = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  stroke-width="1.5" stroke="currentColor" width="16" height="16">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

`

        const INVISIBLE = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  stroke-width="1.5" stroke="currentColor" width="16" height="16">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>

`
        eye.innerHTML = el.visible
            ? VISIBLE
            : INVISIBLE
        eye.style.cursor = "pointer"
        eye.addEventListener("click", e => {
            e.stopPropagation()
            el.visible = !el.visible
            el.dom.style.display = el.visible ? "block" : "none"
            redrawLayers()
        })

        const lock = document.createElement("span")
        const UNLOCKED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  stroke-width="1.5" stroke="currentColor" width="16" height="16">
  <path stroke-linecap="round" stroke-linejoin="round"
    d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75
       M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25
       v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75
       a2.25 2.25 0 0 0-2.25 2.25v6.75
       a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
`

        const LOCKED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  stroke-width="1.5" stroke="currentColor" width="16" height="16">
  <path stroke-linecap="round" stroke-linejoin="round"
    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75
       m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25
       v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75
       a2.25 2.25 0 0 0-2.25 2.25v6.75
       a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
`

        lock.innerHTML = el.locked
            ? LOCKED_SVG : UNLOCKED_SVG
        lock.style.cursor = "pointer"
        lock.style.marginLeft = "0.25rem"
        lock.addEventListener("click", e => {
            e.stopPropagation()
            el.locked = !el.locked
            redrawLayers()
        })

        const name = document.createElement("span")
        name.textContent = el.type === "text" ? el.text : el.name
        name.style.flex = "1"
        name.style.marginLeft = "0.5rem"
        name.addEventListener("click", e => {
            e.stopPropagation()
            name.contentEditable = true
            name.focus()
        })
        name.addEventListener("blur", () => {
            name.contentEditable = false
            if (el.type === "text") el.text = name.textContent.trim() || "Text"
            else el.name = name.textContent.trim() || el.name
            redrawLayers()
        })

        layer.addEventListener("click", e => selectElement(el.id, e.shiftKey))

        // drag reorder
        layer.addEventListener("dragstart", () => {
            state.draggingLayerId = el.id
            layer.style.opacity = "0.4"
        })
        layer.addEventListener("dragend", () => {
            state.draggingLayerId = null
            layer.style.opacity = "1"
        })
        layer.addEventListener("dragover", e => e.preventDefault())
        layer.addEventListener("drop", () => {
            if (!state.draggingLayerId) return
            const from = state.elements.findIndex(e => e.id === state.draggingLayerId)
            const to = state.elements.findIndex(e => e.id === el.id)
            if (from === to) return
            const moved = state.elements.splice(from, 1)[0]
            state.elements.splice(to, 0, moved)
            redrawLayers()
            updateZIndices()
        })

        layer.appendChild(name)
        layer.appendChild(eye)
        layer.appendChild(lock)
        layersPanel.appendChild(layer)
    })

    highlightLayer()
}

function highlightLayer() {
    document.querySelectorAll(".layer-item").forEach(layer => {
        layer.style.background =
            state.selectedIds.includes(layer.dataset.id) ? "#1f1f1f" : "transparent"
    })
}

// text dock button

textDockBtn.addEventListener("click", () => {
    const x = canvas.clientWidth / 2 - 50
    const y = canvas.clientHeight / 2 - 10
    const newText = createText(x, y)
    newText.dom.textContent = "Text"
    selectElement(newText.id)
    state.tool = "move"
})

// image dock button

imageDockBtn.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.addEventListener("change", e => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = event => {
            const img = new Image()
            img.onload = () => {

                const maxWidth = 300
                const maxHeight = 300
                let width = img.width
                let height = img.height


                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width = width * ratio
                    height = height * ratio
                }


                const x = (canvas.clientWidth / 2) - (width / 2)
                const y = (canvas.clientHeight / 2) - (height / 2)

                const newImage = createImage(x, y, event.target.result, width, height)
                selectElement(newImage.id)
                state.tool = "move"
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    })

    input.click()
})

// keyboard shortcuts

window.addEventListener("keydown", e => {

    const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) ||
        e.target.isContentEditable;

    if (isInput) return;

    const key = e.key.toLowerCase();
    const selected = getSelectedElements().filter(el => !el.locked);

    if (e.key === "Delete" || e.key === "Backspace") {
        if (selected.length > 0) {
            e.preventDefault();
            window.deleteSelectedElements();

            selected.forEach(el => {
                if (el.dom && canvas.contains(el.dom)) {
                    canvas.removeChild(el.dom);
                }
                state.elements = state.elements.filter(e => e.id !== el.id);
            });

            state.selectedIds = [];
            removeTransformBox();
            redrawLayers();
            updateZIndices();


            if (typeof saveState === "function") saveState();
        }
        return;
    }

    if (key === "v" || key === "m") setTool("move");
    if (key === "h") setTool("hand");
    if (key === "f") setTool("frame");

    if (key === "r") {
        state.activeShape = "rectangle";
        setTool("shape");
        shapeDockBtn.innerHTML = `Rectangle <kbd>R</kbd>`;
    }
    if (key === "o" || key === "e") {
        state.activeShape = "ellipse";
        setTool("shape");
        shapeDockBtn.innerHTML = `Ellipse <kbd>E</kbd>`;
    }
    if (key === "l") {
        state.activeShape = "line";
        setTool("shape");
        shapeDockBtn.innerHTML = `Line <kbd>L</kbd>`;
    }
    if (key === "p") {
        state.activeShape = "polygon";
        setTool("shape");
        shapeDockBtn.innerHTML = `Polygon <kbd>P</kbd>`;
    }
    if (key === "s") {
        state.activeShape = "star";
        setTool("shape");
        shapeDockBtn.innerHTML = `Star <kbd>S</kbd>`;
    }

    if (selected.length > 0) {
        let dx = 0, dy = 0;
        const step = e.shiftKey ? 10 : 1;

        if (e.key === "ArrowUp") dy = -step;
        else if (e.key === "ArrowDown") dy = step;
        else if (e.key === "ArrowLeft") dx = -step;
        else if (e.key === "ArrowRight") dx = step;

        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            selected.forEach(el => {
                el.x += dx;
                el.y += dy;
                Object.assign(el.dom.style, { left: `${el.x}px`, top: `${el.y}px` });
            });
            updateTransformBox();
        }
    }
});

// debug

window.state = state
setTool("move");