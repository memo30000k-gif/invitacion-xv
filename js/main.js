"use strict";

/* Archivo principal. Aquí conectaremos después:
   - música
   - cuenta regresiva
   - álbum colaborativo
   - mesa de regalos
   - preferencias de bebidas
   - confirmación y selección de asientos
*/

const musicaInvitacion = document.getElementById("musicaInvitacion");
const controlMusica = document.getElementById("controlMusica");

function actualizarControlMusica(reproduciendo) {
    if (!controlMusica) return;
    controlMusica.classList.toggle("reproduciendo", reproduciendo);
    controlMusica.setAttribute("aria-pressed", String(reproduciendo));
    controlMusica.setAttribute(
        "aria-label",
        reproduciendo ? "Pausar música" : "Reproducir música"
    );
}

async function alternarMusica() {
    if (!musicaInvitacion) return;

    if (musicaInvitacion.paused) {
        try {
            await musicaInvitacion.play();
            actualizarControlMusica(true);
        } catch {
            actualizarControlMusica(false);
        }
    } else {
        musicaInvitacion.pause();
        actualizarControlMusica(false);
    }
}

controlMusica?.addEventListener("click", alternarMusica);
musicaInvitacion?.addEventListener("pause", () => actualizarControlMusica(false));
musicaInvitacion?.addEventListener("play", () => actualizarControlMusica(true));
