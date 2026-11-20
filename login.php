<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$sql = "SELECT * FROM usuarios WHERE usuario='$usuario' AND contraseña='$password'";
$result = $conn->query($sql);

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