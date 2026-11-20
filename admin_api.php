<?php
header("Content-Type: application/json; charset=utf-8");
session_start();

include("conexion.php");
$conn->set_charset("utf8mb4");

function ensure_schema($conn) {
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
}

ensure_schema($conn);

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

    $stmt = $conn->prepare("INSERT INTO pedidos (cliente,direccion,hora_entrega,metodo_pago,subtotal,descuento,delivery,total,estado) VALUES (?,?,?,?,?,?,?,?, 'Pendiente')");
    $stmt->bind_param("ssssdddd", $cliente, $direccion, $hora, $metodo, $subtotal, $descuento, $delivery, $total);
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

if ($action === "dashboard") {
    $pendientes = $conn->query("SELECT COUNT(*) FROM pedidos WHERE estado='Pendiente'")->fetch_row()[0];
    $hoy = $conn->query("SELECT COUNT(*) FROM pedidos WHERE DATE(creado_en)=CURDATE()")->fetch_row()[0];
    $ventas = $conn->query("SELECT COALESCE(SUM(total),0) FROM pedidos WHERE estado!='Cancelado'")->fetch_row()[0];
    $pedidos = [];
    $resultado = $conn->query("SELECT id,cliente,direccion,hora_entrega,metodo_pago,subtotal,descuento,delivery,total,estado,creado_en FROM pedidos ORDER BY creado_en DESC LIMIT 100");
    while ($fila = $resultado->fetch_assoc()) $pedidos[] = $fila;
    echo json_encode(["ok"=>true,"pendientes"=>intval($pendientes),"hoy"=>intval($hoy),"ventas"=>floatval($ventas),"pedidos"=>$pedidos]);
    exit;
}

echo json_encode(["ok"=>false,"message"=>"Acción no válida"]);
