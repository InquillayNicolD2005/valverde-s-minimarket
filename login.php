<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, usuario, contrasena FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuarioEncontrado = $result->fetch_assoc();
    $passwordValido = password_verify($password, $usuarioEncontrado["contrasena"]);

    if (!$passwordValido && hash_equals($usuarioEncontrado["contrasena"], $password)) {
        $passwordValido = true;
    }
}

if (isset($passwordValido) && $passwordValido) {
    // LOGIN CORRECTO
    echo "<script>
        localStorage.setItem('usuarioLogeado', JSON.stringify({nombre: " . json_encode($usuarioEncontrado["usuario"]) . "}));
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