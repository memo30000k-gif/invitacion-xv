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

/* Cuenta regresiva: 17 de octubre de 2026, 7:30 p. m., hora de México. */
const fechaEvento = new Date("2026-10-17T19:30:00-06:00");
const inicioGranDia = new Date("2026-10-17T00:00:00-06:00");
const finGranDia = new Date("2026-10-18T00:00:00-06:00");
const camposCuenta = {
    dias: document.getElementById("dias"),
    horas: document.getElementById("horas"),
    minutos: document.getElementById("minutos"),
    segundos: document.getElementById("segundos")
};
const mensajeCuenta = document.getElementById("mensajeCuenta");
const mensajeGranDia = document.getElementById("mensajeGranDia");
const detalleGranDia = document.getElementById("detalleGranDia");
const seccionCuenta = document.getElementById("cuentaRegresiva");

function escribirTiempo(campo, valor, longitud = 2) {
    if (camposCuenta[campo]) {
        camposCuenta[campo].textContent = String(valor).padStart(longitud, "0");
    }
}

function actualizarCuentaRegresiva() {
    const ahora = Date.now();
    const simulacion = new URLSearchParams(window.location.search).get("simular");
    const esGranDiaReal = ahora >= inicioGranDia.getTime() && ahora < finGranDia.getTime();
    const eventoFinalizadoReal = ahora >= finGranDia.getTime();
    const esGranDia = simulacion === "gran-dia" || (simulacion !== "despues" && esGranDiaReal);
    const eventoFinalizado = simulacion === "despues" || (simulacion !== "gran-dia" && eventoFinalizadoReal);
    const diferencia = Math.max(0, fechaEvento.getTime() - ahora);
    const dias = Math.floor(diferencia / 86400000);
    const horas = Math.floor((diferencia % 86400000) / 3600000);
    const minutos = Math.floor((diferencia % 3600000) / 60000);
    const segundos = Math.floor((diferencia % 60000) / 1000);

    escribirTiempo("dias", dias, 3);
    escribirTiempo("horas", horas);
    escribirTiempo("minutos", minutos);
    escribirTiempo("segundos", segundos);

    seccionCuenta?.classList.toggle("es-gran-dia", esGranDia);
    seccionCuenta?.classList.toggle("evento-finalizado", eventoFinalizado);

    if (esGranDia) {
        if (mensajeGranDia) mensajeGranDia.textContent = "Hoy es el gran día";
        if (detalleGranDia) detalleGranDia.textContent = "Celebremos juntos los XV años de Lizzeth";
    } else if (eventoFinalizado) {
        if (mensajeGranDia) mensajeGranDia.textContent = "Gracias por ser parte de este sueño";
        if (detalleGranDia) detalleGranDia.textContent = "Con cariño, Lizzeth";
    }
}

actualizarCuentaRegresiva();
window.setInterval(actualizarCuentaRegresiva, 1000);

const botonIrCuenta = document.getElementById("irCuenta");

botonIrCuenta?.addEventListener("click", () => {
    seccionCuenta?.scrollIntoView({ behavior: "smooth", block: "start" });
});

if (seccionCuenta && "IntersectionObserver" in window) {
    const observadorCuenta = new IntersectionObserver((entradas, observador) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
            seccionCuenta.classList.add("cuenta-visible");
            observador.disconnect();
        }
    }, { threshold: 0.28 });
    observadorCuenta.observe(seccionCuenta);
} else {
    seccionCuenta?.classList.add("cuenta-visible");
}
