(function () {
    // 1. Export Logic (inside App)
    const exportBtn = document.getElementById("exportJSON");
    if (exportBtn) {
        exportBtn.onclick = () => {
            const params = new URLSearchParams(window.location.search);
            const fileId = params.get("fileId");
            const data = localStorage.getItem(`rachna_data_${fileId}`);
            if (!data) return;

            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${document.querySelector(".filename").textContent.trim() || 'design'}.json`;
            a.click();
        };
    }

    // 2. Import Logic (inside Dashboard)
    const dashboardHeader = document.querySelector(".dashboard-header");
    if (dashboardHeader && window.location.pathname.includes("dashboard")) {
        const importBtn = document.createElement("button");
        importBtn.className = "btn-primary";
        importBtn.style.marginLeft = "10px";
        importBtn.style.background = "#333";
        importBtn.textContent = "Import JSON";
        dashboardHeader.appendChild(importBtn);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);

        importBtn.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = JSON.parse(event.target.result);
                const newId = "project_" + Date.now();

                // Save content
                localStorage.setItem(`rachna_data_${newId}`, JSON.stringify(content));

                // Add to Index
                const index = JSON.parse(localStorage.getItem("rachna_projects_list") || "[]");
                index.unshift({
                    id: newId,
                    name: content.filename || "Imported Design",
                    updatedAt: Date.now()
                });
                localStorage.setItem("rachna_projects_list", JSON.stringify(index));

                if (window.render) window.render(); // Refresh dashboard
            };
            reader.readAsText(file);
        };
    }
})();