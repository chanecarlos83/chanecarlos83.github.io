const TELEFONO_WHATSAPP = "527442411773";
let categorySeleccionada = "todas";
let urlGlobalWhatsApp = "";

let INVENTARIO_GLOBAL = [];
let carrito = [];
let indicesCarrusel = {};

// Variables Carousel 800x300 píxeles
let currentCarouselIndex = 1;
let carouselInterval;
const PROMO_BANNERS = [
    { imagen: "imagenes_promo/papa_promo.jpg", titulo: "¡Especial de Papá!", desc: "Aprovecha hasta un 30% en electrónica seleccionada." },
    { imagen: "https://placehold.co/800x300/1e1b4b/e0e7ff?text=Envío+Garantizado", titulo: "Agenda con Anticipación", desc: "Revisa nuestro calendario de entregas de Lunes a Viernes." },
    { imagen: "https://placehold.co/800x300/031c30/e2f1ff?text=Nuevos+Ingresos", titulo: "Llegó la temporada de Graduaciones", desc: "Nuevas manualidades y detalles únicos disponibles." }
];

const EVENTOS_CONFIG = [
    { titulo: "👨 Día del Padre(Electronica)", fecha: "21 de Junio", descripcion: "¡Sorprende a papá! Descubre electrónica.", categoriaVinculada: "electronica", imagen: "imagenes_eventos/dia_del_padre.jpg" },
    { titulo: "👨 Día del Padre(Ropa)", fecha: "21 de Junio", descripcion: "¡Sorprende a papá! Descubre ropa.", categoriaVinculada: "ropa", imagen: "imagenes_eventos/dia_del_padre.jpg" },
    { titulo: " 🎓 Graduaciones(Manualidades)", fecha: "Mes de Julio", descripcion: "Termina una etapa llena de aprendizajes.", categoriaVinculada: "manualidades", imagen: "imagenes_eventos/graduaciones.jpg" },
    { titulo: " 🎓 Graduaciones(Ropa)", fecha: "Mes de Julio", descripcion: "Termina una etapa llena de aprendizajes.", categoriaVinculada: "ropa", imagen: "imagenes_eventos/graduaciones.jpg" }
];

window.addEventListener('load', () => {
    configurarTema();
    configuringCamposFecha();
    recuperarCarritoDeLocalStorage();
    inicializarHeroCarousel();
    inicializarBotónVolverArriba();

    const clienteGuardado = localStorage.getItem('nombre_cliente_dayh');
    if (clienteGuardado && document.getElementById('cliente')) {
        document.getElementById('cliente').value = clienteGuardado;
    }

    mostrarSkeletons();
    setTimeout(() => {
        cargarProductos();
        verificarCarritoGuardadoAlEntrar();
    }, 700); 
    
    renderizarEventos();
    setupEventListeners();
});

// MENSAJE DE CARRITO GUARDADO
function verificarCarritoGuardadoAlEntrar() {
    if (carrito && carrito.length > 0) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-carrito-guardado';
        notificacion.id = 'notif-carrito-guardado';
        notificacion.innerHTML = `
            <span>🛒 ¡Hola! Conservamos las <strong>${totalItems} pzs</strong> que dejaste en tu carrito anterior.</span>
            <button class="btn-cerrar-notif" onclick="document.getElementById('notif-carrito-guardado').remove()">✕</button>
        `;
        document.body.appendChild(notificacion);
        setTimeout(() => { const el = document.getElementById('notif-carrito-guardado'); if (el) el.remove(); }, 6000);
    }
}

// EFECTO DE CONFETI PROFESIONAL
function lanzarEfectoConfeti() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
    }
}

function mostrarSkeletons() {
    const contenedor = document.getElementById('lista-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        contenedor.innerHTML += `
        <div class="skeleton-card">
            <div class="skeleton-item skeleton-text-sm"></div>
            <div class="skeleton-item skeleton-img"></div>
            <div class="skeleton-item skeleton-text-md"></div>
            <div class="skeleton-item skeleton-text-sm" style="margin:0 auto;"></div>
            <div class="skeleton-item skeleton-text-lg"></div>
            <div class="skeleton-item skeleton-btn"></div>
        </div>`;
    }
}

function renderizarEventos() {
    const contenedor = document.getElementById('lista-eventos');
    const seccionEventos = document.getElementById('seccion-eventos');
    if (!contenedor || !seccionEventos) return;
    if (EVENTOS_CONFIG.length === 0) { seccionEventos.style.display = 'none'; return; }
    seccionEventos.style.display = 'block';
    contenedor.innerHTML = '';

    EVENTOS_CONFIG.forEach(evento => {
        const rutaImagen = evento.imagen ? evento.imagen : 'https://placehold.co/300x150?text=Evento';
        contenedor.innerHTML += `
        <div class="producto-card card-evento-interactiva" style="cursor: pointer;" onclick="filtrarPorEvento('${evento.categoriaVinculada}')">
            <div>
                <div class="producto-codigo">EVENTO ESPECIAL</div>
                <div class="img-wrapper" style="height: 115px;">
                    <img src="${rutaImagen}" alt="${evento.titulo}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/300x150?text=${encodeURIComponent(evento.titulo)}'">
                </div>
                <h3 style="font-size: 14px; margin: 8px 0 3px 0;">${evento.titulo}</h3>
                <div style="font-size: 11px; color: var(--primary-light); font-weight: bold; margin-bottom: 5px;">📅 ${evento.fecha}</div>
                <p style="font-size: 12px; color: var(--text-light); margin: 0 0 8px 0; line-height: 1.3; text-align: center;">${evento.descripcion}</p>
            </div>
            <div style="text-align: center; margin-top: auto; padding-top: 3px;">
                <span style="font-size: 11px; color: var(--primary-light); font-weight: bold; display: inline-block;">Ver productos ➔</span>
            </div>
        </div>`;
    });
}

function filtrarPorEvento(categoria) {
    if (!categoria) return;
    categorySeleccionada = categoria;
    document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('activo'));
    document.querySelectorAll('.btn-categoria').forEach(btn => {
        if(btn.getAttribute('data-cat') && btn.getAttribute('data-cat').toLowerCase() === categoria.toLowerCase()) {
            btn.classList.add('activo');
        }
    });
    filtrarCatalogo();
    if (document.getElementById('buscador')) document.getElementById('buscador').value = "";
    if (document.getElementById('barra-categorias')) document.getElementById('barra-categorias').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function configurarTema() {
    const temaGuardado = localStorage.getItem('tema_tienda');
    const btnTema = document.getElementById('btn-tema');
    if (temaGuardado === 'light') { document.body.classList.add('light-mode'); if (btnTema) btnTema.innerText = '🌙'; }
    else { if (btnTema) btnTema.innerText = '☀️'; }
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const esClaro = document.body.classList.contains('light-mode');
            localStorage.setItem('tema_tienda', esClaro ? 'light' : 'dark');
            btnTema.innerText = esClaro ? '🌙' : '☀️';
        });
    }
}

function setupEventListeners() {
    document.getElementById('buscador').addEventListener('input', filtrarCatalogo);
    document.querySelectorAll('.btn-categoria').forEach(button => {
        button.addEventListener('click', (e) => {
            seleccionarCategoria(e.currentTarget.getAttribute('data-cat'), e.currentTarget);
        });
    });
    document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
    document.getElementById('btn-enviar-pedido').addEventListener('click', enviarPedidoFinal);
    document.getElementById('btn-chat-manual').addEventListener('click', abrirChatManual);
    if (document.getElementById('btn-enviar-pedido')) {
        document.getElementById('btn-enviar-pedido').addEventListener('dblclick', (e) => { e.preventDefault(); abrirModalDespacho(); });
    }
}

function configuringCamposFecha() {
    const hoy = new Date().toISOString().split('T')[0];
    const campoFecha = document.getElementById('fecha');
    if (campoFecha) {
        campoFecha.min = hoy;
        campoFecha.addEventListener('input', (e) => {
            const fechaSeleccionada = e.target.value;
            if (!fechaSeleccionada) return;
            const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
            if (fechaObj.getDay() === 0 || fechaObj.getDay() === 6) {
                alert("⚠️ Los fines de semana no realizamos entregas. Selecciona de Lunes a Viernes.");
                e.target.value = '';
            }
            validarHorariosDisponibles(); 
        });
    }
    const campoHora = document.getElementById('hora');
    if(campoHora) campoHora.addEventListener('focus', validarHorariosDisponibles);
}

function validarHorariosDisponibles() {
    const campoFecha = document.getElementById('fecha');
    const campoHora = document.getElementById('hora');
    if (!campoFecha || !campoHora) return;

    const fechaSeleccionada = campoFecha.value;
    const hoyStr = new Date().toISOString().split('T')[0];
    
    Array.from(campoHora.options).forEach(opcion => {
        opcion.disabled = false; 
        
        if (fechaSeleccionada === hoyStr) {
            const ahora = new Date();
            const horaActual = ahora.getHours();
            const minActual = ahora.getMinutes();

            let horaOpcion = 0;
            const val = opcion.value; 
            let [hStr, periodo] = val.split(' ');
            let [h, m] = hStr.split(':').map(Number);
            
            if (periodo === "PM" && h !== 12) h += 12;
            if (periodo === "AM" && h === 12) h = 0;
            
            if (h < horaActual || (h === horaActual && minActual > 15)) {
                opcion.disabled = true;
            }
        }
    });

    if (campoHora.selectedOptions[0] && campoHora.selectedOptions[0].disabled) {
        const opcionValida = Array.from(campoHora.options).find(o => !o.disabled);
        if (opcionValida) campoHora.value = opcionValida.value;
    }
}

function formatearDinero(numero) {
    let num = parseFloat(numero);
    return '$' + (isNaN(num) ? 0 : num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatearFechaHumana(fechaISO) {
    if (!fechaISO) return "";
    const partes = fechaISO.split('-');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${partes[2]} de ${meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
}

function guardarCarritoEnLocalStorage() { localStorage.setItem('carrito_tienda', JSON.stringify(carrito)); }
function recuperarCarritoDeLocalStorage() { const guardado = localStorage.getItem('carrito_tienda'); if (guardado) { carrito = JSON.parse(guardado); } }

function cargarProductos() {
    let inventarioGuardado = localStorage.getItem('inventario_tienda_real');

    fetch('productos.json?v=' + Date.now())
        .then(res => res.json())
        .then(json => {
            if (inventarioGuardado) {
                let localData = JSON.parse(inventarioGuardado);
                INVENTARIO_GLOBAL = json.map(prodJson => {
                    let coincidencia = localData.find(l => l.codigo === prodJson.codigo);
                    return coincidencia ? { ...prodJson, stock: coincidencia.stock, destacado: prodJson.destacado === true } : { ...prodJson, destacado: prodJson.destacado === true };
                });
            } else {
                INVENTARIO_GLOBAL = json.map(p => ({ ...p, stock: parseInt(p.stock) || 0, destacado: p.destacado === true }));
            }
            
            carrito.forEach(item => {
                let p = INVENTARIO_GLOBAL.find(ig => ig.codigo === item.codigo);
                if (p) p.stock = Math.max(0, p.stock - item.cantidad);
            });

            localStorage.setItem('inventario_tienda_real', JSON.stringify(INVENTARIO_GLOBAL));
            filtrarCatalogo();
            renderizarDestacados();
            actualizarCarritoVisual();
        })
        .catch(() => {
            if (inventarioGuardado) { INVENTARIO_GLOBAL = JSON.parse(inventarioGuardado); filtrarCatalogo(); renderizarDestacados(); actualizarCarritoVisual(); }
        });
}

function obtenerArregloImagenes(prod) {
    if (!prod.imagen) return [];
    return prod.imagen.includes(',') ? prod.imagen.split(',').map(img => img.trim()) : [prod.imagen];
}

window.moverImagenCarrusel = function (codigo, direccion) {
    const prod = INVENTARIO_GLOBAL.find(p => p.codigo === codigo);
    if (!prod) return;
    const images = obtenerArregloImagenes(prod);
    if (images.length <= 1) return;
    if (indicesCarrusel[codigo] === undefined) indicesCarrusel[codigo] = 0;
    indicesCarrusel[codigo] += direccion;
    if (indicesCarrusel[codigo] >= images.length) indicesCarrusel[codigo] = 0;
    else if (indicesCarrusel[codigo] < 0) indicesCarrusel[codigo] = images.length - 1;

    let imgName = images[indicesCarrusel[codigo]].split(/[/\\\\]/).pop();
    let nRuta = imgName ? `imagenes_productos/${imgName}` : 'https://placehold.co/300';
    if (document.getElementById(`img-carrusel-${codigo}`)) document.getElementById(`img-carrusel-${codigo}`).src = nRuta;
    if (document.getElementById(`img-carrusel-dest-${codigo}`)) document.getElementById(`img-carrusel-dest-${codigo}`).src = nRuta;
};

window.compartirProducto = function(codigo, nombre, precio) {
    const txt = `*¡Mira este producto en Tienda DAYH!*🤩\\n\\n🛍️ *${nombre}*\\n📌 Código: ${codigo}\\n💰 Precio: ${formatearDinero(precio)}\\n\\nConsúltalo y arma tu pedido aquí en nuestro catálogo oficial.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
};

function generarHTMLTarjeta(prod, esDestacada = false) {
    const stock = prod.stock;
    const esAgotado = stock <= 0;
    let txtStock = `Disponibles: ${stock}`, cStock = 'producto-stock';
    if (esAgotado) { txtStock = '❌ Agotado'; cStock = 'producto-stock agotado'; }
    else if (stock <= 3) { txtStock = `🔥 ¡Últimas ${stock} pzs!`; cStock = 'producto-stock stock-critico'; }

    const arrImg = obtenerArregloImagenes(prod);
    let imgN = arrImg[0] ? arrImg[0].split(/[/\\\\]/).pop() : '';
    let rImg = imgN ? `imagenes_productos/${imgN}` : 'https://placehold.co/300?text=No+disponible';
    
    // Obtener la segunda imagen si existe para el efecto hover
    let img2N = arrImg.length > 1 ? arrImg[1].split(/[/\\\\]/).pop() : '';
    let rImg2 = img2N ? `imagenes_productos/${img2N}` : rImg;

    const artLimpio = prod.articulo.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const idImg = esDestacada ? `img-carrusel-dest-${prod.codigo}` : `img-carrusel-${prod.codigo}`;

    const bIzq = arrImg.length > 1 ? `<button class="carousel-btn left" onclick="moverImagenCarrusel('${prod.codigo}', -1); event.stopPropagation();">◀</button>` : '';
    const bDer = arrImg.length > 1 ? `<button class="carousel-btn right" onclick="moverImagenCarrusel('${prod.codigo}', 1); event.stopPropagation();">▶</button>` : '';
    const badgeDestacado = (!esDestacada && prod.destacado) ? `<div class="badge-destacado">OFERTA</div>` : '';

    return `
    <div class="producto-card">
        ${badgeDestacado}
        <button class="btn-compartir" title="Compartir producto" onclick="compartirProducto('${prod.codigo}', '${artLimpio}', ${prod.precio})">🔗</button>
        <div>
            <div class="producto-codigo">CÓDIGO: ${prod.codigo}</div>
            
            <div class="img-wrapper" style="cursor: zoom-in;" onclick="abrirLightbox('${rImg}', '${artLimpio}')">
                ${bIzq} 
                <img id="${idImg}" src="${rImg}" alt="${artLimpio}" 
                     onmouseover="if('${rImg2}' !== '${rImg}') this.src='${rImg2}'"
                     onmouseout="this.src='${rImg}'"
                     onerror="this.onerror=null; this.src='https://placehold.co/300?text=${encodeURIComponent(artLimpio)}'"> 
                ${bDer}
            </div>
            
            <h3>${artLimpio}</h3>
            <div class="${cStock}">${txtStock}</div>
            <p style="color: var(--primary-light); font-weight: 700; font-size: 16px; margin: 0 0 6px 0;">${formatearDinero(prod.precio)}</p>
        </div>
        <button class="btn" onclick="agregarAlCarritoConEfecto('${prod.codigo}', this)" ${esAgotado ? 'disabled' : ''}>${esAgotado ? 'Sin existencias' : '🛒 Agregar'}</button>
    </div>`;
}

function renderizarDestacados() {
    const cont = document.getElementById('lista-destacados');
    const sec = document.getElementById('seccion-destacados');
    if (!cont || !sec) return;
    const dest = INVENTARIO_GLOBAL.filter(p => p.destacado === true);
    if (dest.length === 0) { sec.style.display = 'none'; return; }
    sec.style.display = 'block'; cont.innerHTML = '';
    dest.forEach(p => { cont.innerHTML += generarHTMLTarjeta(p, true); });
}

function filtrarCatalogo() {
    const buscar = document.getElementById('buscador').value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const filtrados = INVENTARIO_GLOBAL.filter(prod => {
        const nom = prod.articulo ? prod.articulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const cod = prod.codigo ? prod.codigo.toLowerCase() : "";
        const cat = prod.categoria ? prod.categoria.toLowerCase() : "general";
        return (nom.includes(buscar) || cod.includes(buscar)) && (categorySeleccionada === "todas" || cat === categorySeleccionada.toLowerCase());
    });
    const cont = document.getElementById('lista-productos');
    if (!cont) return; cont.innerHTML = '';
    if (filtrados.length === 0) { cont.innerHTML = '<p class="sin-resultados">No encontramos productos.</p>'; return; }
    filtrados.forEach(p => { cont.innerHTML += generarHTMLTarjeta(p, false); });
}

function seleccionarCategoria(cat, elemento) {
    categorySeleccionada = cat;
    document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('activo'));
    if (elemento) elemento.classList.add('activo');
    filtrarCatalogo();
}

function dispararAnimacionCarrito() {
    const elements = [document.getElementById('badge-contador'), document.getElementById('carrito-flotante')];
    elements.forEach(el => {
        if(el) {
            el.classList.remove('animar-pop');
            void el.offsetWidth; 
            el.classList.add('animar-pop');
        }
    });
}

window.agregarAlCarrito = function (codigo) {
    const prod = INVENTARIO_GLOBAL.find(p => p.codigo === codigo);
    if (!prod) return;
    if (prod.stock > 0) {
        const item = carrito.find(i => i.codigo === codigo);
        if (item) item.cantidad += 1;
        else carrito.push({ codigo: codigo, cantidad: 1 });
        prod.stock -= 1;
        localStorage.setItem('inventario_tienda_real', JSON.stringify(INVENTARIO_GLOBAL));
        guardarCarritoEnLocalStorage();
        actualizarCarritoVisual();
        filtrarCatalogo();
        renderizarDestacados();
        dispararAnimacionCarrito();
    } else {
        alert("Lo sentimos, ya no quedan más unidades.");
    }
};

window.agregarAlCarritoConEfecto = function(codigo, botonElement) {
    agregarAlCarrito(codigo);
    if (botonElement && !botonElement.disabled) {
        const textoOriginal = botonElement.innerHTML;
        botonElement.disabled = true;
        botonElement.style.background = "var(--success)";
        botonElement.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.5)";
        botonElement.innerHTML = "¡Añadido! ✓";
        setTimeout(() => {
            botonElement.disabled = false;
            botonElement.style.background = "";
            botonElement.style.boxShadow = "";
            botonElement.innerHTML = textoOriginal;
        }, 1200);
    }
}

window.cambiarCantidad = function(codigo, cambio) {
    const prod = INVENTARIO_GLOBAL.find(p => p.codigo === codigo);
    const item = carrito.find(i => i.codigo === codigo);
    if (!item || !prod) return;

    if (cambio === 1) {
        if (prod.stock > 0) { item.cantidad += 1; prod.stock -= 1; dispararAnimacionCarrito(); }
        else { alert("Lo sentimos, ya no quedan más unidades."); }
    } else if (cambio === -1) {
        item.cantidad -= 1; prod.stock += 1;
        if (item.cantidad <= 0) {
            const idx = carrito.findIndex(i => i.codigo === codigo);
            if (idx !== -1) carrito.splice(idx, 1);
        }
        dispararAnimacionCarrito();
    }
    localStorage.setItem('inventario_tienda_real', JSON.stringify(INVENTARIO_GLOBAL));
    guardarCarritoEnLocalStorage();
    actualizarCarritoVisual();
    filtrarCatalogo();
    renderizarDestacados();
};

function vaciarCarrito() {
    if (confirm("¿Estás seguro de vaciar el pedido?")) {
        carrito = [];
        guardarCarritoEnLocalStorage();
        localStorage.removeItem('inventario_tienda_real');
        cargarProductos();
    }
}

function actualizarCarritoVisual() {
    const cont = document.getElementById('items-carrito');
    const txtMonto = document.getElementById('total-monto');
    const btnVaciar = document.getElementById('btn-vaciar');
    const bContador = document.getElementById('badge-contador');
    const bFlotante = document.getElementById('badge-flotante');

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (bContador) bContador.innerText = totalItems;
    if (bFlotante) bFlotante.innerText = totalItems;

    if (carrito.length === 0) {
        cont.innerHTML = '<p style="color: var(--text-light); text-align: center; margin: 20px 0;">El carrito está vacío.</p>';
        if (txtMonto) txtMonto.innerText = "$0.00";
        if (btnVaciar) btnVaciar.style.display = 'none';
        return;
    }

    if (btnVaciar) btnVaciar.style.display = 'block';
    cont.innerHTML = ''; let totalGeneral = 0;

    carrito.forEach(item => {
        const prod = INVENTARIO_GLOBAL.find(p => p.codigo === item.codigo);
        if (!prod) return;
        const subtotal = (parseFloat(prod.precio) || 0) * item.cantidad;
        totalGeneral += subtotal;
        cont.innerHTML += `
        <div class="item-linea">
            <div class="item-info">
                <span class="item-nombre">[${prod.codigo}] ${prod.articulo}</span>
                <span class="item-precio">${formatearDinero(prod.precio)} c/u</span>
            </div>
            <div class="item-controles">
                <button class="btn-qty" onclick="cambiarCantidad('${prod.codigo}', -1)">-</button>
                <span class="item-cant">${item.cantidad}</span>
                <button class="btn-qty" onclick="cambiarCantidad('${prod.codigo}', 1)" ${prod.stock <= 0 ? 'disabled' : ''}>+</button>
            </div>
        </div>`;
    });
    if (txtMonto) txtMonto.innerText = formatearDinero(totalGeneral);
}

async function enviarPedidoFinal() {
    if (carrito.length === 0) { alert("Tu carrito está vacío"); return; }
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const cliente = document.getElementById('cliente').value.trim();

    if (!fecha || !hora || cliente.length < 3) { alert("Por favor completa los campos: Fecha, Hora y Nombre Completo."); return; }

    lanzarEfectoConfeti();

    let mensaje = "*¡HOLA, TIENDA DAYH!*\\nQuiero agendar el siguiente pedido:\\n━━━━━━━━━━━━━━━━━━━━━\\n\\n*CLIENTE:* " + cliente + "\\n\\n*PRODUCTOS SOLICITADOS:*\\n";
    let total = 0; const productosParaAPI = [];

    carrito.forEach(item => {
        const prod = INVENTARIO_GLOBAL.find(p => p.codigo === item.codigo);
        if (!prod) return;
        const subtotal = prod.precio * item.cantidad; total += subtotal;
        mensaje += `*${item.cantidad}x* [${prod.codigo}] ${prod.articulo} ➔ ${formatearDinero(subtotal)}\\n`;
        productosParaAPI.push({ codigo: item.codigo, cantidad: item.cantidad });
    });

    mensaje += "\\n━━━━━━━━━━━━━━━━━━━━━\\n*TOTAL:* " + formatearDinero(total) + "\\n*FECHA DE ENTREGA:* " + formatearFechaHumana(fecha) + "\\n*HORA APROX:* " + hora + "\\n";
    urlGlobalWhatsApp = "https://wa.me/" + TELEFONO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);

    if (document.getElementById('alerta-copiado')) document.getElementById('alerta-copiado').style.display = 'block';
    
    setTimeout(() => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) window.location.href = urlGlobalWhatsApp;
        else window.open(urlGlobalWhatsApp, "_blank");
    }, 500);

    fetch('http://127.0.0.1:5000/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente, fecha_entrega: fecha, hora_entrega: hora, productos: productosParaAPI }) })
    .catch(() => console.warn("Python local no disponible"));

    localStorage.setItem("nombre_cliente_dayh", cliente);
    
    carrito = [];
    guardarCarritoEnLocalStorage();
    actualizarCarritoVisual();
    if (document.getElementById("fecha")) document.getElementById("fecha").value = "";
    if (document.getElementById("hora")) document.getElementById("hora").value = "";
    filtrarCatalogo(); renderizarDestacados();
}

function abrirChatManual() { if (urlGlobalWhatsApp) window.open(urlGlobalWhatsApp, '_blank'); }

function abrirModalDespacho() {
    if (carrito.length === 0) { alert("El carrito está vacío."); return; }
    const cont = document.getElementById('detalle-despacho-productos');
    const modal = document.getElementById('modal-despacho');
    if (!cont || !modal) return; cont.innerHTML = '';
    carrito.forEach(item => {
        const prod = INVENTARIO_GLOBAL.find(p => p.codigo === item.codigo);
        if (!prod) return;
        let imgName = prod.imagen ? prod.imagen.split(/[/\\\\]/).pop() : '';
        let rImg = imgName ? `imagenes_productos/${imgName}` : 'https://placehold.co/70?text=Prod';
        cont.innerHTML += `
        <div class="fila-despacho">
            <img src="${rImg}" class="img-despacho" onerror="this.onerror=null; this.src='https://placehold.co/70?text=Prod'">
            <div class="info-despacho">
                <h4 style="margin: 0 0 5px 0; font-size: 16px;">${prod.articulo}</h4>
                <span>Código: <code>${prod.codigo}</code></span>
            </div>
            <div class="cant-despacho">${item.cantidad} <span style="font-size:10px; display:block;">Cant.</span></div>
        </div>`;
    });
    modal.style.display = 'flex';
    modal.querySelector('.btn-cerrar-modal').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btn-imprimir-despacho').onclick = () => { window.print(); };
}

/* =========================================================================
   NUEVAS FUNCIONES: CAROUSEL, LIGHTBOX, BOTON ARRIBA
   ========================================================================= */

// BANNER ROTATIVO (HERO CAROUSEL)
function inicializarHeroCarousel() {
    const wrapper = document.getElementById('hero-carousel-wrapper');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!wrapper || !dotsContainer) return;
    wrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    PROMO_BANNERS.forEach((banner, idx) => {
        wrapper.innerHTML += `
            <div class="hero-slide">
                <img src="${banner.imagen}" alt="${banner.titulo}">
                <div class="hero-caption">
                    <h2>${banner.titulo}</h2>
                    <p>${banner.desc}</p>
                </div>
            </div>
        `;
        dotsContainer.innerHTML += `<div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="irASlideCarousel(${idx})"></div>`;
    });
    arrancarAutoplayCarousel();
}

function arrancarAutoplayCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => { cambiarSlideCarousel(1); }, 5000);
}

window.cambiarSlideCarousel = function(direccion) {
    currentCarouselIndex += direccion;
    if (currentCarouselIndex >= PROMO_BANNERS.length) currentCarouselIndex = 0;
    if (currentCarouselIndex < 0) currentCarouselIndex = PROMO_BANNERS.length - 1;
    actualizarPosicionCarousel();
}

window.irASlideCarousel = function(indice) {
    currentCarouselIndex = indice;
    actualizarPosicionCarousel();
    arrancarAutoplayCarousel(); 
}

function actualizarPosicionCarousel() {
    const wrapper = document.getElementById('hero-carousel-wrapper');
    if (!wrapper) return;
    wrapper.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
        if (idx === currentCarouselIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

// GALERÍA MODERNIZADA (LIGHTBOX)
window.abrirLightbox = function(src, titulo) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    if (!modal || !img) return;
    modal.style.display = 'flex';
    img.src = src;
    caption.innerText = titulo || "Visualización de producto";
}

window.cerrarLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.style.display = 'none';
}

// BOTÓN VOLVER ARRIBA
function inicializarBotónVolverArriba() {
    const btn = document.getElementById('btn-back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btn.style.display = 'flex';
        else btn.style.display = 'none';
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}