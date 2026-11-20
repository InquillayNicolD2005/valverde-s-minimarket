<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, usuario, nombre, email, telefono, direccion, contrasena FROM usuarios WHERE usuario = ?");
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
    $perfil = [
        "id" => intval($usuarioEncontrado["id"]),
        "nombre" => $usuarioEncontrado["nombre"] ?: $usuarioEncontrado["usuario"],
        "usuario" => $usuarioEncontrado["usuario"],
        "email" => $usuarioEncontrado["email"] ?? "",
        "telefono" => $usuarioEncontrado["telefono"] ?? "",
        "direccion" => $usuarioEncontrado["direccion"] ?? ""
    ];
    echo "<script>
        localStorage.setItem('usuarioLogeado', " . json_encode(json_encode($perfil), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ");
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