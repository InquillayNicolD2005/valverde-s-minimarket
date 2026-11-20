// =======================
// 🛒 CARRITO GLOBAL
// =======================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// =======================
// 🟢 ACTUALIZAR CONTADOR
// =======================
function actualizarContador(){
    let contador = document.getElementById("contadorCarrito");

    if(contador){
        contador.textContent = carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);
    }
}


// =======================
// 🟢 AGREGAR PRODUCTO
// =======================
function agregarAlCarrito(nombre, precio, imagen){
    const existente = carrito.find(producto => producto.nombre === nombre);
    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            imagen: imagen || "imagenes/logo.png",
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    mostrarToast(nombre + " agregado al carrito");
}
// =======================
// 🔍 BUSCAR (INDEX)
// =======================
function buscar(){
    let input = document.getElementById("buscadorInput").value.toLowerCase().trim();
    let contenedor = document.getElementById("contenedorResultados");

    contenedor.innerHTML = "";

    if (!input) {
        limpiarBusqueda();
        return;
    }

    // ocultar todo
    document.querySelectorAll(".seccion, .banner").forEach(sec=>{
    if(!sec.contains(document.getElementById("buscadorInput"))){
        sec.style.display = "none";
    }
    });
    let resultados = productosGlobal.filter(p => p.nombre.toLowerCase().includes(input));

    if (resultados.length === 0) {
        document.querySelectorAll(".card[data-nombre]").forEach(card => {
            if ((card.dataset.nombre || "").includes(input)) {
                const nombre = card.querySelector("h4")?.textContent || "";
                const precioTexto = card.querySelector(".precio")?.textContent || "S/ 0";
                const precio = Number(precioTexto.replace(/[^\d.,]/g, "").replace(",", "."));
                const imagen = card.querySelector("img")?.getAttribute("src") || "imagenes/logo.png";
                resultados.push({ nombre, precio, imagen });
            }
        });
    }

    if(resultados.length === 0){
        alert("No se encontraron productos");
        return;
    }

    resultados.forEach(p=>{
        contenedor.innerHTML += `
        <div class="card">
            <img src="${p.imagen}">
            <h4>${p.nombre}</h4>
            <p class="precio">S/ ${Number(p.precio).toFixed(2)}</p>
            <button onclick="agregarAlCarrito('${p.nombre.replace(/'/g, "\\'")}',${p.precio},'${p.imagen}')">
                Agregar
            </button>
        </div>
        `;
    });

    document.getElementById("resultadosBusqueda").style.display = "block";
}


// =======================
// 🏷 FILTRAR CATEGORÍAS
// =======================
function filtrar(cat){
    document.querySelectorAll(".card").forEach(p=>{
        let categoria = p.getAttribute("data-categoria");
        p.style.display = categoria === cat ? "block" : "none";
    });
}


// =======================
// 🔄 MOSTRAR TODO
// =======================
function mostrarTodo(){
    document.querySelectorAll(".card").forEach(p=>{
        p.style.display = "block";
    });
}


// =======================
// 🎠 CARRUSEL MANUAL
// =======================
function mover(id, d){
    document.getElementById(id).scrollBy({
        left: 300 * d,
        behavior: 'smooth'
    });
}


// =======================
// 🎠 AUTO SCROLL CARRUSEL
// =======================
setInterval(()=>{
    document.querySelectorAll(".carrusel").forEach(c=>{
        c.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
}, 5000);


// =======================
// 🧾 MOSTRAR CARRITO HTML
// =======================
function mostrarCarrito(){
    let lista = document.getElementById("lista");
    let total = 0;

    if(!lista) return;

    lista.innerHTML = "";

    carrito.forEach((p, index)=>{
        const cantidad = p.cantidad || 1;
        const subtotal = p.precio * cantidad;
        lista.innerHTML += `
        <div class="item-carrito">

            <img src="${p.imagen}" class="img-carrito">

            <div class="producto-info">
                <p><strong>${p.nombre}</strong></p>
                <span>S/ ${p.precio.toFixed(2)}</span>
            </div>

            <div class="cantidad">
                <button type="button" onclick="cambiarCantidad(${index}, -1)" aria-label="Restar">−</button>
                <strong>${cantidad}</strong>
                <button type="button" onclick="cambiarCantidad(${index}, 1)" aria-label="Sumar">+</button>
            </div>

            <div>
                <strong>S/ ${subtotal.toFixed(2)}</strong>
                <button type="button" class="btn-eliminar" onclick="eliminarProducto(${index})" aria-label="Eliminar ${p.nombre}">Eliminar</button>
            </div>
        </div>
        `;

        total += subtotal;
    });

    if (document.getElementById("total")) {
        document.getElementById("total").innerText = "Total: S/ " + total.toFixed(2);
    }
}

function cambiarCantidad(index, cambio){
    if (!carrito[index]) return;
    carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;
    if (carrito[index].cantidad < 1) {
        carrito.splice(index, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}


// =======================
// ❌ ELIMINAR PRODUCTO
// =======================
function eliminarProducto(index){
    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();
    actualizarContador();
}


// =======================
// 🗑 VACIAR CARRITO
// =======================
function vaciar(){
    carrito = [];

    localStorage.setItem("carrito", "[]");

    mostrarCarrito();
    actualizarContador();
}


// =======================
// 🎞 CARRUSEL AUTOMÁTICO SEMANA
// =======================
let slides = document.querySelectorAll(".slide");
let indexSlide = 0;

function cambiarSlide(){
    if(slides.length === 0) return;

    slides[indexSlide].classList.remove("activo");
    indexSlide = (indexSlide + 1) % slides.length;
    slides[indexSlide].classList.add("activo");
}

setInterval(cambiarSlide, 3000);


// =======================
// 🚀 INICIALIZACIÓN
// =======================
window.onload = function(){
    actualizarContador();
    mostrarCarrito();
    inicializarInterfaz();
}


//-------------
//Volver a la normalidad 
//----------------
function mostrarTodoIndex(){
    document.querySelectorAll(".seccion, .banner").forEach(sec=>{
        sec.style.display = "block";
    });

    document.querySelectorAll(".card").forEach(card=>{
        card.style.display = "block";
    });

    document.getElementById("buscadorInput").value = "";
}

//-------------
//Limpiar búsqueda (ícono X) 
//----------------
function limpiarBusqueda(){
    document.getElementById("buscadorInput").value = "";

    document.getElementById("resultadosBusqueda").style.display = "none";

    document.querySelectorAll(".seccion, .banner").forEach(sec=>{
        sec.style.display = "block";
    });
}

const buscadorInput = document.getElementById("buscadorInput");
if (buscadorInput) {
    buscadorInput.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            buscar();
        }
    });
    buscadorInput.addEventListener("input", function(){
        if (buscadorInput.value.trim().length >= 2) buscar();
        if (buscadorInput.value.trim().length === 0) mostrarTodoIndex();
    });
}


let productosGlobal = [];

// 🔥 Cargar JSON
fetch("data/productos.json")
.then(res => res.ok ? res.json() : [])
.then(data => {
    productosGlobal = data;
})
.catch(() => {
    productosGlobal = [];
});


//----------------
//
//--------------------------
function actualizarContador(){
    let contador = document.getElementById("contadorCarrito");
    if(contador){
        contador.innerText = carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);
    }
}

//ver información del producto
function verProducto(nombre, precio, imagen){
    let producto = {
        nombre: nombre,
        precio: precio,
        imagen: imagen
    };

    localStorage.setItem("productoSeleccionado", JSON.stringify(producto));

    window.location.href = "producto.html";
}

function mostrarToast(mensaje){
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
        stack = document.createElement("div");
        stack.className = "toast-stack";
        document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = mensaje;
    stack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2800);
}

function inicializarInterfaz(){
    const header = document.querySelector(".header");
    if (header && !header.querySelector(".mobile-menu-button")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mobile-menu-button";
        button.setAttribute("aria-label", "Abrir menú");
        button.textContent = "☰";
        const menu = header.querySelector(".menu");
        button.addEventListener("click", () => {
            menu?.classList.toggle("abierto");
            button.textContent = menu?.classList.contains("abierto") ? "✕" : "☰";
        });
        header.appendChild(button);
    }

    const banner = document.querySelector(".banner");
    if (banner && !banner.querySelector(".banner-subtitle") && banner.parentElement) {
        const titulo = banner.querySelector("h1");
        if (titulo) {
            const subtitle = document.createElement("p");
            subtitle.className = "banner-subtitle";
            subtitle.textContent = "Productos frescos, precios justos y entregas rápidas cerca de ti.";
            titulo.insertAdjacentElement("afterend", subtitle);
        }
    }

    if (!document.querySelector(".trust-strip") && document.querySelector(".banner")) {
        const trust = document.createElement("div");
        trust.className = "trust-strip";
        trust.innerHTML = `
            <div class="trust-item"><span class="trust-icon">⚡</span><div><strong>Entrega rápida</strong><span>Disponible en tu zona</span></div></div>
            <div class="trust-item"><span class="trust-icon">✓</span><div><strong>Compra segura</strong><span>Pago protegido</span></div></div>
            <div class="trust-item"><span class="trust-icon">↩</span><div><strong>Atención cercana</strong><span>Estamos para ayudarte</span></div></div>`;
        document.querySelector(".banner").insertAdjacentElement("afterend", trust);
    }

    const currentPage = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".menu a").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    const user = JSON.parse(localStorage.getItem("usuarioLogeado") || "null");
    const userHeader = document.getElementById("usuarioHeader");
    if (userHeader && user) {
        userHeader.textContent = "👤 " + (user.nombre || user.usuario || "Mi cuenta");
        userHeader.href = "#";
        userHeader.title = "Cerrar sesión";
        userHeader.setAttribute("aria-label","Cerrar sesión de "+(user.nombre||user.usuario));
        userHeader.addEventListener("click", function(event){
            event.preventDefault();
            if(confirm("¿Deseas cerrar tu sesión?")){
                localStorage.removeItem("usuarioLogeado");
                window.location.href="index.html";
            }
        });
    }
}