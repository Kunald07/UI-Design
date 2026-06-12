// spacePan.js
(function () {
    const canvas = document.getElementById("canvas")
    if (!canvas) return

    const pan = {
        x: 0,
        y: 0,
        spaceHeld: false,
        dragging: false,
        startX: 0,
        startY: 0
    }

    function panEnabled() {

        return pan.spaceHeld || (window.state && window.state.tool === "hand");
    }

    window.addEventListener("keydown", e => {
        const active = document.activeElement
        const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)

        if (e.code === "Space" && !typing) {
            e.preventDefault()
            pan.spaceHeld = true
            canvas.style.cursor = "grab"
        }
    })

    window.addEventListener("keyup", e => {
        const active = document.activeElement
        const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)

        if (e.code === "Space" && !typing) {
            pan.spaceHeld = false
            if (window.activeTool !== "hand") {
                canvas.style.cursor = "default"
            }
        }
    })

    canvas.addEventListener("mousedown", e => {
        if (!panEnabled()) return
        e.preventDefault()

        pan.dragging = true
        pan.startX = e.clientX
        pan.startY = e.clientY
        canvas.style.cursor = "grabbing"
    })

    window.addEventListener("mousemove", e => {
        if (!pan.dragging) return

        const dx = e.clientX - pan.startX
        const dy = e.clientY - pan.startY

        pan.x += dx
        pan.y += dy

        pan.startX = e.clientX
        pan.startY = e.clientY

        canvas.style.transform =
            `translate(${pan.x}px, ${pan.y}px)`
    })

    window.addEventListener("mouseup", () => {
        pan.dragging = false
        if (panEnabled()) {
            canvas.style.cursor = "grab"
        } else {
            canvas.style.cursor = "default"
        }
    })
})()
