const TELEFONO_WHATSAPP = "527442411773"; 
let categorySeleccionada = "todas";
let urlGlobalWhatsApp = "";

let INVENTARIO_GLOBAL = [];
let carrito = []; 

window.addEventListener('load', () => {
    configuringCamposFecha();
    recuperarCarritoDeLocalStorage(); 
    cargarProductos(); 
    setupEventListeners();
});

// FUNCIÓN CLAVE: Carga el inventario y evita el caché de GitHub
function cargarProductos() {
    const cacheBuster = new Date().getTime(); 
    fetch(`productos.json?v=${cacheBuster}`)
        .then(response => response.json())
        .then(data => {
            INVENTARIO_GLOBAL = data;
            filtrarCatalogo();
        })
        .catch(err => console.error("Error al cargar productos:", err));
}

function setupEventListeners() {
    document.getElementById('buscador').addEventListener('input', filtrarCatalogo);
    
    document.querySelectorAll('.btn-categoria').forEach(button => {
        button.addEventListener('click', (e) => {
            const categoria = e.target.getAttribute('data-cat');
            seleccionarCategoria(categoria, e.target);
        });
    });

    document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
    document.getElementById('btn-enviar-pedido').addEventListener('click', enviarPedidoFinal);
}

function filtrarCatalogo() {
    const termino = document.getElementById('buscador').value.toLowerCase();
    const contenedor = document.getElementById('productos-grid');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    
    const filtrados = INVENTARIO_GLOBAL.filter(prod => {
        const coincideCat = (categorySeleccionada === "todas" || prod.categoria.toLowerCase() === categorySeleccionada.toLowerCase());
        const coincideBusqueda = (prod.articulo.toLowerCase().includes(termino) || prod.codigo.toLowerCase().includes(termino));
        return coincideCat && coincideBusqueda;
    });

    filtrados.forEach(prod => {
        // Aquí va tu lógica para pintar las tarjetas (la que ya tenías)
        const div = document.createElement('div');
        div.className = 'producto-card';
        div.innerHTML = `<h3>${prod.articulo}</h3><p>Stock: ${prod.stock}</p>`;
        contenedor.appendChild(div);
    });
}

function finalizarProcesoPedido() {
    // Esto guarda el estado actual en el navegador del cliente
    localStorage.setItem('inventario_tienda', JSON.stringify(INVENTARIO_GLOBAL));
    carrito = []; 
    guardarCarritoEnLocalStorage(); 
    actualizarCarritoVisual(); 
    filtrarCatalogo(); 
    document.getElementById('fecha').value = '';
    document.getElementById('cliente').value = '';
}

function configurarCamposFecha() {
    const hoy = new Date().toISOString().split('T')[0];
    const campoFecha = document.getElementById('fecha');
    if (campoFecha) campoFecha.min = hoy;
}

// Asegúrate de mantener aquí tus funciones de recuperarCarritoDeLocalStorage, 
// guardarCarritoEnLocalStorage y actualizarCarritoVisual que ya tenías en tu archivo.