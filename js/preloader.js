"use strict";

const preloader = document.getElementById("preloader");

window.addEventListener("load", () => {
    window.setTimeout(() => {
        if (preloader) {
            preloader.classList.add("oculto");
        }
        document.body.classList.remove("preloading");
    }, 1450);
});
