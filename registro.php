<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$sql = "INSERT INTO usuarios (usuario, contraseña) 
        VALUES ('$usuario', '$password')";

if ($conn->query($sql) === TRUE) {
    echo "Usuario registrado correctamente";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>