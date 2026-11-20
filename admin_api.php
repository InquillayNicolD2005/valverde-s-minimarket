<?php
header("Content-Type: application/json; charset=utf-8");
session_start();

include("conexion.php");
$conn->set_charset("utf8mb4");

function ensure_schema($conn) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(150) NOT NULL DEFAULT ''");
    $conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(150) NOT NULL DEFAULT ''");
    $conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30) NOT NULL DEFAULT ''");
    $conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion VARCHAR(255) NOT NULL DEFAULT ''");
    $conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    $conn->query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS usuario_id INT NULL");
    $conn->query("CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $conn->query("CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        cliente VARCHAR(150) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        hora_entrega VARCHAR(100) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
        delivery DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $conn->query("CREATE TABLE IF NOT EXISTS pedido_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    $conn->query("CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NOT NULL DEFAULT '',
        precio DECIMAL(10,2) NOT NULL,
        imagen VARCHAR(255) NOT NULL DEFAULT 'imagenes/logo.png',
        stock INT NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $conn->query("CREATE TABLE IF NOT EXISTS ofertas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion VARCHAR(255) NOT NULL DEFAULT '',
        imagen VARCHAR(255) NOT NULL DEFAULT 'imagenes/logo.png',
        precio_original DECIMAL(10,2) NOT NULL DEFAULT 0,
        precio_oferta DECIMAL(10,2) NOT NULL DEFAULT 0,
        etiqueta VARCHAR(50) NOT NULL DEFAULT 'OFERTA',
        activo TINYINT(1) NOT NULL DEFAULT 1,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $conn->query("CREATE TABLE IF NOT EXISTS contenido_sitio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clave VARCHAR(80) NOT NULL UNIQUE,
        contenido TEXT NOT NULL
    ) ENGINE=InnoDB");
}

ensure_schema($conn);

$conteoOfertas = intval($conn->query("SELECT COUNT(*) FROM ofertas")->fetch_row()[0]);
if ($conteoOfertas === 0) {
    $ofertasIniciales = [
        ["Canasta de frutas","Manzana, naranja y plátano seleccionados.","imagenes/ofertas/oferta2.png",16.20,12.96,"20% OFF"],
        ["Bebidas 2×1","Dos Coca Cola de 500 ml.","imagenes/ofertas/oferta1.png",7.60,3.80,"2×1"],
        ["Snacks y galletas","Selección de galletas para compartir.","imagenes/ofertas/oferta4.png",4.50,4.05,"10% OFF"],
        ["Combo desayuno","Leche, pan y café para iniciar el día.","imagenes/ofertas/oferta5.png",12.00,9.90,"AHORRO"]
    ];
    $seedOferta = $conn->prepare("INSERT INTO ofertas (nombre,descripcion,imagen,precio_original,precio_oferta,etiqueta) VALUES (?,?,?,?,?,?)");
    foreach ($ofertasIniciales as $oferta) {
        [$nombre,$descripcion,$imagen,$original,$ofertaPrecio,$etiqueta] = $oferta;
        $seedOferta->bind_param("sssdds",$nombre,$descripcion,$imagen,$original,$ofertaPrecio,$etiqueta);
        $seedOferta->execute();
    }
}

$contenidoInicial = [
    "about_hero" => "Desde Cusco trabajamos cada día para llevarte productos esenciales con atención cercana y entregas rápidas.",
    "about_mision" => "Ofrecer una experiencia de compra rápida, amable y confiable, con productos frescos y de primera necesidad para nuestros vecinos de Cusco.",
    "about_vision" => "Ser el minimarket de referencia de nuestra comunidad mediante servicio innovador, variedad y compromiso constante con nuestros clientes.",
    "about_address" => "C. Maruri 382, Cusco 00800",
    "about_phone" => "+51 986 620 300",
    "about_email" => "valverdesminimarket@gmail.com",
    "about_whatsapp" => "51986620300"
];
foreach ($contenidoInicial as $clave => $contenido) {
    $stmt = $conn->prepare("INSERT INTO contenido_sitio (clave,contenido) VALUES (?,?) ON DUPLICATE KEY UPDATE clave=clave");
    $stmt->bind_param("ss",$clave,$contenido);
    $stmt->execute();
}

$productoConteo = $conn->query("SELECT COUNT(*) AS total FROM productos")->fetch_assoc()["total"];
if (intval($productoConteo) === 0) {
    $productosIniciales = [
        ["Inka Kola", "Bebidas", "Gaseosa original 500 ml", 4.90, "imagenes/bebidas/gaseosa_INCAKOLA_original.jpeg", 50],
        ["Coca Cola", "Bebidas", "Gaseosa original 500 ml", 3.80, "imagenes/bebidas/gaseosa_COCACOLA_original.jpeg", 50],
        ["Arroz", "Abarrotes", "Arroz extra seleccionado", 17.00, "imagenes/abarrotes/arroz_BELL'S_5kg.jpeg", 30],
        ["Whisky", "Licores", "Botella seleccionada", 40.00, "imagenes/licores/licor_SMIRNOFF_original.jpeg", 15]
    ];
    $seedStmt = $conn->prepare("INSERT INTO productos (nombre,categoria,descripcion,precio,imagen,stock) VALUES (?,?,?,?,?,?)");
    foreach ($productosIniciales as $producto) {
        [$nombre,$categoria,$descripcion,$precio,$imagen,$stock] = $producto;
        $seedStmt->bind_param("sssssi", $nombre,$categoria,$descripcion,$precio,$imagen,$stock);
        $seedStmt->execute();
    }
}

$jsonPayload = json_decode(file_get_contents("php://input"), true);
if (!is_array($jsonPayload)) {
    $jsonPayload = [];
}
$action = $_POST["action"] ?? $_GET["action"] ?? ($jsonPayload["action"] ?? "");

if ($action === "login") {
    $identificador = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";
    $stmt = $conn->prepare("SELECT id, usuario, nombre, contrasena FROM administradores WHERE usuario = ? OR email = ?");
    $stmt->bind_param("ss", $identificador, $identificador);
    $stmt->execute();
    $resultado = $stmt->get_result();
    if ($resultado->num_rows === 1) {
        $admin = $resultado->fetch_assoc();
        if (password_verify($password, $admin["contrasena"])) {
            $_SESSION["admin_id"] = $admin["id"];
            $_SESSION["admin_nombre"] = $admin["nombre"];
            echo json_encode(["ok" => true]);
            exit;
        }
    }
    echo json_encode(["ok" => false, "message" => "Usuario o contraseña incorrectos"]);
    exit;
}

if ($action === "logout") {
    session_destroy();
    echo json_encode(["ok" => true]);
    exit;
}

if ($action === "offers_public") {
    $ofertas = [];
    $resultado = $conn->query("SELECT id,nombre,descripcion,imagen,precio_original,precio_oferta,etiqueta FROM ofertas WHERE activo=1 ORDER BY id ASC");
    while ($fila = $resultado->fetch_assoc()) $ofertas[] = $fila;
    echo json_encode(["ok"=>true,"ofertas"=>$ofertas]);
    exit;
}

if ($action === "content_public") {
    $contenido = [];
    $resultado = $conn->query("SELECT clave,contenido FROM contenido_sitio");
    while ($fila = $resultado->fetch_assoc()) $contenido[$fila["clave"]] = $fila["contenido"];
    echo json_encode(["ok"=>true,"contenido"=>$contenido]);
    exit;
}

if ($action === "create_order") {
    $payload = $jsonPayload;
    if (isset($_POST["payload"])) {
        $payload = json_decode($_POST["payload"], true);
    }
    if (!is_array($payload) || empty($payload["items"])) {
        echo json_encode(["ok" => false, "message" => "No hay productos en el pedido"]);
        exit;
    }

    $cliente = trim($payload["cliente"] ?? "Cliente");
    $usuarioId = intval($payload["usuario_id"] ?? 0);
    $direccion = trim($payload["direccion"] ?? "");
    $hora = trim($payload["hora"] ?? "Lo antes posible");
    $metodo = trim($payload["metodo"] ?? "EFECTIVO");
    $subtotal = 0;
    foreach ($payload["items"] as $item) {
        $subtotal += floatval($item["precio"]) * intval($item["cantidad"]);
    }
    $descuento = intval($payload["descuento"] ?? 0) ? $subtotal * 0.10 : 0;
    $delivery = $subtotal > 0 ? 5 : 0;
    $total = $subtotal - $descuento + $delivery;

    $usuarioIdNullable = $usuarioId > 0 ? $usuarioId : null;
    $stmt = $conn->prepare("INSERT INTO pedidos (usuario_id,cliente,direccion,hora_entrega,metodo_pago,subtotal,descuento,delivery,total,estado) VALUES (?,?,?,?,?,?,?,?,?, 'Pendiente')");
    $stmt->bind_param("issssdddd", $usuarioIdNullable, $cliente, $direccion, $hora, $metodo, $subtotal, $descuento, $delivery, $total);
    $stmt->execute();
    $pedidoId = $conn->insert_id;

    $itemStmt = $conn->prepare("INSERT INTO pedido_items (pedido_id,nombre,precio,cantidad) VALUES (?,?,?,?)");
    foreach ($payload["items"] as $item) {
        $nombre = trim($item["nombre"]);
        $precio = floatval($item["precio"]);
        $cantidad = max(1, intval($item["cantidad"]));
        $itemStmt->bind_param("isdi", $pedidoId, $nombre, $precio, $cantidad);
        $itemStmt->execute();
    }
    echo json_encode(["ok" => true, "pedido_id" => $pedidoId]);
    exit;
}

if (empty($_SESSION["admin_id"])) {
    http_response_code(401);
    echo json_encode(["ok" => false, "message" => "Sesión administrativa requerida"]);
    exit;
}

if ($action === "update_status") {
    $id = intval($_POST["id"] ?? 0);
    $estado = trim($_POST["estado"] ?? "");
    $permitidos = ["Pendiente","Confirmado","En reparto","Entregado","Cancelado"];
    if ($id > 0 && in_array($estado, $permitidos, true)) {
        $stmt = $conn->prepare("UPDATE pedidos SET estado=? WHERE id=?");
        $stmt->bind_param("si", $estado, $id);
        $stmt->execute();
        echo json_encode(["ok" => true]);
    } else {
        echo json_encode(["ok" => false, "message" => "Datos inválidos"]);
    }
    exit;
}

if ($action === "users") {
    $usuarios = [];
    $resultado = $conn->query("SELECT id,usuario,nombre,email,telefono,direccion,creado_en FROM usuarios ORDER BY id DESC");
    while ($fila = $resultado->fetch_assoc()) $usuarios[] = $fila;
    echo json_encode(["ok"=>true,"usuarios"=>$usuarios]);
    exit;
}

if ($action === "products") {
    $productos = [];
    $resultado = $conn->query("SELECT id,nombre,categoria,descripcion,precio,imagen,stock,activo FROM productos ORDER BY categoria ASC, nombre ASC");
    while ($fila = $resultado->fetch_assoc()) $productos[] = $fila;
    echo json_encode(["ok"=>true,"productos"=>$productos]);
    exit;
}

if ($action === "save_product") {
    $id = intval($_POST["id"] ?? 0);
    $nombre = trim($_POST["nombre"] ?? "");
    $categoria = trim($_POST["categoria"] ?? "");
    $descripcion = trim($_POST["descripcion"] ?? "");
    $precio = floatval($_POST["precio"] ?? 0);
    $imagen = trim($_POST["imagen"] ?? "imagenes/logo.png");
    $stock = intval($_POST["stock"] ?? 0);
    $activo = intval($_POST["activo"] ?? 1);
    if ($nombre === "" || $categoria === "" || $precio < 0) {
        echo json_encode(["ok"=>false,"message"=>"Completa los datos del producto"]);
        exit;
    }
    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE productos SET nombre=?,categoria=?,descripcion=?,precio=?,imagen=?,stock=?,activo=? WHERE id=?");
        $stmt->bind_param("sssssiii", $nombre,$categoria,$descripcion,$precio,$imagen,$stock,$activo,$id);
    } else {
        $stmt = $conn->prepare("INSERT INTO productos (nombre,categoria,descripcion,precio,imagen,stock,activo) VALUES (?,?,?,?,?,?,?)");
        $stmt->bind_param("sssssii", $nombre,$categoria,$descripcion,$precio,$imagen,$stock,$activo);
    }
    $stmt->execute();
    echo json_encode(["ok"=>true]);
    exit;
}

if ($action === "delete_product") {
    $id = intval($_POST["id"] ?? 0);
    $stmt = $conn->prepare("DELETE FROM productos WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(["ok"=>true]);
    exit;
}

if ($action === "offers") {
    $ofertas = [];
    $resultado = $conn->query("SELECT id,nombre,descripcion,imagen,precio_original,precio_oferta,etiqueta,activo FROM ofertas ORDER BY id ASC");
    while ($fila = $resultado->fetch_assoc()) $ofertas[] = $fila;
    echo json_encode(["ok"=>true,"ofertas"=>$ofertas]);
    exit;
}

if ($action === "save_offer") {
    $id = intval($_POST["id"] ?? 0);
    $nombre = trim($_POST["nombre"] ?? "");
    $descripcion = trim($_POST["descripcion"] ?? "");
    $imagen = trim($_POST["imagen"] ?? "imagenes/ofertas/oferta.png");
    $original = floatval($_POST["precio_original"] ?? 0);
    $oferta = floatval($_POST["precio_oferta"] ?? 0);
    $etiqueta = trim($_POST["etiqueta"] ?? "OFERTA");
    $activo = intval($_POST["activo"] ?? 1);
    if ($nombre === "" || $oferta < 0) {
        echo json_encode(["ok"=>false,"message"=>"Completa los datos de la oferta"]);
        exit;
    }
    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE ofertas SET nombre=?,descripcion=?,imagen=?,precio_original=?,precio_oferta=?,etiqueta=?,activo=? WHERE id=?");
        $stmt->bind_param("sssddsii",$nombre,$descripcion,$imagen,$original,$oferta,$etiqueta,$activo,$id);
    } else {
        $stmt = $conn->prepare("INSERT INTO ofertas (nombre,descripcion,imagen,precio_original,precio_oferta,etiqueta,activo) VALUES (?,?,?,?,?,?,?)");
        $stmt->bind_param("sssddsi",$nombre,$descripcion,$imagen,$original,$oferta,$etiqueta,$activo);
    }
    $stmt->execute();
    echo json_encode(["ok"=>true]);
    exit;
}

if ($action === "delete_offer") {
    $id = intval($_POST["id"] ?? 0);
    $stmt = $conn->prepare("DELETE FROM ofertas WHERE id=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();
    echo json_encode(["ok"=>true]);
    exit;
}

if ($action === "content") {
    $contenido = [];
    $resultado = $conn->query("SELECT clave,contenido FROM contenido_sitio");
    while ($fila = $resultado->fetch_assoc()) $contenido[$fila["clave"]] = $fila["contenido"];
    echo json_encode(["ok"=>true,"contenido"=>$contenido]);
    exit;
}

if ($action === "save_content") {
    $campos = ["about_hero","about_mision","about_vision","about_address","about_phone","about_email","about_whatsapp"];
    $stmt = $conn->prepare("INSERT INTO contenido_sitio (clave,contenido) VALUES (?,?) ON DUPLICATE KEY UPDATE contenido=VALUES(contenido)");
    foreach ($campos as $clave) {
        $valor = trim($_POST[$clave] ?? "");
        $stmt->bind_param("ss",$clave,$valor);
        $stmt->execute();
    }
    echo json_encode(["ok"=>true]);
    exit;
}

if ($action === "import_catalog") {
    $categorias = [
        "categoria_abarrotes.html" => "Abarrotes",
        "categoria_bebidas.html" => "Bebidas",
        "categoria_frutas.html" => "Frutas y Verduras",
        "categoria_lacteos.html" => "Lácteos",
        "categoria_licores.html" => "Licores",
        "categoria_limpieza.html" => "Limpieza",
        "categoria_cuidado.html" => "Cuidado Personal",
        "categoria_medicinas.html" => "Medicinas",
        "categoria_mascotas.html" => "Mascotas",
        "categoria_snacks.html" => "Snacks"
    ];
    $importados = 0;
    $actualizados = 0;
    $upsert = $conn->prepare("SELECT id,stock FROM productos WHERE nombre=? AND categoria=? LIMIT 1");
    $insert = $conn->prepare("INSERT INTO productos (nombre,categoria,descripcion,precio,imagen,stock,activo) VALUES (?,?,?,?,?,?,1)");
    $update = $conn->prepare("UPDATE productos SET descripcion=?,precio=?,imagen=?,activo=1 WHERE id=?");

    foreach ($categorias as $archivo => $categoria) {
        $ruta = __DIR__ . DIRECTORY_SEPARATOR . $archivo;
        if (!is_file($ruta)) continue;
        $html = file_get_contents($ruta);
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML($html);
        $xpath = new DOMXPath($dom);
        $cards = $xpath->query("//*[contains(concat(' ',normalize-space(@class),' '),' card-pro ')]");
        foreach ($cards as $card) {
            $nombreNodo = $xpath->query(".//*[self::h4 or contains(concat(' ',normalize-space(@class),' '),' producto-nombre ')]",$card)->item(0);
            $imagenNodo = $xpath->query(".//img",$card)->item(0);
            $precioNodo = $xpath->query(".//*[contains(concat(' ',normalize-space(@class),' '),' precio ')]",$card)->item(0);
            $descripcionNodo = $xpath->query(".//*[contains(concat(' ',normalize-space(@class),' '),' descripcion ')]",$card)->item(0);
            if (!$nombreNodo || !$precioNodo) continue;
            $nombre = trim(preg_replace("/\s+/u"," ",$nombreNodo->textContent));
            $precioTexto = preg_replace("/[^0-9.,]/u","",$precioNodo->textContent);
            $precio = floatval(str_replace(",",".",$precioTexto));
            $imagen = $imagenNodo ? trim($imagenNodo->getAttribute("src")) : "imagenes/logo.png";
            $descripcion = $descripcionNodo ? trim(preg_replace("/\s+/u"," ",$descripcionNodo->textContent)) : "";
            if ($nombre === "" || $precio <= 0) continue;

            $upsert->bind_param("ss",$nombre,$categoria);
            $upsert->execute();
            $existente = $upsert->get_result()->fetch_assoc();
            if ($existente) {
                $id = intval($existente["id"]);
                $update->bind_param("sdsi",$descripcion,$precio,$imagen,$id);
                $update->execute();
                $actualizados++;
            } else {
                $stock = 30;
                $insert->bind_param("sssdsi",$nombre,$categoria,$descripcion,$precio,$imagen,$stock);
                $insert->execute();
                $importados++;
            }
        }
    }
    echo json_encode(["ok"=>true,"importados"=>$importados,"actualizados"=>$actualizados]);
    exit;
}

if ($action === "dashboard") {
    $pendientes = $conn->query("SELECT COUNT(*) FROM pedidos WHERE estado='Pendiente'")->fetch_row()[0];
    $hoy = $conn->query("SELECT COUNT(*) FROM pedidos WHERE DATE(creado_en)=CURDATE()")->fetch_row()[0];
    $ventas = $conn->query("SELECT COALESCE(SUM(total),0) FROM pedidos WHERE estado!='Cancelado'")->fetch_row()[0];
    $usuarios = $conn->query("SELECT COUNT(*) FROM usuarios")->fetch_row()[0];
    $productos = $conn->query("SELECT COUNT(*) FROM productos WHERE activo=1")->fetch_row()[0];
    $pedidos = [];
    $resultado = $conn->query("SELECT id,cliente,direccion,hora_entrega,metodo_pago,subtotal,descuento,delivery,total,estado,creado_en FROM pedidos ORDER BY creado_en DESC LIMIT 100");
    while ($fila = $resultado->fetch_assoc()) $pedidos[] = $fila;
    echo json_encode(["ok"=>true,"pendientes"=>intval($pendientes),"hoy"=>intval($hoy),"ventas"=>floatval($ventas),"usuarios"=>intval($usuarios),"productos"=>intval($productos),"pedidos"=>$pedidos]);
    exit;
}

echo json_encode(["ok"=>false,"message"=>"Acción no válida"]);
