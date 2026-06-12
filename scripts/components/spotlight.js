if (window.innerWidth >= 768) {
    const hero = document.querySelector(".hero");
    const spotlight = document.querySelector(".spotlight-bg");

    let t = 0;
    let hovering = false;

    hero.addEventListener("mouseenter", () => (hovering = true));
    hero.addEventListener("mouseleave", () => (hovering = false));

    hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        spotlight.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
        spotlight.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
    });

    function animate() {
        if (hovering) {
            t += 0.03;

            const size = 200 + Math.sin(t) * 15;
            spotlight.style.setProperty("--size", `${size}px`);
        }

        requestAnimationFrame(animate);
    }

    animate();
}