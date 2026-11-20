<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ? AND contrasena = ?");
$stmt->bind_param("ss", $usuario, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // LOGIN CORRECTO
    echo "<script>
        alert('Bienvenido $usuario');
        window.location.href='index.html';
    </script>";
} else {
    // ERROR
    echo "<script>
        alert('Usuario o contraseña incorrectos');
        window.location.href='login.html';
    </script>";
}
?>