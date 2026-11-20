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
        contador.textContent = carrito.length;
    }
}


// =======================
// 🟢 AGREGAR PRODUCTO
// =======================
function agregarAlCarrito(nombre, precio, imagen){
    carrito.push({
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        cantidad: 1
    });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();




    alert(nombre + " agregado al carrito");
}
// =======================
// 🔍 BUSCAR (INDEX)
// =======================
function buscar(){
    let input = document.getElementById("buscadorInput").value.toLowerCase();
    let contenedor = document.getElementById("contenedorResultados");

    contenedor.innerHTML = "";

    // ocultar todo
    document.querySelectorAll(".seccion, .banner").forEach(sec=>{
    if(!sec.contains(document.getElementById("buscadorInput"))){
        sec.style.display = "none";
    }
    });
    let resultados = productosGlobal.filter(p =>
        p.nombre.toLowerCase().includes(input)
    );

    if(resultados.length === 0){
        alert("No se encontraron productos");
        return;
    }

    resultados.forEach(p=>{
        contenedor.innerHTML += `
        <div class="card">
            <img src="${p.imagen}">
            <h4>${p.nombre}</h4>
            <p class="precio">S/ ${p.precio}</p>
            <button onclick="agregarAlCarrito('${p.nombre}',${p.precio})">
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

    carrito.forEach(p=>{
        lista.innerHTML += `
        <div class="item-carrito">

            <img src="${p.imagen}" class="img-carrito">

            <div>
                <p>${p.nombre}</p>
                <span>S/ ${p.precio}</span>
            </div>

        </div>
        `;

        total += p.precio;
    });

    document.getElementById("total").innerText = "Total: S/ " + total;
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

document.getElementById("buscadorInput").addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        buscar();
    }
});

// 🔥 en vivo
document.getElementById("buscadorInput").addEventListener("input", buscar);

// ocultar al inicio
clearBtn.style.display = "none";


let productosGlobal = [];

// 🔥 Cargar JSON
fetch("data/productos.json")
.then(res => res.json())
.then(data => {
    productosGlobal = data;
});


//----------------
//
//--------------------------
function actualizarContador(){
    let contador = document.getElementById("contadorCarrito");
    if(contador){
        contador.innerText = carrito.length;
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