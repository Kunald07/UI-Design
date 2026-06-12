const INDEX_KEY = "rachna_projects_list";
const grid = document.getElementById("projectGrid");

function getProjects() {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
}

function saveProjects(projects) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
}

function createNewProject() {
    const id = "project_" + Date.now();
    const projects = getProjects();

    const newProject = {
        id: id,
        name: "Untitled Design",
        updatedAt: Date.now()
    };

    projects.unshift(newProject);
    saveProjects(projects);
    window.location.href = `app.html?fileId=${id}`;
}

function deleteProject(id, e) {
    e.stopPropagation();
    if (!confirm("Delete this design?")) return;

    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    saveProjects(projects);

    localStorage.removeItem(`rachna_data_${id}`);
    render();
}

function render() {
    const projects = getProjects();
    grid.innerHTML = "";

    const createCard = document.createElement("div");
    createCard.className = "project-card create-card";
    createCard.innerHTML = `
        <div class="plus-icon">+</div>
        <div style="margin-top: 10px; color: #666; font-weight: 500;">New Design</div>
    `;
    createCard.onclick = createNewProject;
    grid.appendChild(createCard);

    projects.forEach(p => {
        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
            <div class="delete-btn" title="Delete">✕</div>
            <div class="thumbnail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                </svg>
            </div>
            <div class="card-info">
                <h3 contenteditable="true" spellcheck="false" class="project-title">${p.name}</h3>
                <p>Edited ${new Date(p.updatedAt).toLocaleDateString()}</p>
            </div>
        `;

        const titleEl = card.querySelector(".project-title");

        titleEl.addEventListener("click", (e) => e.stopPropagation());


        titleEl.addEventListener("blur", () => {
            const newName = titleEl.textContent.trim() || "Untitled Design";
            updateProjectName(p.id, newName);
        });


        titleEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                titleEl.blur();
            }
        });


        card.onclick = () => window.location.href = `app.html?fileId=${p.id}`;

        card.querySelector(".delete-btn").onclick = (e) => {
            e.stopPropagation();
            deleteProject(p.id, e);
        };

        grid.appendChild(card);
    });
}

function updateProjectName(id, newName) {
    let projects = getProjects();
    const pIdx = projects.findIndex(p => p.id === id);

    if (pIdx !== -1) {
        projects[pIdx].name = newName;
        projects[pIdx].updatedAt = Date.now();
        saveProjects(projects);


        const savedContent = localStorage.getItem(`rachna_data_${id}`);
        if (savedContent) {
            const data = JSON.parse(savedContent);
            data.filename = newName;
            localStorage.setItem(`rachna_data_${id}`, JSON.stringify(data));
        }
    }
}

render();