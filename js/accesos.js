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
let sesionFamilia = null;
let limiteFamilia = 0;

function campoInvitado(invitado = {}) {
    const numero = lista.children.length + 1;
    const bloque = document.createElement("article");
    bloque.className = "invitado-campo";
    bloque.dataset.id = invitado.id || "";
    bloque.innerHTML = `<div class="invitado-encabezado"><strong>Acceso ${numero}</strong><button type="button" class="quitar-invitado" aria-label="Quitar asistente">×</button></div>
        <label>Nombre completo<input class="invitado-nombre" maxlength="120" value="${(invitado.nombre || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" required></label>
        <div class="invitado-opciones"><label>Invitado<select class="invitado-tipo"><option value="adulto" ${invitado.tipo !== "menor" ? "selected" : ""}>Adulto</option><option value="menor" ${invitado.tipo === "menor" ? "selected" : ""}>Menor</option></select></label>
        <label class="bebida-label">Bebida<select class="invitado-bebida"><option value="">Elegir después</option>${["tequila","whisky","ron","vodka","cerveza","vino","sin_alcohol"].map(v=>`<option value="${v}" ${invitado.bebida===v?"selected":""}>${v==="sin_alcohol"?"Sin alcohol":v[0].toUpperCase()+v.slice(1)}</option>`).join("")}</select></label></div>`;
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
