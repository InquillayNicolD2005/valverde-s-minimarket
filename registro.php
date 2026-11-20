<?php
include("conexion.php");
$conn->set_charset("utf8mb4");

$conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(150) NOT NULL DEFAULT ''");
$conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(150) NOT NULL DEFAULT ''");
$conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30) NOT NULL DEFAULT ''");
$conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion VARCHAR(255) NOT NULL DEFAULT ''");
$conn->query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

$usuario = trim($_POST["usuario"] ?? "");
$nombre = trim($_POST["nombre"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefono = trim($_POST["telefono"] ?? "");
$direccion = trim($_POST["direccion"] ?? "");
$password = $_POST["password"] ?? "";

$error = "";
$nombreCompleto = $nombre !== "" ? $nombre : $usuario;

if (strlen($usuario) < 3) {
    $error = "El usuario debe tener al menos 3 caracteres.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error = "Ingresa un correo electrónico válido.";
} elseif (strlen($password) < 6) {
    $error = "La contraseña debe tener al menos 6 caracteres.";
} else {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO usuarios (usuario,nombre,email,telefono,direccion,contrasena) VALUES (?,?,?,?,?,?)");
    $stmt->bind_param("ssssss", $usuario, $nombreCompleto, $email, $telefono, $direccion, $passwordHash);
    if (!$stmt->execute()) {
        $error = str_contains($conn->error, "Duplicate") ? "Ese usuario o correo ya está registrado." : "No se pudo crear la cuenta.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= $error ? "Revisa tu registro" : "Cuenta creada" ?> | Valverde's</title>
<link rel="stylesheet" href="estilos/estilos_principales.css">
<style>
.account-result{min-height:100vh;display:grid;place-items:center}.account-result-card{width:min(440px,calc(100% - 30px));border:1px solid var(--border);border-radius:24px;background:white;padding:34px;text-align:center;box-shadow:var(--shadow-md)}.account-result-icon{width:72px;height:72px;margin:auto;display:grid;place-items:center;border-radius:50%;background:var(--primary-soft);color:var(--primary);font-size:34px}.account-result-card h1{margin:18px 0 8px}.account-result-card p{color:var(--muted)}.account-result-card a{display:block;border-radius:12px;background:var(--primary);color:white;padding:13px;text-decoration:none;font-weight:900;margin-top:18px}.account-result-card a.secondary{border:1px solid var(--border);background:white;color:var(--ink)}.account-result-icon.error{background:#fbe9e7;color:#9d3c33}
</style>
</head>
<body><main class="account-result"><div class="account-result-card"><div class="account-result-icon <?= $error ? "error" : "" ?>"><?= $error ? "!" : "✓" ?></div><h1><?= $error ? "No pudimos crear tu cuenta" : "¡Cuenta creada!" ?></h1><p><?= htmlspecialchars($error ?: "Ya puedes iniciar sesión y comprar más rápido.") ?></p><a href="<?= $error ? "registro.html" : "login.html" ?>"><?= $error ? "Volver al registro" : "Iniciar sesión" ?></a><?php if (!$error): ?><a class="secondary" href="index.html">Ir al inicio</a><?php endif; ?></div></main></body>
</html>