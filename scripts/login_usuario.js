function iniciarSesion() {
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("clave").value;
    if (user === "cliente" && pass === "1234") {
        fetch('http://localhost/valverdes_api/usuarios.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: user, email: 'cliente@example.com' })
        }).then(res => {
            if (!res.ok) throw new Error('Error en la respuesta');
            return res.json();
        }).then(data => {
            alert("Bienvenido, ID: " + data.id);
            window.location.href = "index.html";
        }).catch(err => {
            alert("Error al conectar: " + err.message);
        });
    } else {
        alert("Error");
    }
}