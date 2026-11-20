$html_template = @'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-container">
            <div class="logo">
                <img src="imagenes/logo.png" alt="Valverdes">
            </div>
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Buscar productos..." class="search-input">
                <button class="search-btn">🔍 Buscar</button>
            </div>
            <div class="header-links">
                <a href="login.html" id="usuarioHeader">👤 Inicia Sesión</a>
                <a href="carrito.html">🛒 Carrito</a>
            </div>
        </div>
    </header>

    <nav class="breadcrumb">
        <a href="index.html">Inicio</a> > <span>{TITLE}</span>
    </nav>

    <main class="container">
        <h1>{TITLE}</h1>
        <div class="products-grid" id="productsContainer">
            {PRODUCTS}
        </div>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h4>Contacto</h4>
                <p>Email: info@valverdes.com</p>
                <p>Teléfono: (123) 456-7890</p>
            </div>
            <div class="footer-section">
                <h4>Categorías</h4>
                <ul>
                    <li><a href="categoria_frutas.html">Frutas y Verduras</a></li>
                    <li><a href="categoria_snacks.html">Snacks</a></li>
                    <li><a href="categoria_licores.html">Licores</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Información</h4>
                <ul>
                    <li><a href="#">Términos y Condiciones</a></li>
                    <li><a href="#">Política de Privacidad</a></li>
                    <li><a href="#">Libro de Reclamaciones</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Valverdes. Todos los derechos reservados.</p>
        </div>
    </footer>

    <script>
        // Verificar sesión
        function verificarSesion() {
            const usuario = localStorage.getItem('usuario');
            const enlaceLogin = document.getElementById('usuarioHeader');
            if (usuario) {
                enlaceLogin.innerHTML = '👤 ' + usuario;
                enlaceLogin.href = '#';
            }
        }

        // Búsqueda de productos
        document.getElementById('searchInput').addEventListener('keyup', function(e) {
            const searchTerm = e.target.value.toLowerCase().replace(/\s+/g, '');
            const productos = document.querySelectorAll('.card-pro');
            
            productos.forEach(producto => {
                const nombre = producto.getAttribute('data-nombre').toLowerCase().replace(/\s+/g, '');
                if (nombre.includes(searchTerm)) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });
        });

        // Agregar al carrito
        document.querySelectorAll('.btn-carrito').forEach(btn => {
            btn.addEventListener('click', function() {
                const producto = this.closest('.card-pro');
                const nombre = producto.querySelector('h4').textContent;
                const precio = producto.querySelector('.precio').textContent;
                alert('Producto agregado: ' + nombre);
            });
        });

        // Ver producto
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', function() {
                const producto = this.closest('.card-pro');
                const nombre = producto.querySelector('h4').textContent;
                alert('Ver detalles de: ' + nombre);
            });
        });

        verificarSesion();
    </script>
</body>
</html>
'@

$product_card = @'
<div class="card-pro" data-nombre="{PRODUCT_NAME}">
    <div class="card-img">
        <img src="{IMAGE_PATH}" alt="{PRODUCT_NAME}">
    </div>
    <div class="card-info">
        <h4>{PRODUCT_NAME}</h4>
        <p class="descripcion">{DESCRIPTION}</p>
        <span class="precio">S/ {PRICE}</span>
        <div class="card-buttons">
            <button class="btn-carrito">🛒 Agregar</button>
            <button class="btn-ver">👁️ Ver</button>
        </div>
    </div>
</div>
'@

Write-Host "Plantillas cargadas"
