"use strict";

const preloader = document.getElementById("preloader");

function ocultarPreloader() {
    if (preloader?.classList.contains("oculto")) return;
    preloader?.classList.add("oculto");
    document.body.classList.remove("preloading");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(ocultarPreloader, 320), { once: true });
} else {
    window.setTimeout(ocultarPreloader, 120);
}

window.setTimeout(ocultarPreloader, 1800);
