(function () {
    const exportDiv = document.querySelector(".export");
    if (!exportDiv) return;

    const pngBtn = exportDiv.querySelector("button:nth-of-type(1)");
    const htmlBtn = exportDiv.querySelector("button:nth-of-type(2)");
    const canvas = document.getElementById("canvas");

    pngBtn.addEventListener("click", () => {
        const w = canvas.scrollWidth;
        const h = canvas.scrollHeight;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext("2d");

        Array.from(canvas.children).forEach(el => {
            const style = getComputedStyle(el);
            const left = parseFloat(style.left);
            const top = parseFloat(style.top);
            const width = parseFloat(style.width);
            const height = parseFloat(style.height);

            if (el.tagName === "DIV") {
                if (el.classList.contains("canvas-text")) {
                    ctx.fillStyle = style.color;
                    ctx.font = style.fontSize + " sans-serif";
                    ctx.fillText(el.textContent, left, top + height * 0.8);
                } else if (el.classList.contains("canvas-image")) {
                    const img = el.querySelector("img");
                    if (img) ctx.drawImage(img, left, top, width, height);
                } else {
                    ctx.fillStyle = style.backgroundColor || "#D9D9D9";
                    ctx.fillRect(left, top, width, height);
                }
            }
        });

        const link = document.createElement("a");
        link.download = "canvas.png";
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
    });

    htmlBtn.addEventListener("click", () => {
        const clone = canvas.cloneNode(true);
        clone.removeAttribute("style");
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Exported Canvas</title>
<style>
  body { margin:0; padding:0; }
  #canvas { position:relative; width:${canvas.scrollWidth}px; height:${canvas.scrollHeight}px; }
  #canvas > * { position:absolute; }
</style>
</head>
<body>
<div id="canvas">${clone.innerHTML}</div>
</body>
</html>
    `;
        const blob = new Blob([html], { type: "text/html" });
        const link = document.createElement("a");
        link.download = "canvas.html";
        link.href = URL.createObjectURL(blob);
        link.click();
    });
})();
