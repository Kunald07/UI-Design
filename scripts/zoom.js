(function () {
    const canvas = document.getElementById("canvas")
    if (!canvas) return

    let scale = 1
    const scaleStep = 0.1
    canvas.style.transformOrigin = "0 0"

    const sidebarRight = document.querySelector(".sidebar-right")
    if (!sidebarRight) return

    const zoomDiv = document.createElement("div")
    zoomDiv.id = "zoom-control"
    zoomDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem 0.75rem;
        background: #2c2c2c;
        border-bottom: 1px solid #353535;
        box-sizing: border-box;
    `;

    
    const title = document.createElement("h4");
    title.textContent = "Canvas View";
    title.style.cssText = `
        margin: 0; 
        color: #9ca3af; 
        font-size: 0.75rem; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.5px;
    `;
    zoomDiv.appendChild(title);

    
    const controlsRow = document.createElement("div");
    controlsRow.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";

    
    controlsRow.innerHTML = `
        <input type="text" id="zoom-input" value="100%" 
            style="flex: 1; width: 60px; height: 32px; text-align: center; background: #1e1e1e; border: 1px solid #353535; border-radius: 0.375rem; color: #fafafa; font-size: 0.75rem; outline: none;" />
        
        <select id="zoom-select" 
            style="flex: 1.5; height: 32px; background: #1e1e1e; border: 1px solid #353535; border-radius: 0.5rem; color: #fafafa; font-size: 0.75rem; cursor: pointer; outline: none; padding: 4px 8px;">
            <option value="">Zoom Options</option>
            <option value="in">Zoom In</option>
            <option value="out">Zoom Out</option>
            <option value="fit">Zoom to Fit</option>
            <option value="50">Zoom 50%</option>
            <option value="100">Zoom 100%</option>
            <option value="200">Zoom 200%</option>
        </select>
    `;

    zoomDiv.appendChild(controlsRow);
    sidebarRight.insertBefore(zoomDiv, sidebarRight.firstChild);

    const zoomInput = document.getElementById("zoom-input")
    const zoomSelect = document.getElementById("zoom-select")

    function setZoom(newScale) {
        if (newScale < 0.1) newScale = 0.1
        scale = newScale
        canvas.style.transform = `scale(${scale})`
        zoomInput.value = `${Math.round(scale * 100)}%`
    }

    function zoomIn() { setZoom(scale + scaleStep) }
    function zoomOut() { setZoom(scale - scaleStep) }
    function zoomToFit() {
        const container = canvas.parentElement
        const scaleX = container.clientWidth / canvas.scrollWidth
        const scaleY = container.clientHeight / canvas.scrollHeight
        setZoom(Math.min(scaleX, scaleY, 1))
    }

    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            if (e.deltaY < 0) zoomIn()
            else zoomOut()
        }
    }, { passive: false })

    zoomInput.addEventListener("change", () => {
        const val = parseInt(zoomInput.value.replace("%", ""))
        if (!isNaN(val)) setZoom(val / 100)
    })

    zoomSelect.addEventListener("change", () => {
        const val = zoomSelect.value
        if (val === "in") zoomIn()
        else if (val === "out") zoomOut()
        else if (val === "fit") zoomToFit()
        else if (val === "50") setZoom(0.5)
        else if (val === "100") setZoom(1)
        else if (val === "200") setZoom(2)
        zoomSelect.value = ""
    })

    window.RachnaZoom = { setZoom, zoomIn, zoomOut, zoomToFit }
})()