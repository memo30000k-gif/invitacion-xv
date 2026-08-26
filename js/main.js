"use strict";

/* El módulo de confirmaciones no compite con la carga de la portada.
   Se prepara en segundo plano cuando el navegador queda libre. */
function cargarModuloAccesos() {
    if (document.querySelector('script[data-modulo="accesos"]')) return;
    const script = document.createElement("script");
    script.src = "js/accesos.js?v=11";
    script.defer = true;
    script.dataset.modulo = "accesos";
    document.body.appendChild(script);
}

const seccionAccesos = document.getElementById("accesos");
if (seccionAccesos && "IntersectionObserver" in window) {
    const observadorAccesos = new IntersectionObserver((entradas, observador) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        cargarModuloAccesos();
        observador.disconnect();
    }, { rootMargin: "1200px 0px" });
    observadorAccesos.observe(seccionAccesos);
} else {
    window.addEventListener("load", cargarModuloAccesos, { once: true });
}

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

function prepararMusica() {
    if (!musicaInvitacion || musicaInvitacion.src) return;
    const origen = musicaInvitacion.dataset.src;
    if (!origen) return;
    musicaInvitacion.src = origen;
    musicaInvitacion.load();
}

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
            prepararMusica();
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

window.iniciarMusicaInvitacion = async function () {
    if (!musicaInvitacion || !musicaInvitacion.paused) return;
    musicaInvitacion.volume = 0.72;
    try {
        prepararMusica();
        await musicaInvitacion.play();
        actualizarControlMusica(true);
    } catch {
        actualizarControlMusica(false);
    }
};

const seccionCierre = document.getElementById("cierre");
if (seccionCierre && musicaInvitacion && "IntersectionObserver" in window) {
    const observadorCierre = new IntersectionObserver((entradas) => {
        const visible = entradas.some((entrada) => entrada.isIntersecting);
        seccionCierre.classList.toggle("cierre-visible", visible);
        if (!musicaInvitacion.paused) musicaInvitacion.volume = visible ? 0.34 : 0.72;
    }, { threshold: 0.35 });
    observadorCierre.observe(seccionCierre);
}

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
const botonIrMensaje = document.getElementById("irMensaje");
const seccionMensaje = document.getElementById("mensajeEspecial");
const botonIrFamilia = document.getElementById("irFamilia");
const seccionFamilia = document.getElementById("familia");
const botonIrEvento = document.getElementById("irEvento");
const seccionEvento = document.getElementById("detallesEvento");
const botonIrDressCode = document.getElementById("irDressCode");
const seccionDressCode = document.getElementById("dressCode");
const botonIrRegalos = document.getElementById("irRegalos");
const seccionRegalos = document.getElementById("mesaRegalos");
const botonCopiarMesa = document.getElementById("copiarMesa");
const copiarEstado = document.getElementById("copiarEstado");

/* Las animaciones también se activan al llegar deslizando con el dedo.
   Los botones conservan sus transiciones cinematográficas, pero ya no son
   la única forma de descubrir la siguiente sección. */
const seccionesRevelables = [
    [seccionMensaje, "mensaje-visible", seccionCuenta, "tiempo-detenido"],
    [seccionFamilia, "familia-visible", seccionMensaje, "transicion-familia"],
    [seccionEvento, "evento-visible", seccionFamilia, "transicion-evento"],
    [seccionDressCode, "dress-visible", seccionEvento, "transicion-dress"],
    [seccionRegalos, "regalos-visible", seccionDressCode, "transicion-regalos"]
];

if ("IntersectionObserver" in window) {
    const observadorSecciones = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            const claseVisible = entrada.target.dataset.claseVisible;
            if (claseVisible) entrada.target.classList.add(claseVisible);
            const seccionAnterior = entrada.target._seccionAnterior;
            const claseTransicion = entrada.target.dataset.claseTransicion;
            if (seccionAnterior && claseTransicion) {
                seccionAnterior.classList.add(claseTransicion);
                window.setTimeout(() => seccionAnterior.classList.remove(claseTransicion), 1000);
            }
            observadorSecciones.unobserve(entrada.target);
        });
    }, { threshold: 0.08, rootMargin: "0px" });

    seccionesRevelables.forEach(([seccion, claseVisible, seccionAnterior, claseTransicion]) => {
        if (!seccion) return;
        seccion.dataset.claseVisible = claseVisible;
        seccion._seccionAnterior = seccionAnterior;
        seccion.dataset.claseTransicion = claseTransicion;
        observadorSecciones.observe(seccion);
    });
} else {
    seccionesRevelables.forEach(([seccion, claseVisible]) => seccion?.classList.add(claseVisible));
}

botonIrCuenta?.addEventListener("click", () => {
    seccionCuenta?.scrollIntoView({ behavior: "smooth", block: "start" });
});

botonIrMensaje?.addEventListener("click", () => {
    if (!seccionCuenta || !seccionMensaje) return;
    seccionCuenta.classList.add("tiempo-detenido");
    seccionMensaje.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => seccionCuenta.classList.remove("tiempo-detenido"), 900);
});

botonIrFamilia?.addEventListener("click", () => {
    if (!seccionMensaje || !seccionFamilia) return;
    seccionMensaje.classList.add("transicion-familia");
    seccionFamilia.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => seccionMensaje.classList.remove("transicion-familia"), 900);
});

botonIrEvento?.addEventListener("click", () => {
    if (!seccionFamilia || !seccionEvento) return;
    seccionFamilia.classList.add("transicion-evento");
    seccionEvento.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => seccionFamilia.classList.remove("transicion-evento"), 900);
});

botonIrDressCode?.addEventListener("click", () => {
    if (!seccionEvento || !seccionDressCode) return;
    seccionEvento.classList.add("transicion-dress");
    seccionDressCode.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => seccionEvento.classList.remove("transicion-dress"), 900);
});

botonIrRegalos?.addEventListener("click", () => {
    if (!seccionDressCode || !seccionRegalos) return;
    seccionDressCode.classList.add("transicion-regalos");
    seccionRegalos.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => seccionDressCode.classList.remove("transicion-regalos"), 900);
});

botonCopiarMesa?.addEventListener("click", async () => {
    const numero = botonCopiarMesa.dataset.numero || "60019073";
    try {
        await navigator.clipboard.writeText(numero);
        botonCopiarMesa.classList.add("copiado");
        botonCopiarMesa.querySelector("span").textContent = "Número copiado";
        if (copiarEstado) copiarEstado.textContent = "El número 60019073 se copió correctamente.";
    } catch {
        if (copiarEstado) copiarEstado.textContent = `Número de mesa: ${numero}`;
    }
    window.setTimeout(() => {
        botonCopiarMesa.classList.remove("copiado");
        botonCopiarMesa.querySelector("span").textContent = "Copiar número";
    }, 2400);
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

if (seccionRegalos && "IntersectionObserver" in window) {
    const observadorRegalos = new IntersectionObserver((entradas, observador) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
            seccionRegalos.classList.add("regalos-visible");
            observador.disconnect();
        }
    }, { threshold: 0.24 });
    observadorRegalos.observe(seccionRegalos);
} else {
    seccionRegalos?.classList.add("regalos-visible");
}
