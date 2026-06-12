
(function () {
    const trigger = document.querySelector(".dropdown-trigger");
    const dropdown = document.querySelector("#shape-dropdown");

    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    document.addEventListener("mousedown", (e) => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    const shapeBtns = dropdown.querySelectorAll("button");
    shapeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            dropdown.classList.remove("show");
        });
    });
})();