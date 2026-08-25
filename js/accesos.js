const SUPABASE_URL = "https://ewvmwgsgwpkwycaqdgir.supabase.co";
const SUPABASE_KEY = "sb_publishable_BA4Sts6N3tHG__HL4G02jw_dyiIt8kL";
const rpc = async (funcion, datos) => {
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error("No fue posible comunicarnos con el sistema.");
    return respuesta.json();
};

const login = document.getElementById("accesoLogin");
const accesoEstado = document.getElementById("accesoEstado");
const panel = document.getElementById("panelFamilia");
const registro = document.getElementById("registroInvitados");
const lista = document.getElementById("listaInvitados");
const registroEstado = document.getElementById("registroEstado");
const agregar = document.getElementById("agregarInvitado");
const boletosPanel = document.getElementById("boletosPanel");
const boletosImprimibles = document.getElementById("boletosImprimibles");
let sesionFamilia = null;
let limiteFamilia = 0;
let promesaQRCode = null;

function cargarQRCode() {
    if (window.QRCode) return Promise.resolve();
    if (promesaQRCode) return promesaQRCode;
    promesaQRCode = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("No fue posible preparar los códigos QR."));
        document.head.appendChild(script);
    });
    return promesaQRCode;
}

async function mostrarBoletos(familia, invitados) {
    boletosImprimibles.innerHTML = "";
    if (!invitados.length) { boletosPanel.hidden = true; return; }
    try { await cargarQRCode(); } catch (error) { registroEstado.textContent = error.message; }
    invitados.forEach((invitado, indice) => {
        const boleto = document.createElement("article");
        boleto.className = "boleto-xv";
        boleto.innerHTML = `<div class="boleto-marco"></div><div class="boleto-principal"><div class="boleto-corona">♔</div><div class="boleto-xv-marca">XV</div><div class="boleto-centro"><p class="boleto-kicker">Mis quince años</p><h3>Lizzeth</h3><div class="boleto-linea"><span>♥</span></div><p class="boleto-nombre"></p><p class="boleto-familia"></p><div class="boleto-datos"><span><b>Fecha</b>17 Octubre 2026</span><span><b>Hora</b>7:30 p. m.</span><span><b>Lugar</b>Palacio Lunara</span></div></div></div><aside class="boleto-talon"><p>BOLETO<small>DE ACCESO</small></p><div class="boleto-qr" id="qr-${indice}"></div><p class="boleto-folio"></p><span>Acceso individual</span></aside>`;
        boleto.querySelector(".boleto-nombre").textContent = invitado.nombre;
        boleto.querySelector(".boleto-familia").textContent = familia;
        boleto.querySelector(".boleto-folio").textContent = invitado.folio;
        boletosImprimibles.appendChild(boleto);
        if (window.QRCode) new QRCode(boleto.querySelector(".boleto-qr"), { text: invitado.folio, width: 116, height: 116, colorDark: "#6f4b53", colorLight: "#fffaf5", correctLevel: QRCode.CorrectLevel.H });
    });
    boletosPanel.hidden = false;
}

function campoInvitado(invitado = {}) {
    const numero = lista.children.length + 1;
    const bloque = document.createElement("article");
    bloque.className = "invitado-campo";
    bloque.dataset.id = invitado.id || "";
    bloque.innerHTML = `<div class="invitado-encabezado"><strong>Acceso ${numero}</strong><button type="button" class="quitar-invitado" aria-label="Quitar asistente">×</button></div>
        <label>Nombre completo<input class="invitado-nombre" maxlength="120" value="${(invitado.nombre || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" required></label>
        <div class="invitado-opciones"><label>Invitado<select class="invitado-tipo"><option value="adulto" ${invitado.tipo !== "menor" ? "selected" : ""}>Adulto</option><option value="menor" ${invitado.tipo === "menor" ? "selected" : ""}>Menor</option></select></label>
        <label class="bebida-label">Bebida<select class="invitado-bebida"><option value="">Elegir después</option>${["vodka","whisky","ron","tequila","brandy","sin_alcohol"].map(v=>`<option value="${v}" ${invitado.bebida===v?"selected":""}>${v==="sin_alcohol"?"Sin alcohol":v[0].toUpperCase()+v.slice(1)}</option>`).join("")}</select></label></div>`;
    lista.appendChild(bloque);
    const tipo = bloque.querySelector(".invitado-tipo");
    const bebidaLabel = bloque.querySelector(".bebida-label");
    const ajustar = () => bebidaLabel.hidden = tipo.value === "menor";
    tipo.addEventListener("change", ajustar); ajustar();
    bloque.querySelector(".quitar-invitado").addEventListener("click", () => { bloque.remove(); renumerar(); });
}
function renumerar() { [...lista.children].forEach((el,i)=>el.querySelector(".invitado-encabezado strong").textContent=`Acceso ${i+1}`); }
async function cargarInvitacion(token) {
    const datos = await rpc("consultar_invitacion", { p_token: token });
    if (!datos.ok) throw new Error(datos.mensaje);
    sesionFamilia = token; limiteFamilia = datos.boletos_maximos;
    sessionStorage.setItem("xv_sesion_familia", token);
    document.getElementById("nombreFamilia").textContent = datos.familia;
    document.getElementById("limiteBoletos").textContent = datos.boletos_maximos;
    lista.innerHTML = ""; (datos.invitados || []).forEach(campoInvitado);
    mostrarBoletos(datos.familia, datos.invitados || []);
    panel.hidden = false; login.hidden = true;
    if ((datos.invitados || []).length) registro.hidden = false;
}
login?.addEventListener("submit", async e => {
    e.preventDefault(); accesoEstado.textContent = "Verificando invitación…";
    try {
        const datos = await rpc("iniciar_sesion_familia", { p_codigo: e.target.codigo.value.trim().toUpperCase(), p_pin: e.target.pin.value });
        if (!datos.ok) throw new Error(datos.mensaje);
        await cargarInvitacion(datos.token); accesoEstado.textContent = "";
    } catch (error) { accesoEstado.textContent = error.message; }
});
document.querySelectorAll("[data-asistencia]").forEach(btn => btn.addEventListener("click", async () => {
    if (btn.dataset.asistencia === "no") {
        registroEstado.textContent = "Guardando tu respuesta…";
        try { const d=await rpc("guardar_confirmacion",{p_token:sesionFamilia,p_asistira:false,p_invitados:[]}); registro.hidden=true; registroEstado.textContent=d.mensaje; } catch(e){ registroEstado.textContent=e.message; }
    } else { registro.hidden=false; if (!lista.children.length) campoInvitado(); registro.scrollIntoView({behavior:"smooth",block:"center"}); }
}));
agregar?.addEventListener("click", () => { if (lista.children.length < limiteFamilia) campoInvitado(); else registroEstado.textContent=`Esta invitación incluye ${limiteFamilia} accesos.`; });
registro?.addEventListener("submit", async e => {
    e.preventDefault(); registroEstado.textContent="Guardando confirmación…";
    const invitados=[...lista.children].map(el=>({id:el.dataset.id||undefined,nombre:el.querySelector(".invitado-nombre").value.trim(),tipo:el.querySelector(".invitado-tipo").value,bebida:el.querySelector(".invitado-bebida").value}));
    try { const d=await rpc("guardar_confirmacion",{p_token:sesionFamilia,p_asistira:true,p_invitados:invitados}); if(!d.ok)throw new Error(d.mensaje); registroEstado.textContent=`${d.mensaje} Registraste ${d.boletos_registrados} acceso(s).`; await cargarInvitacion(sesionFamilia); } catch(error){registroEstado.textContent=error.message;}
});
document.getElementById("irAccesos")?.addEventListener("click",()=>document.getElementById("accesos")?.scrollIntoView({behavior:"smooth",block:"start"}));
const sesionGuardada=sessionStorage.getItem("xv_sesion_familia"); if(sesionGuardada)cargarInvitacion(sesionGuardada).catch(()=>sessionStorage.removeItem("xv_sesion_familia"));
document.getElementById("descargarBoletos")?.addEventListener("click", () => {
    const copias = [...boletosImprimibles.querySelectorAll(".boleto-xv")].map(boleto => {
        const copia = boleto.cloneNode(true);
        const canvasOriginal = boleto.querySelector(".boleto-qr canvas");
        const qrCopia = copia.querySelector(".boleto-qr");
        if (canvasOriginal && qrCopia) qrCopia.innerHTML = `<img src="${canvasOriginal.toDataURL("image/png")}" alt="Código QR">`;
        return copia.outerHTML;
    }).join("");
    const ventana = window.open("", "_blank");
    if (!ventana) { registroEstado.textContent = "Permite las ventanas emergentes para descargar tus boletos."; return; }
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Boletos XV de Lizzeth</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Great+Vibes&family=Montserrat:wght@400;500&display=swap" rel="stylesheet"><style>
      *{box-sizing:border-box}html,body{margin:0;background:#fff;color:#674d67}.boleto-xv{position:relative;display:grid;grid-template-columns:1fr 43mm;overflow:hidden;width:185mm;height:82mm;margin:0 auto 5mm;border:1px solid #bd9147;border-radius:4mm;background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.92),transparent 45%),linear-gradient(135deg,#f9edf7,#e9d4eb 56%,#d9bde1);break-inside:avoid;page-break-inside:avoid}.boleto-xv:nth-child(3n){break-after:page;page-break-after:always}.boleto-xv:last-child{break-after:auto;page-break-after:auto}.boleto-xv:before,.boleto-xv:after{content:'';position:absolute;z-index:5;right:39mm;width:8mm;height:8mm;border-radius:50%;background:#fff}.boleto-xv:before{top:-4mm}.boleto-xv:after{bottom:-4mm}.boleto-marco{position:absolute;z-index:1;inset:3mm;border:1px solid rgba(182,133,56,.65);border-radius:2mm;pointer-events:none}.boleto-principal{position:relative;display:grid;grid-template-columns:42mm 1fr;align-items:center;padding:7mm 6mm 7mm 8mm}.boleto-principal:after{content:'';position:absolute;right:0;top:4mm;bottom:4mm;border-right:1px dashed rgba(112,78,113,.55)}.boleto-corona{position:absolute;left:10mm;top:6mm;color:#bb8732;font-size:13mm;line-height:1}.boleto-xv-marca{position:relative;color:#ac7933;text-shadow:1px 1px #fff,-1px -1px #8f6027;font:600 30mm/1 'Cormorant Garamond',serif}.boleto-centro{text-align:center}.boleto-kicker{margin:0;font:500 4mm 'Montserrat',sans-serif;letter-spacing:.24em;text-transform:uppercase}.boleto-xv h3{margin:-1mm 0;color:#765476;font:400 14mm/1 'Great Vibes',cursive}.boleto-linea{display:flex;align-items:center;gap:2mm;width:65%;margin:1mm auto;color:#bc8b39}.boleto-linea:before,.boleto-linea:after{content:'';flex:1;height:1px;background:#c9a35f}.boleto-nombre{margin:1mm 0 0;color:#744e69;font:600 5.4mm 'Cormorant Garamond',serif}.boleto-familia{margin:0 0 2mm;font:2mm 'Montserrat',sans-serif;letter-spacing:.12em;text-transform:uppercase}.boleto-datos{display:grid;grid-template-columns:repeat(3,1fr);font:2.7mm 'Cormorant Garamond',serif}.boleto-datos span+span{border-left:1px solid rgba(184,135,58,.45)}.boleto-datos b{display:block;margin-bottom:.4mm;font:500 1.8mm 'Montserrat',sans-serif;letter-spacing:.12em;text-transform:uppercase}.boleto-talon{position:relative;display:grid;place-items:center;align-content:center;padding:6mm 4mm;text-align:center}.boleto-talon>p:first-child{margin:0 0 2mm;font:600 6mm/1 'Cormorant Garamond',serif}.boleto-talon small{display:block;font-size:3mm;letter-spacing:.15em}.boleto-qr{width:25mm;height:25mm;padding:1mm;border:1px solid #bd9147;background:#fffaf5}.boleto-qr img{display:block;width:23mm;height:23mm}.boleto-folio{margin:1.4mm 0 1mm;font:600 1.9mm 'Montserrat',sans-serif;letter-spacing:.04em}.boleto-talon>span{font:500 1.8mm 'Montserrat',sans-serif;letter-spacing:.13em;text-transform:uppercase}@page{size:A4 portrait;margin:9mm 12mm}@media screen{body{padding:12mm 0}.boleto-xv{box-shadow:0 9px 26px rgba(80,48,80,.16)}}@media print{body{padding:0}.boleto-xv{box-shadow:none}}
    </style></head><body>${copias}<script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script></body></html>`);
    ventana.document.close();
});
document.getElementById("irHospedaje")?.addEventListener("click", () => document.getElementById("hospedaje")?.scrollIntoView({ behavior: "smooth", block: "start" }));
document.getElementById("irRecuerdos")?.addEventListener("click", () => document.getElementById("recuerdos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
document.getElementById("irCierre")?.addEventListener("click", () => document.getElementById("cierre")?.scrollIntoView({ behavior: "smooth", block: "start" }));
document.getElementById("volverInicio")?.addEventListener("click", () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));
document.getElementById("volverBoletos")?.addEventListener("click", () => {
    const destino = boletosPanel && !boletosPanel.hidden ? boletosPanel : document.getElementById("accesos");
    destino?.scrollIntoView({ behavior: "smooth", block: "center" });
});
