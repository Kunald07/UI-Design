const menu = document.querySelector(".menu");
const navCard = document.querySelector("#navCard");
const svg = document.querySelector("#rotatesvg");


// toggle svg icon on click
menu.addEventListener("click", (e) => {
    e.stopPropagation();
    navCard.classList.toggle("show");

    // toggle rotation
    if (svg.style.rotate === '90deg') {
        svg.style.rotate = '0deg';
    } else {
        svg.style.rotate = '90deg';
    }
});

// close when clicking outside

document.addEventListener("click", (e) => {
    if (!navCard.contains(e.target) && !menu.contains(e.target)) {
        navCard.classList.remove("show");
        svg.style.rotate = "0deg";
    }
});

// active links

const current = window.location.pathname;

document.querySelectorAll("nav a").forEach(link => {
    if (link.pathname === current) {
        link.classList.add("active-link");
    }
});