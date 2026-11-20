<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$stmt = $conn->prepare("INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)");
$stmt->bind_param("ss", $usuario, $password);

if ($stmt->execute()) {
    echo "Usuario registrado correctamente";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>