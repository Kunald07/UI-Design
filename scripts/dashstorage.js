

const INDEX_KEY = "rachna_projects_list";

const DashboardStorage = {

    getAll() {
        return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
    },

    saveIndex(list) {
        localStorage.setItem(INDEX_KEY, JSON.stringify(list));
    },

    createNew() {
        const id = "rachna_id_" + Date.now();
        const projects = this.getAll();
        const newProject = {
            id: id,
            name: "Untitled Design",
            lastModified: Date.now()
        };
        projects.unshift(newProject);
        this.saveIndex(projects);
        return id;
    },

    deleteProject(id) {
        let projects = this.getAll();
        projects = projects.filter(p => p.id !== id);
        this.saveIndex(projects);
        localStorage.removeItem(`rachna_data_${id}`);
    }
};


const grid = document.getElementById("projectGrid");
const createBtn = document.getElementById("createNewFile");

function renderProjects() {
    const projects = DashboardStorage.getAll();
    grid.innerHTML = "";

    projects.forEach(p => {
        const card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = `
            <span class="delete-icon" data-id="${p.id}">✕</span>
            <h3>${p.name}</h3>
            <p>Modified: ${new Date(p.lastModified).toLocaleDateString()}</p>
        `;

        card.addEventListener("click", (e) => {
            if (e.target.classList.contains('delete-icon')) {
                DashboardStorage.deleteProject(p.id);
                renderProjects();
            } else {

                window.location.href = `app.html?fileId=${p.id}`;
            }
        });

        grid.appendChild(card);
    });
}

createBtn.addEventListener("click", () => {
    const newId = DashboardStorage.createNew();
    window.location.href = `app.html?fileId=${newId}`;
});

renderProjects();