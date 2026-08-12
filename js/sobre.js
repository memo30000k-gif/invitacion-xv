"use strict";

const escena = document.getElementById("escena");
const sobre = document.getElementById("sobre");
const tarjeta = document.getElementById("tarjeta");
const invitacion = document.getElementById("invitacion");
const portada = document.getElementById("portada");

let animacionIniciada = false;
let tarjetaDisponible = false;
let transicionIniciada = false;

function abrirSobre() {
    if (animacionIniciada || !escena || !sobre || !tarjeta) return;

    animacionIniciada = true;
    sobre.setAttribute("aria-expanded", "true");
    escena.classList.add("quitando-sello");

    window.setTimeout(() => {
        escena.classList.add("abriendo");
    }, 350);

    window.setTimeout(() => {
        escena.classList.add("tarjeta-visible");
        tarjetaDisponible = true;
        tarjeta.setAttribute("tabindex", "0");
    }, 1150);
}

function continuarInvitacion(evento) {
    evento.stopPropagation();
    if (!tarjetaDisponible || !invitacion || transicionIniciada) return;

    transicionIniciada = true;
    tarjeta.setAttribute("aria-disabled", "true");
    portada?.classList.add("transicionando");
    invitacion.classList.add("preparando-entrada");

    window.setTimeout(() => {
        invitacion.scrollIntoView({ behavior: "smooth", block: "start" });
        invitacion.classList.add("entrada-activa");
    }, 620);

    window.setTimeout(() => {
        invitacion.classList.remove("preparando-entrada");
        portada?.classList.remove("transicionando");
        tarjeta.removeAttribute("aria-disabled");
    }, 1550);
}

if (sobre) {
    sobre.addEventListener("click", abrirSobre);
    sobre.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirSobre();
        }
    });
}

if (tarjeta) {
    tarjeta.addEventListener("click", continuarInvitacion);
    tarjeta.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            continuarInvitacion(evento);
        }
    });
}
