<?php
include("conexion.php");
$conn->set_charset("utf8mb4");

$conn->query("CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB");

$usuario = "admin";
$email = "admin@valverdes.local";
$nombre = "Administrador";
$password = password_hash("admin123", PASSWORD_DEFAULT);

$stmt = $conn->prepare("SELECT id FROM administradores WHERE usuario=? OR email=?");
$stmt->bind_param("ss", $usuario, $email);
$stmt->execute();
$existe = $stmt->get_result()->num_rows > 0;

if (!$existe) {
    $stmt = $conn->prepare("INSERT INTO administradores (usuario,email,contrasena,nombre) VALUES (?,?,?,?)");
    $stmt->bind_param("ssss", $usuario, $email, $password, $nombre);
    $stmt->execute();
    echo "Administrador creado: admin / admin123";
} else {
    echo "El administrador inicial ya existe";
}
